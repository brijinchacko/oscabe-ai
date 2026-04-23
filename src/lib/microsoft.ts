import prisma from "@/lib/prisma";

const MICROSOFT_AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0";
const GRAPH_API = "https://graph.microsoft.com/v1.0";

const SCOPES = [
  "openid",
  "profile",
  "email",
  "Mail.Read",
  "Mail.Send",
  "Calendars.ReadWrite",
  "Presence.Read",
  "User.Read",
  "offline_access",
].join(" ");

// ─── Configuration ─────────────────────────────────────────────────────

export function isMicrosoftConfigured(): boolean {
  return !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
}

export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: "code",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/microsoft/callback`,
    scope: SCOPES,
    state,
    response_mode: "query",
  });
  return `${MICROSOFT_AUTH_URL}/authorize?${params}`;
}

// ─── Token Exchange ────────────────────────────────────────────────────

export async function exchangeCode(code: string) {
  if (!isMicrosoftConfigured()) {
    return {
      access_token: "mock_access_token",
      refresh_token: "mock_refresh_token",
      expires_in: 3600,
    };
  }

  const res = await fetch(`${MICROSOFT_AUTH_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/microsoft/callback`,
      grant_type: "authorization_code",
      scope: SCOPES,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  return res.json();
}

export async function refreshAccessToken(refreshToken: string) {
  if (!isMicrosoftConfigured()) {
    return {
      access_token: "mock_access_token",
      refresh_token: "mock_refresh_token",
      expires_in: 3600,
    };
  }

  const res = await fetch(`${MICROSOFT_AUTH_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      scope: SCOPES,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  return res.json();
}

// ─── Graph Client (get valid token) ────────────────────────────────────

export async function getGraphClient(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      microsoftAccessToken: true,
      microsoftRefreshToken: true,
      microsoftTokenExpiry: true,
      microsoftConnected: true,
    },
  });

  if (!user?.microsoftConnected || !user.microsoftAccessToken) {
    return null;
  }

  // Check if token is expired (5 min buffer)
  const now = new Date();
  const expiry = user.microsoftTokenExpiry ? new Date(user.microsoftTokenExpiry) : new Date(0);
  if (expiry.getTime() - now.getTime() < 5 * 60 * 1000 && user.microsoftRefreshToken) {
    try {
      const tokens = await refreshAccessToken(user.microsoftRefreshToken);
      const newExpiry = new Date(Date.now() + tokens.expires_in * 1000);
      await prisma.user.update({
        where: { id: userId },
        data: {
          microsoftAccessToken: tokens.access_token,
          microsoftRefreshToken: tokens.refresh_token || user.microsoftRefreshToken,
          microsoftTokenExpiry: newExpiry,
        },
      });
      return tokens.access_token;
    } catch {
      // Token refresh failed - mark as disconnected
      await prisma.user.update({
        where: { id: userId },
        data: { microsoftConnected: false },
      });
      return null;
    }
  }

  return user.microsoftAccessToken;
}

async function graphFetch(token: string, path: string, options?: RequestInit) {
  const res = await fetch(`${GRAPH_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Graph API error (${res.status}): ${err}`);
  }

  return res.json();
}

// ─── Mock Data ─────────────────────────────────────────────────────────

const MOCK_EMAILS = [
  {
    id: "mock-1",
    subject: "Re: Interview Schedule for Senior Engineer",
    from: { emailAddress: { name: "John Smith", address: "john@example.com" } },
    toRecipients: [{ emailAddress: { name: "You", address: "me@example.com" } }],
    receivedDateTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    bodyPreview: "Thanks for confirming the interview. I will be available at the proposed time...",
    isRead: false,
    body: { contentType: "text", content: "Thanks for confirming the interview. I will be available at the proposed time on Thursday at 2pm." },
    conversationId: "conv-1",
  },
  {
    id: "mock-2",
    subject: "New Job Requirement - PLC Engineer",
    from: { emailAddress: { name: "Sarah Johnson", address: "sarah@clientcorp.com" } },
    toRecipients: [{ emailAddress: { name: "You", address: "me@example.com" } }],
    receivedDateTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    bodyPreview: "Hi, we have a new opening for a PLC Engineer role. Could you please share...",
    isRead: true,
    body: { contentType: "text", content: "Hi, we have a new opening for a PLC Engineer role. Could you please share some candidates?" },
    conversationId: "conv-2",
  },
  {
    id: "mock-3",
    subject: "Candidate CV - Maria Garcia",
    from: { emailAddress: { name: "Maria Garcia", address: "maria@candidate.com" } },
    toRecipients: [{ emailAddress: { name: "You", address: "me@example.com" } }],
    receivedDateTime: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    bodyPreview: "Please find attached my updated CV for the SCADA Developer position...",
    isRead: true,
    body: { contentType: "text", content: "Please find attached my updated CV for the SCADA Developer position. I have 5 years of experience..." },
    conversationId: "conv-3",
  },
  {
    id: "mock-4",
    subject: "Placement Confirmation",
    from: { emailAddress: { name: "HR Department", address: "hr@megacorp.com" } },
    toRecipients: [{ emailAddress: { name: "You", address: "me@example.com" } }],
    receivedDateTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    bodyPreview: "We are pleased to confirm the placement of James Wilson as the new...",
    isRead: true,
    body: { contentType: "text", content: "We are pleased to confirm the placement of James Wilson as the new Automation Engineer starting March 15." },
    conversationId: "conv-4",
  },
  {
    id: "mock-5",
    subject: "Follow-up: Contract Terms Discussion",
    from: { emailAddress: { name: "Legal Team", address: "legal@clientcorp.com" } },
    toRecipients: [{ emailAddress: { name: "You", address: "me@example.com" } }],
    receivedDateTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    bodyPreview: "Following our meeting, please find the updated contract terms for review...",
    isRead: true,
    body: { contentType: "text", content: "Following our meeting, please find the updated contract terms for review. The fee structure has been updated." },
    conversationId: "conv-5",
  },
];

const MOCK_PRESENCE = {
  availability: "Available",
  activity: "Available",
};

const MOCK_PROFILE = {
  displayName: "Demo User",
  mail: "demo@oscabe.com",
  jobTitle: "Recruitment Consultant",
  officeLocation: "London",
};

const MOCK_CALENDAR_EVENTS = [
  {
    id: "evt-1",
    subject: "Interview - Senior PLC Engineer",
    start: { dateTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), timeZone: "UTC" },
    end: { dateTime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), timeZone: "UTC" },
    location: { displayName: "Teams Meeting" },
    isOnlineMeeting: true,
    organizer: { emailAddress: { name: "You", address: "me@example.com" } },
  },
  {
    id: "evt-2",
    subject: "Client Call - MegaCorp",
    start: { dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), timeZone: "UTC" },
    end: { dateTime: new Date(Date.now() + 1000 * 60 * 60 * 25).toISOString(), timeZone: "UTC" },
    location: { displayName: "Phone" },
    isOnlineMeeting: false,
    organizer: { emailAddress: { name: "Sarah Johnson", address: "sarah@clientcorp.com" } },
  },
];

// ─── Email Functions ───────────────────────────────────────────────────

export async function getEmails(
  userId: string,
  query?: string,
  top: number = 10,
  skip: number = 0,
  folder: string = "inbox"
) {
  const token = await getGraphClient(userId);
  if (!token) {
    // Return mock data when not configured
    let emails = [...MOCK_EMAILS];
    if (query) {
      const q = query.toLowerCase();
      emails = emails.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.bodyPreview.toLowerCase().includes(q) ||
          e.from.emailAddress.address.toLowerCase().includes(q)
      );
    }
    return { value: emails.slice(skip, skip + top), "@odata.count": emails.length };
  }

  const folderPath = folder === "sent" ? "/me/mailFolders/sentitems/messages" : "/me/messages";
  let url = `${folderPath}?$top=${top}&$skip=${skip}&$orderby=receivedDateTime desc&$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,isRead,conversationId`;

  if (query) {
    url += `&$search="${encodeURIComponent(query)}"`;
  }

  return graphFetch(token, url);
}

export async function sendEmail(
  userId: string,
  to: string,
  subject: string,
  body: string
) {
  const token = await getGraphClient(userId);
  if (!token) {
    // Mock: return success
    return { id: `mock-sent-${Date.now()}`, status: "sent" };
  }

  return graphFetch(token, "/me/sendMail", {
    method: "POST",
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "HTML", content: body },
        toRecipients: [{ emailAddress: { address: to } }],
      },
      saveToSentItems: true,
    }),
  });
}

/**
 * Send an email via the Microsoft Graph API from the user's connected Outlook account.
 * Auto-refreshes tokens if expired.
 */
export async function sendEmailViaGraph(
  userId: string,
  to: string,
  subject: string,
  body: string,
  cc?: string,
  bcc?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const token = await getGraphClient(userId);
    if (!token) {
      return { success: false, error: "Microsoft account not connected or token unavailable" };
    }

    const message: Record<string, unknown> = {
      subject,
      body: { contentType: "HTML", content: body },
      toRecipients: to.split(",").map((addr) => ({
        emailAddress: { address: addr.trim() },
      })),
    };

    if (cc) {
      message.ccRecipients = cc.split(",").map((addr) => ({
        emailAddress: { address: addr.trim() },
      }));
    }

    if (bcc) {
      message.bccRecipients = bcc.split(",").map((addr) => ({
        emailAddress: { address: addr.trim() },
      }));
    }

    const res = await fetch(`${GRAPH_API}/me/sendMail`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        saveToSentItems: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Graph sendMail error (${res.status}):`, errText);
      return { success: false, error: `Graph API error: ${res.status}` };
    }

    // Graph sendMail returns 202 Accepted with no body on success
    // The message ID is not returned directly, generate a reference
    return { success: true, messageId: `outlook-${Date.now()}` };
  } catch (err) {
    console.error("sendEmailViaGraph error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error sending via Outlook",
    };
  }
}

export async function getEmailThread(userId: string, messageId: string) {
  const token = await getGraphClient(userId);
  if (!token) {
    const email = MOCK_EMAILS.find((e) => e.id === messageId);
    if (!email) return { value: [] };
    // Return mock thread
    return {
      value: [
        email,
        {
          id: `${messageId}-reply`,
          subject: `Re: ${email.subject}`,
          from: { emailAddress: { name: "You", address: "me@example.com" } },
          toRecipients: [email.from],
          receivedDateTime: new Date(new Date(email.receivedDateTime).getTime() - 1000 * 60 * 60).toISOString(),
          bodyPreview: "Sure, let me check on that and get back to you.",
          isRead: true,
          body: { contentType: "text", content: "Sure, let me check on that and get back to you." },
          conversationId: email.conversationId,
        },
      ],
    };
  }

  // First get the conversation ID from the message
  const message = await graphFetch(token, `/me/messages/${messageId}?$select=conversationId`);
  // Then get all messages in the conversation
  return graphFetch(
    token,
    `/me/messages?$filter=conversationId eq '${message.conversationId}'&$orderby=receivedDateTime desc&$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,isRead,body,conversationId`
  );
}

// ─── Presence/Status ───────────────────────────────────────────────────

export async function getPresence(userId: string) {
  const token = await getGraphClient(userId);
  if (!token) {
    return MOCK_PRESENCE;
  }

  return graphFetch(token, "/me/presence");
}

export async function getUserProfile(userId: string) {
  const token = await getGraphClient(userId);
  if (!token) {
    return MOCK_PROFILE;
  }

  return graphFetch(token, "/me?$select=displayName,mail,jobTitle,officeLocation");
}

// ─── Calendar ──────────────────────────────────────────────────────────

export async function getCalendarEvents(
  userId: string,
  startDate: string,
  endDate: string
) {
  const token = await getGraphClient(userId);
  if (!token) {
    return { value: MOCK_CALENDAR_EVENTS };
  }

  return graphFetch(
    token,
    `/me/calendarview?startDateTime=${startDate}&endDateTime=${endDate}&$orderby=start/dateTime&$select=id,subject,start,end,location,isOnlineMeeting,organizer&$top=50`
  );
}

// ─── Create Calendar Event ────────────────────────────────────────────

export async function createCalendarEvent(
  userId: string,
  event: {
    subject: string;
    body?: string;
    start: string; // ISO datetime
    end: string;   // ISO datetime
    attendees: string[];
    isOnlineMeeting?: boolean;
    location?: string;
  }
): Promise<{ id?: string; webLink?: string; onlineMeetingUrl?: string; error?: string }> {
  const token = await getGraphClient(userId);
  if (!token) {
    // Mock: return a fake event
    return {
      id: `mock-evt-${Date.now()}`,
      webLink: "https://teams.microsoft.com/mock-meeting",
      onlineMeetingUrl: "https://teams.microsoft.com/mock-meeting",
    };
  }

  try {
    const result = await graphFetch(token, "/me/events", {
      method: "POST",
      body: JSON.stringify({
        subject: event.subject,
        body: event.body
          ? { contentType: "HTML", content: event.body }
          : undefined,
        start: { dateTime: event.start, timeZone: "UTC" },
        end: { dateTime: event.end, timeZone: "UTC" },
        attendees: event.attendees.map((email) => ({
          emailAddress: { address: email },
          type: "required",
        })),
        isOnlineMeeting: event.isOnlineMeeting ?? true,
        onlineMeetingProvider: "teamsForBusiness",
        location: event.location
          ? { displayName: event.location }
          : undefined,
      }),
    });

    return {
      id: result.id,
      webLink: result.webLink,
      onlineMeetingUrl: result.onlineMeeting?.joinUrl || result.onlineMeetingUrl,
    };
  } catch (err) {
    console.error("createCalendarEvent error:", err);
    return {
      error: err instanceof Error ? err.message : "Failed to create calendar event",
    };
  }
}

// ─── Delete Calendar Event ────────────────────────────────────────────

export async function deleteCalendarEvent(
  userId: string,
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  const token = await getGraphClient(userId);
  if (!token) {
    return { success: true }; // Mock
  }

  try {
    const res = await fetch(`${GRAPH_API}/me/events/${eventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok && res.status !== 204) {
      const err = await res.text();
      return { success: false, error: err };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete event",
    };
  }
}

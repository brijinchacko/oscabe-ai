/**
 * Instantly.ai API client for email campaign management.
 *
 * Uses INSTANTLY_API_KEY environment variable. When the key is not
 * configured, all functions return realistic mock data so the rest of
 * the app can operate in demo / development mode.
 */

const INSTANTLY_BASE_URL = "https://api.instantly.ai";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InstantlyCampaign {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed" | "error";
  created_at: string;
  updated_at: string;
}

export interface InstantlyLead {
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  custom_variables?: Record<string, string>;
}

export interface InstantlyAnalytics {
  campaign_id: string;
  total_leads: number;
  contacted: number;
  emails_sent: number;
  emails_opened: number;
  emails_replied: number;
  emails_bounced: number;
  open_rate: number;
  reply_rate: number;
  bounce_rate: number;
}

export interface InstantlyReply {
  id: string;
  campaign_id: string;
  lead_email: string;
  lead_name: string;
  subject: string;
  body: string;
  received_at: string;
  is_read: boolean;
}

export interface CreateCampaignData {
  name: string;
  /** Sender email addresses */
  from_emails?: string[];
  /** Email subject lines (can include A/B variants) */
  subject_lines?: string[];
  /** Email body sequences - each entry is a step in the sequence */
  sequences?: Array<{
    subject: string;
    body: string;
    delay_days?: number;
  }>;
  /** Schedule settings */
  schedule?: {
    timezone?: string;
    days?: number[];
    start_hour?: number;
    end_hour?: number;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getApiKey(): string | undefined {
  return process.env.INSTANTLY_API_KEY;
}

function isConfigured(): boolean {
  return !!getApiKey();
}

async function instantlyFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = new URL(path, INSTANTLY_BASE_URL);
  url.searchParams.set("api_key", getApiKey()!);

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Instantly API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_CAMPAIGN: InstantlyCampaign = {
  id: "mock-campaign-001",
  name: "UK Hiring Managers - Q1 Outreach",
  status: "draft",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_ANALYTICS: InstantlyAnalytics = {
  campaign_id: "mock-campaign-001",
  total_leads: 150,
  contacted: 120,
  emails_sent: 340,
  emails_opened: 187,
  emails_replied: 34,
  emails_bounced: 5,
  open_rate: 55.0,
  reply_rate: 10.0,
  bounce_rate: 1.5,
};

const MOCK_REPLIES: InstantlyReply[] = [
  {
    id: "mock-reply-1",
    campaign_id: "mock-campaign-001",
    lead_email: "s.mitchell@techrecruit.co.uk",
    lead_name: "Sarah Mitchell",
    subject: "Re: Streamline your hiring pipeline",
    body: "Hi, this looks interesting. Could we schedule a call next week to discuss?",
    received_at: new Date(Date.now() - 3600_000).toISOString(),
    is_read: false,
  },
  {
    id: "mock-reply-2",
    campaign_id: "mock-campaign-001",
    lead_email: "james.patel@innovatech.co.uk",
    lead_name: "James Patel",
    subject: "Re: Streamline your hiring pipeline",
    body: "Thanks for reaching out but we are not looking for this at the moment.",
    received_at: new Date(Date.now() - 7200_000).toISOString(),
    is_read: true,
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a new email campaign in Instantly.
 *
 * @param data - Campaign configuration
 * @returns The created campaign
 */
export async function createCampaign(
  data: CreateCampaignData
): Promise<InstantlyCampaign> {
  if (!isConfigured()) {
    console.warn(
      "[instantly] INSTANTLY_API_KEY not configured - returning mock campaign"
    );
    return { ...MOCK_CAMPAIGN, name: data.name };
  }

  try {
    const result = await instantlyFetch<InstantlyCampaign>(
      "/api/v1/campaign/create",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return result;
  } catch (error) {
    console.error("[instantly] createCampaign failed:", error);
    throw error;
  }
}

/**
 * Add leads to an existing campaign.
 *
 * @param campaignId - The campaign to add leads to
 * @param leads - Array of leads to add
 * @returns Number of leads successfully added
 */
export async function addLeadsToCampaign(
  campaignId: string,
  leads: InstantlyLead[]
): Promise<{ leads_added: number }> {
  if (!isConfigured()) {
    console.warn(
      "[instantly] INSTANTLY_API_KEY not configured - returning mock lead count"
    );
    return { leads_added: leads.length };
  }

  try {
    const result = await instantlyFetch<{ leads_added: number }>(
      "/api/v1/lead/add",
      {
        method: "POST",
        body: JSON.stringify({
          campaign_id: campaignId,
          leads,
        }),
      }
    );
    return result;
  } catch (error) {
    console.error("[instantly] addLeadsToCampaign failed:", error);
    throw error;
  }
}

/**
 * Retrieve analytics for a campaign.
 *
 * @param campaignId - The campaign to get analytics for
 * @returns Campaign analytics including open/reply/bounce rates
 */
export async function getCampaignAnalytics(
  campaignId: string
): Promise<InstantlyAnalytics> {
  if (!isConfigured()) {
    console.warn(
      "[instantly] INSTANTLY_API_KEY not configured - returning mock analytics"
    );
    return { ...MOCK_ANALYTICS, campaign_id: campaignId };
  }

  try {
    const result = await instantlyFetch<InstantlyAnalytics>(
      `/api/v1/campaign/${campaignId}/analytics`
    );
    return result;
  } catch (error) {
    console.error("[instantly] getCampaignAnalytics failed:", error);
    throw error;
  }
}

/**
 * Fetch recent replies from the Instantly unibox.
 *
 * @returns Array of recent replies across all campaigns
 */
export async function getUniboxReplies(): Promise<InstantlyReply[]> {
  if (!isConfigured()) {
    console.warn(
      "[instantly] INSTANTLY_API_KEY not configured - returning mock replies"
    );
    return MOCK_REPLIES;
  }

  try {
    const result = await instantlyFetch<InstantlyReply[]>(
      "/api/v1/unibox/list"
    );
    return result;
  } catch (error) {
    console.error("[instantly] getUniboxReplies failed:", error);
    throw error;
  }
}

/**
 * Enable warm-up for an email sending account.
 *
 * @param accountId - The sending account ID to enable warm-up on
 * @returns Success status
 */
export async function enableWarmup(
  accountId: string
): Promise<{ success: boolean }> {
  if (!isConfigured()) {
    console.warn(
      "[instantly] INSTANTLY_API_KEY not configured - returning mock warmup response"
    );
    return { success: true };
  }

  try {
    const result = await instantlyFetch<{ success: boolean }>(
      "/api/v1/account/warmup/enable",
      {
        method: "POST",
        body: JSON.stringify({ account_id: accountId }),
      }
    );
    return result;
  } catch (error) {
    console.error("[instantly] enableWarmup failed:", error);
    throw error;
  }
}

/**
 * Check whether the Instantly API key is configured.
 */
export function isInstantlyConfigured(): boolean {
  return isConfigured();
}

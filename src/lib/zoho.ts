/**
 * Zoho Recruit API Client
 *
 * Handles OAuth 2.0 token refresh, rate limiting, and all
 * interactions with the Zoho Recruit v2 REST API.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ZohoTokenCache {
  accessToken: string;
  expiresAt: number; // epoch ms
}

interface ZohoFetchOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

interface ZohoListResponse<T = Record<string, unknown>> {
  data: T[];
  info?: {
    per_page: number;
    count: number;
    page: number;
    more_records: boolean;
  };
}

/* ------------------------------------------------------------------ */
/*  In-memory caches                                                   */
/* ------------------------------------------------------------------ */

let tokenCache: ZohoTokenCache | null = null;

/** Simple sliding-window rate limiter: timestamps of recent requests */
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 100;

/* ------------------------------------------------------------------ */
/*  Mock data (returned when Zoho is not configured)                   */
/* ------------------------------------------------------------------ */

const MOCK_CANDIDATES = [
  { id: "mock-1", First_Name: "Jane", Last_Name: "Doe", Email: "jane.doe@example.com", Phone: "555-0101", City: "London", Current_Job_Title: "Software Engineer", Experience_in_Years: "5", Skill_Set: "JavaScript, React, Node.js" },
  { id: "mock-2", First_Name: "John", Last_Name: "Smith", Email: "john.smith@example.com", Phone: "555-0102", City: "Manchester", Current_Job_Title: "Data Analyst", Experience_in_Years: "3", Skill_Set: "Python, SQL, Tableau" },
];

const MOCK_CLIENTS = [
  { id: "mock-c1", Client_Name: "Acme Corp", Industry: "Technology", Phone: "555-1000", Website: "https://acme.example.com" },
  { id: "mock-c2", Client_Name: "Global Finance Ltd", Industry: "Finance", Phone: "555-2000", Website: "https://globalfinance.example.com" },
];

const MOCK_CONTACTS = [
  { id: "mock-ct1", First_Name: "Alice", Last_Name: "Johnson", Email: "alice@acme.example.com", Phone: "555-3001", Client_Name: { name: "Acme Corp", id: "mock-c1" } },
  { id: "mock-ct2", First_Name: "Bob", Last_Name: "Williams", Email: "bob@globalfinance.example.com", Phone: "555-3002", Client_Name: { name: "Global Finance Ltd", id: "mock-c2" } },
];

const MOCK_JOBS = [
  { id: "mock-j1", Posting_Title: "Senior React Developer", Job_Description: "Build modern web apps", City: "London", State: "England", Country: "UK", Job_Type: "Full-time", Salary: "80000", Number_of_Positions: "2", Required_Skills: "React, TypeScript", Client_Name: { name: "Acme Corp", id: "mock-c1" } },
  { id: "mock-j2", Posting_Title: "Data Engineer", Job_Description: "Design data pipelines", City: "Remote", State: "", Country: "UK", Job_Type: "Contract", Salary: "600", Number_of_Positions: "1", Required_Skills: "Python, Spark, AWS", Client_Name: { name: "Global Finance Ltd", id: "mock-c2" } },
];

const MOCK_DATA: Record<string, unknown[]> = {
  Candidates: MOCK_CANDIDATES,
  Clients: MOCK_CLIENTS,
  Contacts: MOCK_CONTACTS,
  JobOpenings: MOCK_JOBS,
};

/* ------------------------------------------------------------------ */
/*  Configuration helpers                                              */
/* ------------------------------------------------------------------ */

export function isZohoConfigured(): boolean {
  return !!(
    process.env.ZOHO_CLIENT_ID &&
    process.env.ZOHO_CLIENT_SECRET &&
    process.env.ZOHO_REFRESH_TOKEN
  );
}

function getZohoDomain(): string {
  // For Zoho Recruit India, the correct domain is recruit.zoho.in
  return process.env.ZOHO_DOMAIN || "https://recruit.zoho.in";
}

function getAccountsDomain(): string {
  return process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.in";
}

/* ------------------------------------------------------------------ */
/*  Rate limiter                                                       */
/* ------------------------------------------------------------------ */

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  // Remove timestamps older than 1 minute
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 60_000) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestInWindow = requestTimestamps[0];
    const waitMs = oldestInWindow + 60_000 - now + 50; // small buffer
    await new Promise((r) => setTimeout(r, waitMs));
  }

  requestTimestamps.push(Date.now());
}

/* ------------------------------------------------------------------ */
/*  OAuth Access Token                                                 */
/* ------------------------------------------------------------------ */

export async function getAccessToken(): Promise<string> {
  if (!isZohoConfigured()) {
    return "mock-access-token";
  }

  // Return cached token if still valid (with 60s buffer)
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const accountsDomain = getAccountsDomain();
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
    refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
  });

  const res = await fetch(`${accountsDomain}/oauth/v2/token?${params.toString()}`, {
    method: "POST",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to refresh Zoho access token: ${res.status} ${text}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(`Zoho OAuth error: ${data.error}`);
  }

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };

  return tokenCache.accessToken;
}

/* ------------------------------------------------------------------ */
/*  Authenticated fetch wrapper                                        */
/* ------------------------------------------------------------------ */

export async function zohoFetch<T = unknown>(
  endpoint: string,
  options: ZohoFetchOptions = {},
): Promise<T> {
  if (!isZohoConfigured()) {
    // Return mock data based on the endpoint
    const moduleName = endpoint.split("/").pop()?.split("?")[0] || "";
    return { data: MOCK_DATA[moduleName] || [] } as T;
  }

  await waitForRateLimit();

  const token = await getAccessToken();
  const domain = getZohoDomain();

  let url = endpoint.startsWith("http") ? endpoint : `${domain}/recruit/v2/${endpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    url += (url.includes("?") ? "&" : "?") + searchParams.toString();
  }

  const { params: _params, ...fetchOptions } = options;

  const res = await fetch(url, {
    ...fetchOptions,
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zoho API error ${res.status}: ${text}`);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}

/* ------------------------------------------------------------------ */
/*  High-level helpers                                                 */
/* ------------------------------------------------------------------ */

/**
 * Fetch records from a Zoho module with pagination support.
 */
export async function getRecords(
  module: string,
  params: Record<string, string> = {},
): Promise<ZohoListResponse> {
  if (!isZohoConfigured()) {
    const records = (MOCK_DATA[module] || []) as Record<string, unknown>[];
    return {
      data: records,
      info: { per_page: records.length, count: records.length, page: 1, more_records: false },
    };
  }

  return zohoFetch<ZohoListResponse>(module, { params });
}

/**
 * Fetch a single record by ID.
 */
export async function getRecord(
  module: string,
  id: string,
): Promise<Record<string, unknown> | null> {
  if (!isZohoConfigured()) {
    const records = (MOCK_DATA[module] || []) as Record<string, unknown>[];
    return records.find((r) => r.id === id) || null;
  }

  const res = await zohoFetch<ZohoListResponse>(`${module}/${id}`);
  return res.data?.[0] || null;
}

/**
 * Create a record in a Zoho Recruit module.
 * POST /recruit/v2/{module}
 */
export async function createRecord(
  module: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  if (!isZohoConfigured()) {
    console.log(`[Zoho Mock] Would create ${module} record:`, data);
    return { id: `mock-new-${Date.now()}`, ...data };
  }

  const res = await zohoFetch<{ data: Array<{ details: Record<string, unknown>; code: string; message: string }> }>(
    module,
    {
      method: "POST",
      body: JSON.stringify({ data: [data] }),
    },
  );

  const record = res.data?.[0];
  if (record?.code === "SUCCESS") {
    return record.details || null;
  }

  console.error(`[Zoho] Failed to create ${module} record:`, record?.message);
  return null;
}

/**
 * Search records by criteria string (Zoho COQL-style criteria).
 * Example criteria: "(Email:equals:john@example.com)"
 */
export async function searchRecords(
  module: string,
  criteria: string,
): Promise<ZohoListResponse> {
  if (!isZohoConfigured()) {
    return { data: (MOCK_DATA[module] || []) as Record<string, unknown>[] };
  }

  return zohoFetch<ZohoListResponse>(`${module}/search`, {
    params: { criteria },
  });
}

/**
 * Fetch ALL records from a module (handles pagination automatically).
 * Uses 200 records per page as per Zoho's max.
 */
export async function getAllRecords(
  module: string,
  modifiedAfter?: string,
): Promise<Record<string, unknown>[]> {
  if (!isZohoConfigured()) {
    return (MOCK_DATA[module] || []) as Record<string, unknown>[];
  }

  const allRecords: Record<string, unknown>[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const params: Record<string, string> = {
      per_page: "200",
      page: String(page),
    };

    if (modifiedAfter) {
      params.modified_since = modifiedAfter;
    }

    try {
      const res = await getRecords(module, params);

      if (res.data && res.data.length > 0) {
        allRecords.push(...res.data);
      }

      hasMore = res.info?.more_records ?? false;
      page++;
    } catch (err) {
      // If we get a 204 (no records), break out
      hasMore = false;
    }
  }

  return allRecords;
}

/* ------------------------------------------------------------------ */
/*  Notes, Comments & Attachments                                      */
/* ------------------------------------------------------------------ */

/**
 * Get notes/comments for a specific record.
 * Zoho Recruit: GET /recruit/v2/{module}/{recordId}/Notes
 */
export async function getRecordNotes(
  module: string,
  recordId: string,
): Promise<Record<string, unknown>[]> {
  if (!isZohoConfigured()) return [];
  try {
    const res = await zohoFetch<ZohoListResponse>(`${module}/${recordId}/Notes`);
    return res.data || [];
  } catch {
    return [];
  }
}

/**
 * Get attachments list for a specific record.
 * Zoho Recruit: GET /recruit/v2/{module}/{recordId}/Attachments
 */
export async function getRecordAttachments(
  module: string,
  recordId: string,
): Promise<Record<string, unknown>[]> {
  if (!isZohoConfigured()) return [];
  try {
    const res = await zohoFetch<ZohoListResponse>(`${module}/${recordId}/Attachments`);
    return res.data || [];
  } catch {
    return [];
  }
}

/**
 * Download an attachment file.
 * Returns the file as a Buffer with its filename and content type.
 */
export async function downloadAttachment(
  module: string,
  recordId: string,
  attachmentId: string,
): Promise<{ buffer: Buffer; filename: string; contentType: string } | null> {
  if (!isZohoConfigured()) return null;
  try {
    const token = await getAccessToken();
    const domain = getZohoDomain();
    const url = `${domain}/recruit/v2/${module}/${recordId}/Attachments/${attachmentId}`;
    const res = await fetch(url, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });
    if (!res.ok) return null;
    const contentDisposition = res.headers.get("content-disposition") || "";
    const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
    const filename = filenameMatch?.[1] || `attachment-${attachmentId}`;
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const buffer = Buffer.from(await res.arrayBuffer());
    return { buffer, filename, contentType };
  } catch {
    return null;
  }
}

/**
 * Get the full activity/history timeline for a record.
 * Note: This may not be available in all Zoho Recruit editions.
 */
export async function getRecordTimeline(
  module: string,
  recordId: string,
): Promise<Record<string, unknown>[]> {
  if (!isZohoConfigured()) return [];
  try {
    const res = await zohoFetch<ZohoListResponse>(`${module}/${recordId}/actions`);
    return res.data || [];
  } catch {
    return [];
  }
}

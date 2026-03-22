/**
 * ZeroBounce email verification API client.
 *
 * Uses ZEROBOUNCE_API_KEY environment variable. When the key is not
 * configured, all functions return mock "valid" responses so the rest
 * of the app can operate in demo / development mode.
 */

const ZEROBOUNCE_BASE_URL = "https://api.zerobounce.net";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VerificationResult {
  /** The email address that was verified */
  email: string;
  /** Whether the email is considered deliverable */
  isValid: boolean;
  /**
   * ZeroBounce status:
   * "valid" | "invalid" | "catch-all" | "unknown" | "spamtrap" | "abuse" | "do_not_mail"
   */
  status: string;
  /**
   * More granular sub-status (e.g. "alias_address", "role_based", "disposable",
   * "toxic", "possible_typo", "mailbox_not_found", etc.)
   */
  subStatus: string;
  /** Free-mail provider flag (Gmail, Yahoo, etc.) */
  freeEmail: boolean;
  /** Suggested correction if a typo was detected (e.g. "gmial.com" -> "gmail.com") */
  didYouMean: string | null;
  /** Processing time in seconds */
  processedAt: string;
}

export interface BatchVerificationResult {
  /** Individual results keyed by email */
  results: VerificationResult[];
  /** Number of emails submitted */
  total: number;
  /** Number that came back valid */
  validCount: number;
  /** Number that came back invalid */
  invalidCount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getApiKey(): string | undefined {
  return process.env.ZEROBOUNCE_API_KEY;
}

function isConfigured(): boolean {
  return !!getApiKey();
}

function mockResult(email: string): VerificationResult {
  return {
    email,
    isValid: true,
    status: "valid",
    subStatus: "",
    freeEmail: email.endsWith("gmail.com") || email.endsWith("yahoo.com"),
    didYouMean: null,
    processedAt: new Date().toISOString(),
  };
}

function mapApiResult(raw: Record<string, unknown>): VerificationResult {
  const status = (raw.status as string) ?? "unknown";
  return {
    email: (raw.address as string) ?? "",
    isValid: status === "valid",
    status,
    subStatus: (raw.sub_status as string) ?? "",
    freeEmail: (raw.free_email as boolean) ?? false,
    didYouMean: (raw.did_you_mean as string) || null,
    processedAt: (raw.processed_at as string) ?? new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Verify a single email address via ZeroBounce.
 *
 * @param email - The email address to verify
 * @returns Verification result with validity status and sub-status
 */
export async function verifyEmail(email: string): Promise<VerificationResult> {
  if (!isConfigured()) {
    console.warn(
      "[zerobounce] ZEROBOUNCE_API_KEY not configured - returning mock valid result"
    );
    return mockResult(email);
  }

  try {
    const url = new URL(`${ZEROBOUNCE_BASE_URL}/v2/validate`);
    url.searchParams.set("api_key", getApiKey()!);
    url.searchParams.set("email", email);

    const response = await fetch(url.toString(), { method: "GET" });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `ZeroBounce API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    return mapApiResult(data);
  } catch (error) {
    console.error("[zerobounce] verifyEmail failed:", error);
    throw error;
  }
}

/**
 * Verify a batch of email addresses (max 100 per request).
 *
 * @param emails - Array of email addresses to verify (max 100)
 * @returns Batch verification result with per-email statuses
 */
export async function verifyBatch(
  emails: string[]
): Promise<BatchVerificationResult> {
  if (emails.length > 100) {
    throw new Error(
      "ZeroBounce batch verification supports a maximum of 100 emails per request"
    );
  }

  if (!isConfigured()) {
    console.warn(
      "[zerobounce] ZEROBOUNCE_API_KEY not configured - returning mock valid results for batch"
    );
    const results = emails.map(mockResult);
    return {
      results,
      total: emails.length,
      validCount: emails.length,
      invalidCount: 0,
    };
  }

  try {
    const response = await fetch(
      `${ZEROBOUNCE_BASE_URL}/v2/validatebatch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: getApiKey(),
          email_batch: emails.map((email) => ({ email_address: email })),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `ZeroBounce API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    const rawResults: Record<string, unknown>[] =
      data.email_batch ?? data.results ?? [];

    const results = rawResults.map(mapApiResult);
    const validCount = results.filter((r) => r.isValid).length;

    return {
      results,
      total: results.length,
      validCount,
      invalidCount: results.length - validCount,
    };
  } catch (error) {
    console.error("[zerobounce] verifyBatch failed:", error);
    throw error;
  }
}

/**
 * Check whether the ZeroBounce API key is configured.
 */
export function isZeroBounceConfigured(): boolean {
  return isConfigured();
}

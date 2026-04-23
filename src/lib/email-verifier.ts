/**
 * Free built-in email verifier using DNS MX record lookups.
 * No external API needed - checks if the email domain has valid mail servers.
 * Catches ~80% of invalid emails (dead domains, typos, non-existent domains).
 */

import dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);
const resolve4 = promisify(dns.resolve4);

// Known disposable email domains
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "dispostable.com", "trashmail.com", "tempail.com", "fakeinbox.com",
  "temp-mail.org", "10minutemail.com", "mohmal.com", "getnada.com",
]);

// Known free email providers (not invalid, but flagged)
const FREE_PROVIDERS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
  "aol.com", "icloud.com", "mail.com", "protonmail.com", "zoho.com",
  "gmx.com", "yandex.com",
]);

export interface EmailVerification {
  email: string;
  isValid: boolean;
  status: "valid" | "invalid" | "risky" | "unknown" | "disposable";
  reason: string;
  isFreeProvider: boolean;
  isDisposable: boolean;
  mxRecords: string[];
  checkedAt: string;
}

/**
 * Verify a single email address using DNS MX lookup.
 * Free, no API key needed.
 */
export async function verifyEmail(email: string): Promise<EmailVerification> {
  const result: EmailVerification = {
    email: email.toLowerCase().trim(),
    isValid: false,
    status: "unknown",
    reason: "",
    isFreeProvider: false,
    isDisposable: false,
    mxRecords: [],
    checkedAt: new Date().toISOString(),
  };

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(result.email)) {
    result.status = "invalid";
    result.reason = "Invalid email format";
    return result;
  }

  const domain = result.email.split("@")[1].toLowerCase();

  // Check disposable
  if (DISPOSABLE_DOMAINS.has(domain)) {
    result.status = "disposable";
    result.reason = "Disposable email domain";
    result.isDisposable = true;
    return result;
  }

  // Check free provider
  if (FREE_PROVIDERS.has(domain)) {
    result.isFreeProvider = true;
  }

  // DNS MX record lookup
  try {
    const mxRecords = await resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      result.mxRecords = mxRecords
        .sort((a, b) => a.priority - b.priority)
        .map((r) => r.exchange);
      result.isValid = true;
      result.status = "valid";
      result.reason = `Domain has ${mxRecords.length} MX record(s)`;
    } else {
      result.status = "invalid";
      result.reason = "No MX records found for domain";
    }
  } catch (err: unknown) {
    // MX lookup failed - try A record as fallback
    try {
      const aRecords = await resolve4(domain);
      if (aRecords && aRecords.length > 0) {
        result.isValid = true;
        result.status = "risky";
        result.reason = "No MX records but A record exists (may accept mail)";
      } else {
        result.status = "invalid";
        result.reason = "Domain does not exist";
      }
    } catch {
      result.status = "invalid";
      result.reason = "Domain does not exist or DNS lookup failed";
    }
  }

  return result;
}

/**
 * Verify multiple emails in batch.
 * Returns results for all emails.
 */
export async function verifyBatch(
  emails: string[],
  concurrency = 10,
): Promise<EmailVerification[]> {
  const results: EmailVerification[] = [];

  // Process in batches to avoid DNS flood
  for (let i = 0; i < emails.length; i += concurrency) {
    const batch = emails.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(verifyEmail));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Quick check - just returns true/false.
 */
export async function isEmailValid(email: string): Promise<boolean> {
  const result = await verifyEmail(email);
  return result.isValid;
}

/**
 * Apollo.io API client for lead sourcing and email verification.
 *
 * Uses APOLLO_API_KEY environment variable. When the key is not configured,
 * all functions return realistic mock data so the rest of the app can
 * operate in demo / development mode.
 */

const APOLLO_BASE_URL = "https://api.apollo.io";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  title: string;
  company: string;
  company_domain: string;
  industry: string;
  location: string;
  linkedin_url: string;
  phone: string | null;
  seniority: string;
  departments: string[];
}

export interface ApolloSearchFilters {
  /** Job titles to target (e.g. ["Hiring Manager", "Head of Talent"]) */
  job_titles?: string[];
  /** Industries (e.g. ["Technology", "Financial Services"]) */
  industries?: string[];
  /** Locations (e.g. ["United Kingdom"]) */
  locations?: string[];
  /** Minimum employee count */
  company_size_min?: number;
  /** Maximum employee count */
  company_size_max?: number;
  /** Technologies used (e.g. ["Salesforce", "HubSpot"]) */
  technologies?: string[];
  /** Number of results per page (max 100) */
  per_page?: number;
  /** Page number (1-indexed) */
  page?: number;
}

export interface ApolloSearchResult {
  contacts: ApolloContact[];
  total: number;
  page: number;
  per_page: number;
}

export interface ApolloEnrichResult {
  contact: ApolloContact | null;
  verified: boolean;
}

export interface ApolloEmailVerification {
  email: string;
  is_valid: boolean;
  status: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getApiKey(): string | undefined {
  return process.env.APOLLO_API_KEY;
}

function isConfigured(): boolean {
  return !!getApiKey();
}

const MOCK_CONTACTS: ApolloContact[] = [
  {
    id: "mock-apollo-1",
    first_name: "Sarah",
    last_name: "Mitchell",
    name: "Sarah Mitchell",
    email: "s.mitchell@techrecruit.co.uk",
    title: "Head of Talent Acquisition",
    company: "TechRecruit UK",
    company_domain: "techrecruit.co.uk",
    industry: "Staffing & Recruiting",
    location: "London, United Kingdom",
    linkedin_url: "https://linkedin.com/in/sarahmitchell",
    phone: "+44 20 7946 0958",
    seniority: "director",
    departments: ["Human Resources"],
  },
  {
    id: "mock-apollo-2",
    first_name: "James",
    last_name: "Patel",
    name: "James Patel",
    email: "james.patel@innovatech.co.uk",
    title: "Hiring Manager - Engineering",
    company: "InnovaTech Solutions",
    company_domain: "innovatech.co.uk",
    industry: "Information Technology",
    location: "Manchester, United Kingdom",
    linkedin_url: "https://linkedin.com/in/jamespatel",
    phone: "+44 161 496 0321",
    seniority: "manager",
    departments: ["Engineering", "Human Resources"],
  },
  {
    id: "mock-apollo-3",
    first_name: "Emma",
    last_name: "Richardson",
    name: "Emma Richardson",
    email: "emma.r@fintechglobal.co.uk",
    title: "VP People & Culture",
    company: "FinTech Global",
    company_domain: "fintechglobal.co.uk",
    industry: "Financial Services",
    location: "Edinburgh, United Kingdom",
    linkedin_url: "https://linkedin.com/in/emmarichardson",
    phone: null,
    seniority: "vp",
    departments: ["Human Resources"],
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search for people matching ICP filters via Apollo.io mixed people search.
 *
 * @param filters - ICP filters (job title, industry, location, company size, technologies)
 * @returns Search result containing matching contacts
 */
export async function searchPeople(
  filters: ApolloSearchFilters
): Promise<ApolloSearchResult> {
  if (!isConfigured()) {
    console.warn(
      "[apollo] APOLLO_API_KEY not configured - returning mock contacts"
    );
    return {
      contacts: MOCK_CONTACTS,
      total: MOCK_CONTACTS.length,
      page: filters.page ?? 1,
      per_page: filters.per_page ?? 25,
    };
  }

  try {
    const body: Record<string, unknown> = {
      api_key: getApiKey(),
      page: filters.page ?? 1,
      per_page: filters.per_page ?? 25,
    };

    if (filters.job_titles?.length) {
      body.person_titles = filters.job_titles;
    }
    if (filters.industries?.length) {
      body.person_industries = filters.industries;
    }
    if (filters.locations?.length) {
      body.person_locations = filters.locations;
    }
    if (filters.company_size_min != null || filters.company_size_max != null) {
      body.organization_num_employees_ranges = [
        `${filters.company_size_min ?? 1},${filters.company_size_max ?? 1000000}`,
      ];
    }
    if (filters.technologies?.length) {
      body.currently_using_any_of_technology_uids = filters.technologies;
    }

    const response = await fetch(
      `${APOLLO_BASE_URL}/v1/mixed_people/search`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Apollo API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();

    const contacts: ApolloContact[] = (data.people ?? []).map(
      (p: Record<string, unknown>) => ({
        id: p.id as string,
        first_name: (p.first_name as string) ?? "",
        last_name: (p.last_name as string) ?? "",
        name: (p.name as string) ?? "",
        email: (p.email as string) ?? "",
        title: (p.title as string) ?? "",
        company: ((p.organization as Record<string, unknown>)?.name as string) ?? "",
        company_domain:
          ((p.organization as Record<string, unknown>)?.primary_domain as string) ?? "",
        industry:
          ((p.organization as Record<string, unknown>)?.industry as string) ?? "",
        location: `${(p.city as string) ?? ""}, ${(p.country as string) ?? ""}`,
        linkedin_url: (p.linkedin_url as string) ?? "",
        phone: (p.phone_number as string) ?? null,
        seniority: (p.seniority as string) ?? "",
        departments: (p.departments as string[]) ?? [],
      })
    );

    return {
      contacts,
      total: (data.pagination?.total_entries as number) ?? contacts.length,
      page: (data.pagination?.page as number) ?? 1,
      per_page: (data.pagination?.per_page as number) ?? 25,
    };
  } catch (error) {
    console.error("[apollo] searchPeople failed:", error);
    throw error;
  }
}

/**
 * Enrich a person by email - returns verified contact details.
 *
 * @param email - Email address to look up
 * @returns Enrichment result with contact data and verification status
 */
export async function enrichPerson(
  email: string
): Promise<ApolloEnrichResult> {
  if (!isConfigured()) {
    console.warn(
      "[apollo] APOLLO_API_KEY not configured - returning mock enrichment"
    );
    const match = MOCK_CONTACTS.find((c) => c.email === email);
    return {
      contact: match ?? MOCK_CONTACTS[0],
      verified: true,
    };
  }

  try {
    const response = await fetch(`${APOLLO_BASE_URL}/v1/people/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: getApiKey(),
        email,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Apollo API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    const p = data.person;

    if (!p) {
      return { contact: null, verified: false };
    }

    return {
      contact: {
        id: p.id,
        first_name: p.first_name ?? "",
        last_name: p.last_name ?? "",
        name: p.name ?? "",
        email: p.email ?? email,
        title: p.title ?? "",
        company: p.organization?.name ?? "",
        company_domain: p.organization?.primary_domain ?? "",
        industry: p.organization?.industry ?? "",
        location: `${p.city ?? ""}, ${p.country ?? ""}`,
        linkedin_url: p.linkedin_url ?? "",
        phone: p.phone_number ?? null,
        seniority: p.seniority ?? "",
        departments: p.departments ?? [],
      },
      verified: !!p.email_status && p.email_status !== "unavailable",
    };
  } catch (error) {
    console.error("[apollo] enrichPerson failed:", error);
    throw error;
  }
}

/**
 * Verify an email address via Apollo.io.
 *
 * @param email - Email address to verify
 * @returns Verification result
 */
export async function verifyEmail(
  email: string
): Promise<ApolloEmailVerification> {
  if (!isConfigured()) {
    console.warn(
      "[apollo] APOLLO_API_KEY not configured - returning mock verification"
    );
    return {
      email,
      is_valid: true,
      status: "valid",
    };
  }

  try {
    const response = await fetch(
      `${APOLLO_BASE_URL}/v1/email_accounts/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: getApiKey(),
          email,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Apollo API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();

    return {
      email,
      is_valid: data.is_valid ?? false,
      status: data.status ?? "unknown",
    };
  } catch (error) {
    console.error("[apollo] verifyEmail failed:", error);
    throw error;
  }
}

/**
 * Check whether the Apollo.io API key is configured.
 */
export function isApolloConfigured(): boolean {
  return isConfigured();
}

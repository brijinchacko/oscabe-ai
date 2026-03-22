"use client";

import { useState, useCallback, useRef, type ChangeEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Papa from "papaparse";
import {
  Upload,
  FileSpreadsheet,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  Module configuration                                                */
/* ------------------------------------------------------------------ */

interface ModuleConfig {
  label: string;
  pluralLabel: string;
  apiEndpoint: string;
  viewHref: string;
  templateModule: string;
  fields: Array<{ value: string; label: string }>;
  autoMap: Record<string, string>;
  requiredFields: string[];
  requiredFieldLabels: string;
}

const SKIP_FIELD = { value: "_skip", label: "-- Skip --" };

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  clients: {
    label: "Client",
    pluralLabel: "Clients",
    apiEndpoint: "/api/import/clients",
    viewHref: "/crm/clients",
    templateModule: "clients",
    fields: [
      SKIP_FIELD,
      { value: "companyName", label: "Company Name" },
      { value: "industry", label: "Industry" },
      { value: "phone", label: "Phone" },
      { value: "website", label: "Website" },
      { value: "notes", label: "About / Notes" },
      { value: "city", label: "City" },
      { value: "state", label: "State" },
      { value: "country", label: "Country" },
      { value: "companySize", label: "Company Size" },
      { value: "feeAgreement", label: "Fee Agreement" },
      { value: "paymentTerms", label: "Payment Terms" },
    ],
    autoMap: {
      client_name: "companyName",
      "client name": "companyName",
      company: "companyName",
      company_name: "companyName",
      "company name": "companyName",
      companyname: "companyName",
      industry: "industry",
      phone: "phone",
      telephone: "phone",
      website: "website",
      about_the_company: "notes",
      "about the company": "notes",
      notes: "notes",
      description: "notes",
      city: "city",
      state: "state",
      country: "country",
      company_size: "companySize",
      "company size": "companySize",
      fee_agreement: "feeAgreement",
      "fee agreement": "feeAgreement",
      payment_terms: "paymentTerms",
      "payment terms": "paymentTerms",
    },
    requiredFields: ["companyName"],
    requiredFieldLabels: "Company Name",
  },
  contacts: {
    label: "Contact",
    pluralLabel: "Contacts",
    apiEndpoint: "/api/import/contacts",
    viewHref: "/crm/clients",
    templateModule: "contacts",
    fields: [
      SKIP_FIELD,
      { value: "firstName", label: "First Name" },
      { value: "lastName", label: "Last Name" },
      { value: "email", label: "Email" },
      { value: "phone", label: "Phone" },
      { value: "clientId", label: "Client Name (lookup)" },
      { value: "jobTitle", label: "Job Title" },
      { value: "linkedIn", label: "LinkedIn" },
      { value: "isPrimary", label: "Is Primary Contact" },
      { value: "notes", label: "Notes" },
    ],
    autoMap: {
      first_name: "firstName",
      "first name": "firstName",
      firstname: "firstName",
      last_name: "lastName",
      "last name": "lastName",
      lastname: "lastName",
      email: "email",
      "email address": "email",
      phone: "phone",
      mobile: "phone",
      telephone: "phone",
      client_name: "clientId",
      "client name": "clientId",
      company: "clientId",
      job_title: "jobTitle",
      "job title": "jobTitle",
      title: "jobTitle",
      linkedin: "linkedIn",
      is_primary: "isPrimary",
      "is primary": "isPrimary",
      notes: "notes",
    },
    requiredFields: ["firstName", "lastName", "clientId"],
    requiredFieldLabels: "First Name, Last Name, and Client Name",
  },
  jobs: {
    label: "Job",
    pluralLabel: "Jobs",
    apiEndpoint: "/api/import/jobs",
    viewHref: "/crm/jobs",
    templateModule: "jobs",
    fields: [
      SKIP_FIELD,
      { value: "title", label: "Job Title" },
      { value: "description", label: "Job Description" },
      { value: "clientId", label: "Client Name (lookup)" },
      { value: "city", label: "City" },
      { value: "state", label: "State" },
      { value: "country", label: "Country" },
      { value: "location", label: "Location (combined)" },
      { value: "contractType", label: "Job Type" },
      { value: "salary", label: "Salary / Salary Range" },
      { value: "skills", label: "Required Skills (comma-separated)" },
      { value: "remote", label: "Remote Job" },
      { value: "status", label: "Status" },
      { value: "numPositions", label: "Number of Positions" },
      { value: "feeAmount", label: "Revenue per Position" },
      { value: "industry", label: "Industry" },
      { value: "notes", label: "Notes" },
    ],
    autoMap: {
      posting_title: "title",
      "posting title": "title",
      job_title: "title",
      "job title": "title",
      title: "title",
      job_description: "description",
      "job description": "description",
      description: "description",
      client_name: "clientId",
      "client name": "clientId",
      company: "clientId",
      city: "city",
      state: "state",
      country: "country",
      location: "location",
      job_type: "contractType",
      "job type": "contractType",
      type: "contractType",
      salary: "salary",
      salary_range: "salary",
      "salary range": "salary",
      required_skills: "skills",
      "required skills": "skills",
      skills: "skills",
      remote_job: "remote",
      "remote job": "remote",
      remote: "remote",
      job_opening_status: "status",
      "job opening status": "status",
      status: "status",
      number_of_positions: "numPositions",
      "number of positions": "numPositions",
      positions: "numPositions",
      revenue_per_position: "feeAmount",
      "revenue per position": "feeAmount",
      industry: "industry",
      notes: "notes",
    },
    requiredFields: ["title"],
    requiredFieldLabels: "Job Title",
  },
  placements: {
    label: "Placement",
    pluralLabel: "Placements",
    apiEndpoint: "/api/import/placements",
    viewHref: "/crm/placements",
    templateModule: "placements",
    fields: [
      SKIP_FIELD,
      { value: "candidateId", label: "Candidate Name (lookup)" },
      { value: "jobId", label: "Job Title (lookup)" },
      { value: "clientId", label: "Client Name (lookup)" },
      { value: "feeAmount", label: "Fee Amount" },
      { value: "startDate", label: "Start Date" },
      { value: "endDate", label: "End Date" },
      { value: "status", label: "Status" },
      { value: "salary", label: "Salary" },
      { value: "dayRate", label: "Day Rate" },
      { value: "feePercent", label: "Fee Percent" },
      { value: "notes", label: "Notes" },
    ],
    autoMap: {
      candidate_name: "candidateId",
      "candidate name": "candidateId",
      candidate: "candidateId",
      job_title: "jobId",
      "job title": "jobId",
      job: "jobId",
      client_name: "clientId",
      "client name": "clientId",
      company: "clientId",
      fee: "feeAmount",
      fee_amount: "feeAmount",
      "fee amount": "feeAmount",
      start_date: "startDate",
      "start date": "startDate",
      startdate: "startDate",
      end_date: "endDate",
      "end date": "endDate",
      enddate: "endDate",
      status: "status",
      salary: "salary",
      day_rate: "dayRate",
      "day rate": "dayRate",
      dayrate: "dayRate",
      fee_percent: "feePercent",
      "fee percent": "feePercent",
      fee_percentage: "feePercent",
      notes: "notes",
    },
    requiredFields: ["candidateId", "startDate"],
    requiredFieldLabels: "Candidate Name and Start Date",
  },
  activities: {
    label: "Activity",
    pluralLabel: "Activities",
    apiEndpoint: "/api/import/activities",
    viewHref: "/crm",
    templateModule: "activities",
    fields: [
      SKIP_FIELD,
      { value: "type", label: "Activity Type" },
      { value: "title", label: "Title / Subject" },
      { value: "content", label: "Content / Notes" },
      { value: "candidateId", label: "Candidate Name (lookup)" },
      { value: "clientId", label: "Client Name (lookup)" },
      { value: "jobId", label: "Job Title (lookup)" },
      { value: "date", label: "Date" },
    ],
    autoMap: {
      type: "type",
      activity_type: "type",
      "activity type": "type",
      title: "title",
      subject: "title",
      content: "content",
      description: "content",
      notes: "content",
      body: "content",
      candidate_name: "candidateId",
      "candidate name": "candidateId",
      candidate: "candidateId",
      client_name: "clientId",
      "client name": "clientId",
      company: "clientId",
      job_title: "jobId",
      "job title": "jobId",
      job: "jobId",
      date: "date",
      created_date: "date",
      activity_date: "date",
      "activity date": "date",
    },
    requiredFields: ["title"],
    requiredFieldLabels: "Title",
  },
};

type Step = "upload" | "mapping" | "preview" | "importing" | "results";

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function ModuleImportPage() {
  const params = useParams();
  const moduleKey = params.module as string;
  const config = MODULE_CONFIGS[moduleKey];

  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [allRows, setAllRows] = useState<string[][]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    errors: number;
    details?: Array<{ row: number; error: string }>;
  } | null>(null);
  const [importError, setImportError] = useState("");

  // If module not found, show error
  if (!config) {
    return (
      <div className="space-y-6">
        <Link
          href="/crm/import"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to Import Hub
        </Link>
        <div className="rounded-xl border bg-white p-12 text-center">
          <AlertCircle className="mx-auto size-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Unknown Import Module
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The module &quot;{moduleKey}&quot; is not recognized. Please go back
            to the Import Hub.
          </p>
        </div>
      </div>
    );
  }

  const handleFile = useCallback(
    (f: File) => {
      if (!f.name.endsWith(".csv") && f.type !== "text/csv") {
        toast.error("Please upload a .csv file");
        return;
      }

      setFile(f);
      setResult(null);
      setImportError("");

      Papa.parse(f, {
        header: false,
        skipEmptyLines: true,
        complete(results) {
          const data = results.data as string[][];
          if (data.length < 2) {
            toast.error(
              "CSV must have at least a header row and one data row"
            );
            return;
          }
          const hdrs = data[0];
          const dataRows = data.slice(1);
          setHeaders(hdrs);
          setAllRows(dataRows);
          setPreviewRows(dataRows.slice(0, 5));

          // Auto-map headers
          const autoMapping: Record<string, string> = {};
          for (const h of hdrs) {
            const norm = h.toLowerCase().trim();
            autoMapping[h] = config.autoMap[norm] ?? "_skip";
          }
          setMapping(autoMapping);
          setStep("mapping");
        },
        error() {
          toast.error("Failed to parse CSV file");
        },
      });
    },
    [config.autoMap]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function getActiveMappings(): [string, string][] {
    return Object.entries(mapping).filter(
      ([, field]) => field && field !== "_skip" && field !== "skip"
    );
  }

  function canProceedToPreview(): boolean {
    const fields = getActiveMappings().map(([, f]) => f);
    return config.requiredFields.every((rf) => fields.includes(rf));
  }

  const mappedCount = getActiveMappings().length;

  async function startImport() {
    if (!file) return;
    setStep("importing");
    setResult(null);
    setImportError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mapping", JSON.stringify(mapping));

      const res = await fetch(config.apiEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Import failed");
      }

      const data = await res.json();
      setResult({
        success: data.processedRows ?? 0,
        errors: data.errorRows ?? 0,
        details: data.errors ?? [],
      });
      setStep("results");
      toast.success("Import completed");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
      setResult({ success: 0, errors: allRows.length });
      setStep("results");
    }
  }

  function reset() {
    setStep("upload");
    setFile(null);
    setHeaders([]);
    setAllRows([]);
    setPreviewRows([]);
    setMapping({});
    setResult(null);
    setImportError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/crm/import"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to Import Hub
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Import {config.pluralLabel}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a CSV file to bulk-import {config.pluralLabel.toLowerCase()}{" "}
              into OSCABE
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                `/api/import/template?module=${config.templateModule}`,
                "_blank"
              )
            }
          >
            <Download className="size-3.5" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 text-sm">
        {(["upload", "mapping", "preview", "results"] as const).map(
          (s, idx) => {
            const labels: Record<string, string> = {
              upload: "1. Upload",
              mapping: "2. Map Columns",
              preview: "3. Preview",
              results: "4. Results",
            };
            const stepOrder: Step[] = [
              "upload",
              "mapping",
              "preview",
              "importing",
              "results",
            ];
            const isActive =
              s === step || (step === "importing" && s === "results");
            const isPast = stepOrder.indexOf(step) > stepOrder.indexOf(s);
            return (
              <div key={s} className="flex items-center gap-2">
                {idx > 0 && (
                  <div
                    className={`h-px w-6 ${isPast ? "bg-indigo-500" : "bg-gray-200"}`}
                  />
                )}
                <span
                  className={`rounded-full px-3 py-1 ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : isPast
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {labels[s]}
                </span>
              </div>
            );
          }
        )}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white p-12 transition-colors ${
            isDragging
              ? "border-indigo-400 bg-indigo-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{ cursor: "pointer" }}
        >
          <Upload
            className={`size-12 ${isDragging ? "text-indigo-500" : "text-gray-300"}`}
          />
          <p className="mt-4 text-sm font-medium text-gray-700">
            Drag and drop your CSV file here, or click to browse
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Supports .csv files exported from Zoho Recruit
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      )}

      {/* Step 2: Column mapping */}
      {step === "mapping" && file && (
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Map Columns</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                <FileSpreadsheet className="mr-1 inline size-4" />
                {file.name} - {allRows.length} rows detected - {mappedCount}{" "}
                fields mapped
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              <X className="size-3.5" />
              Start Over
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>CSV Column</span>
              <span />
              <span>OSCABE Field</span>
            </div>

            {headers.map((header) => (
              <div
                key={header}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-4"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {header}
                  </Badge>
                  <span className="text-xs text-muted-foreground truncate">
                    e.g. &quot;
                    {allRows[0]?.[headers.indexOf(header)] ?? ""}
                    &quot;
                  </span>
                </div>

                <ArrowRight className="size-4 text-muted-foreground" />

                <Select
                  value={mapping[header] ?? "_skip"}
                  onValueChange={(v) =>
                    setMapping((prev) => ({
                      ...prev,
                      [header]: v ?? "_skip",
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Skip this column" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.fields.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {!canProceedToPreview() && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-700">
              <AlertCircle className="size-4 shrink-0" />
              You must map at least {config.requiredFieldLabels} to continue.
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={reset}>
              Back
            </Button>
            <Button
              disabled={!canProceedToPreview()}
              onClick={() => setStep("preview")}
            >
              <Eye className="size-3.5" />
              Preview Import
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && file && (
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Preview</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing first {previewRows.length} of {allRows.length} rows
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getActiveMappings().map(([csvHeader, field]) => (
                    <th key={csvHeader} className="pb-2 pr-4">
                      {config.fields.find((f) => f.value === field)?.label ??
                        field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b last:border-0">
                    {getActiveMappings().map(([csvHeader]) => {
                      const colIdx = headers.indexOf(csvHeader);
                      return (
                        <td
                          key={csvHeader}
                          className="py-2 pr-4 text-muted-foreground"
                        >
                          {row[colIdx] ?? ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep("mapping")}>
              Back to Mapping
            </Button>
            <Button onClick={startImport}>
              <Upload className="size-3.5" />
              Start Import ({allRows.length} {config.pluralLabel.toLowerCase()})
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Importing */}
      {step === "importing" && (
        <div className="rounded-xl border bg-white p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="size-10 animate-spin text-indigo-500" />
            <p className="mt-4 text-lg font-medium">
              Importing {config.pluralLabel.toLowerCase()}...
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Processing {allRows.length} rows. Please wait.
            </p>
          </div>
        </div>
      )}

      {/* Step 5: Results */}
      {step === "results" && (
        <div className="rounded-xl border bg-white p-8 text-center">
          {result && result.success > 0 ? (
            <CheckCircle2 className="mx-auto size-12 text-green-500" />
          ) : (
            <AlertCircle className="mx-auto size-12 text-red-500" />
          )}

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {result && result.success > 0 ? "Import Complete" : "Import Failed"}
          </h2>

          {importError && (
            <p className="mt-2 text-sm text-red-600">{importError}</p>
          )}

          {result && (
            <div className="mt-4 flex justify-center gap-8">
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {result.success}
                </p>
                <p className="text-sm text-gray-500">Imported</p>
              </div>
              {result.errors > 0 && (
                <div>
                  <p className="text-3xl font-bold text-red-600">
                    {result.errors}
                  </p>
                  <p className="text-sm text-gray-500">Skipped / Errors</p>
                </div>
              )}
            </div>
          )}

          {result?.details && result.details.length > 0 && (
            <div className="mx-auto mt-4 w-full max-w-lg rounded-md bg-red-50 p-3 text-left">
              <p className="text-sm font-medium text-red-700">Error details:</p>
              <ul className="mt-1 list-inside list-disc text-xs text-red-600">
                {result.details.slice(0, 10).map((detail, idx) => (
                  <li key={idx}>
                    Row {detail.row}: {detail.error}
                  </li>
                ))}
                {result.details.length > 10 && (
                  <li>...and {result.details.length - 10} more</li>
                )}
              </ul>
            </div>
          )}

          {result?.errors &&
            result.errors > 0 &&
            (!result.details || result.details.length === 0) && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-amber-600">
                <AlertCircle className="size-4" />
                Some rows could not be imported (duplicates or missing required
                fields)
              </div>
            )}

          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={reset}>
              Import More
            </Button>
            <Link href={config.viewHref}>
              <Button>View {config.pluralLabel}</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

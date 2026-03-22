import { callOpenRouter } from "@/lib/openrouter";

const CV_PARSER_SYSTEM_PROMPT = `You are an expert automation engineering CV parser for OSCABE, a specialist UK recruitment agency for industrial automation (PLC, SCADA, Controls, Robotics, EC&I).

Extract data from the CV text and return ONLY a JSON object with this exact structure:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "headline": "One-line professional headline summarising their expertise",
  "summary": "2-3 sentence professional summary",
  "skills": [
    {
      "name": "Exact skill name e.g. Siemens TIA Portal V18",
      "category": "PLC|SCADA|ROBOTICS|SAFETY|PROTOCOLS|INDUSTRY|GENERAL",
      "platform": "Brand name e.g. Siemens, Rockwell, Schneider or null",
      "yearsExp": number or null,
      "proficiency": estimated 1-100 based on depth described
    }
  ],
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "YYYY-MM or null",
      "endDate": "YYYY-MM or Present",
      "description": "Brief summary of role"
    }
  ],
  "certifications": ["string"],
  "salaryExpectation": number or null,
  "noticePeriod": "string or null",
  "rightToWork": true/false/null
}

RULES:
- Map skills to SPECIFIC automation platforms and versions. Siemens TIA Portal V18 is different from V15.
- Differentiate: Siemens (TIA Portal, S7-300/400/1200/1500, WinCC, Step 7), Rockwell (Studio 5000, RSLogix, ControlLogix, CompactLogix, FactoryTalk), Schneider (Unity Pro, EcoStruxure, M340, M580)
- Estimate proficiency: 80-95 if described as expert/lead/senior with deep detail, 60-79 if regular use, 40-59 if some experience, 20-39 if mentioned briefly
- Extract ALL automation-relevant skills: PLC brands, SCADA systems, robotics (Fanuc, ABB, KUKA, UR), safety (SIL, IEC 61508, CompEx), protocols (Profinet, EtherNet/IP, Modbus, OPC UA), industry knowledge
- Return ONLY the JSON object, no markdown, no explanation`;

export interface ParsedCV {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  headline: string;
  summary: string;
  skills: Array<{
    name: string;
    category: string;
    platform: string | null;
    yearsExp: number | null;
    proficiency: number;
  }>;
  experience: Array<{
    company: string;
    title: string;
    startDate: string | null;
    endDate: string | null;
    description: string;
  }>;
  certifications: string[];
  salaryExpectation: number | null;
  noticePeriod: string | null;
  rightToWork: boolean | null;
}

export async function parseCV(cvText: string): Promise<ParsedCV> {
  const response = await callOpenRouter(
    [
      { role: "system", content: CV_PARSER_SYSTEM_PROMPT },
      { role: "user", content: `Parse this CV:\n\n${cvText}` },
    ],
    { temperature: 0.2, responseFormat: "json" }
  );

  return JSON.parse(response) as ParsedCV;
}

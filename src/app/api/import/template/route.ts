import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const TEMPLATES: Record<string, string[]> = {
  clients: [
    "Client_Name",
    "Industry",
    "Phone",
    "Website",
    "About_the_Company",
    "City",
    "State",
    "Country",
    "Company_Size",
    "Fee_Agreement",
    "Payment_Terms",
  ],
  contacts: [
    "First_Name",
    "Last_Name",
    "Email",
    "Phone",
    "Client_Name",
    "Job_Title",
    "LinkedIn",
    "Is_Primary",
    "Notes",
  ],
  jobs: [
    "Posting_Title",
    "Job_Description",
    "Client_Name",
    "City",
    "State",
    "Country",
    "Job_Type",
    "Salary",
    "Required_Skills",
    "Remote_Job",
    "Job_Opening_Status",
    "Number_of_Positions",
    "Revenue_per_Position",
    "Industry",
  ],
  placements: [
    "Candidate_Name",
    "Job_Title",
    "Client_Name",
    "Fee",
    "Start_Date",
    "End_Date",
    "Status",
    "Salary",
    "Day_Rate",
    "Fee_Percent",
    "Notes",
  ],
  activities: [
    "Type",
    "Title",
    "Content",
    "Candidate_Name",
    "Client_Name",
    "Job_Title",
    "Date",
  ],
  candidates: [
    "First_Name",
    "Last_Name",
    "Email",
    "Phone",
    "Location",
    "Headline",
    "Skills",
    "Salary_Min",
    "Salary_Max",
    "Notice_Period",
    "Source",
    "Notes",
    "LinkedIn",
  ],
};

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const module = searchParams.get("module");

  if (!module || !TEMPLATES[module]) {
    return NextResponse.json(
      { error: "Invalid module. Valid: " + Object.keys(TEMPLATES).join(", ") },
      { status: 400 }
    );
  }

  const csvContent = TEMPLATES[module].join(",") + "\n";

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${module}_import_template.csv"`,
    },
  });
}

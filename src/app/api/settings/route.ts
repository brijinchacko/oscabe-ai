import { NextResponse } from "next/server";

const defaults = {
  companyName: "Oscabe Ltd",
  address: "Milton Keynes MK1 1EX",
  phone: "",
  email: "info@oscabe.com",
  defaultFeePercent: 15,
  paymentTerms: "30 days",
};

export async function GET() {
  return NextResponse.json(defaults);
}

export async function PUT(request: Request) {
  const body = await request.json();
  // Placeholder: log settings update, return success
  console.log("Settings update:", body);
  return NextResponse.json({ success: true, data: { ...defaults, ...body } });
}

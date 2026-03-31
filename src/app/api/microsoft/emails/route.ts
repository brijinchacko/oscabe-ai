import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getEmails } from "@/lib/microsoft";

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || undefined;
  const folder = searchParams.get("folder") || "inbox";
  const top = parseInt(searchParams.get("top") || "10", 10);
  const skip = parseInt(searchParams.get("skip") || "0", 10);

  try {
    const result = await getEmails(user!.id, search, top, skip, folder);
    const emails = (result.value || []).map((e: Record<string, unknown>) => ({
      id: e.id,
      subject: e.subject,
      from: e.from,
      to: e.toRecipients,
      date: e.receivedDateTime,
      bodyPreview: e.bodyPreview,
      isRead: e.isRead,
      conversationId: e.conversationId,
    }));

    return NextResponse.json({
      emails,
      total: result["@odata.count"] || emails.length,
    });
  } catch (err) {
    console.error("Failed to fetch emails:", err);
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}

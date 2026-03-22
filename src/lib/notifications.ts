/**
 * OSCABE AI - Notification System
 * Sends alerts via Slack webhook and email for key outreach events.
 */

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const ALERT_EMAIL = process.env.ALERT_EMAIL || "joseph@oscabe.co.uk";

interface SlackMessage {
  text: string;
  channel?: string;
  icon_emoji?: string;
}

/** Send a Slack webhook notification */
export async function sendSlackNotification(message: SlackMessage): Promise<boolean> {
  if (!SLACK_WEBHOOK_URL) {
    console.log("[NOTIFY] Slack webhook not configured, skipping:", message.text);
    return false;
  }

  try {
    const res = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: message.text,
        channel: message.channel || "#oscabe-leads",
        icon_emoji: message.icon_emoji || ":robot_face:",
      }),
    });

    return res.ok;
  } catch (error) {
    console.error("[NOTIFY] Slack error:", error);
    return false;
  }
}

/** Notify on positive reply */
export async function notifyPositiveReply(prospectName: string, company: string, replyPreview: string) {
  await sendSlackNotification({
    text: `:tada: *Positive Reply!*\n*${prospectName}* from *${company}*\n> ${replyPreview.slice(0, 200)}`,
    icon_emoji: ":tada:",
  });
}

/** Notify on high spam complaint rate */
export async function notifyHighSpamRate(rate: number) {
  await sendSlackNotification({
    text: `:warning: *Spam Complaint Rate Alert*\nCurrent rate: ${rate.toFixed(2)}% (target: <0.1%)\nReview active campaigns and suppression list.`,
    channel: "#oscabe-alerts",
    icon_emoji: ":warning:",
  });
}

/** Notify on campaign completion */
export async function notifyCampaignComplete(campaignName: string, stats: {
  sent: number;
  opened: number;
  replied: number;
}) {
  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : "0";
  const replyRate = stats.sent > 0 ? ((stats.replied / stats.sent) * 100).toFixed(1) : "0";

  await sendSlackNotification({
    text: `:white_check_mark: *Campaign Complete: ${campaignName}*\n` +
      `Sent: ${stats.sent} | Opened: ${stats.opened} (${openRate}%) | Replied: ${stats.replied} (${replyRate}%)`,
  });
}

/** Notify on prospect conversion to client */
export async function notifyProspectConverted(prospectName: string, company: string) {
  await sendSlackNotification({
    text: `:star2: *New Client Conversion!*\n*${prospectName}* from *${company}* has been converted from prospect to client.`,
    icon_emoji: ":star2:",
  });
}

/** Send daily digest email (uses existing Resend integration) */
export async function sendDailyDigest(metrics: {
  emailsSent: number;
  emailsOpened: number;
  emailsReplied: number;
  positiveReplies: number;
  meetingsBooked: number;
  newProspects: number;
}) {
  try {
    const { sendEmail } = await import("@/lib/resend");

    await sendEmail({
      to: ALERT_EMAIL,
      subject: `OSCABE Daily Digest - ${new Date().toLocaleDateString("en-GB")}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #02012B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">OSCABE AI Daily Digest</h1>
          </div>
          <div style="padding: 24px; background: #f9fafb;">
            <h2 style="color: #1f2937; font-size: 18px;">Yesterday's Outreach Performance</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280;">Emails Sent</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${metrics.emailsSent}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Emails Opened</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${metrics.emailsOpened}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Replies Received</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${metrics.emailsReplied}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Positive Replies</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #059669;">${metrics.positiveReplies}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Meetings Booked</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #4540DB;">${metrics.meetingsBooked}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">New Prospects</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${metrics.newProspects}</td></tr>
            </table>
          </div>
          <div style="padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
            OSCABE AI, The AI Recruiter for Industrial Automation
          </div>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("[NOTIFY] Daily digest email failed:", error);
    return false;
  }
}

export function wrapEmailHtml(body: string, previewText?: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${previewText ? `<span style="display:none">${previewText}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#02012B;padding:24px 32px;">
              <img src="${appUrl}/logo-white.png" alt="OSCABE" width="140" style="display:block;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;font-size:15px;line-height:1.6;color:#333333;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 32px;font-size:12px;color:#888;border-top:1px solid #eee;">
              <p style="margin:0;">OSCABE, The AI Recruiter for Industrial Automation</p>
              <p style="margin:4px 0 0;">Unit 8, Lyon Road, Milton Keynes, MK1 1EX</p>
              <p style="margin:4px 0 0;">info@oscabe.com | +44 7442 87 57 87</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

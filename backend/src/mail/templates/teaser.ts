interface TeaserTemplateParams {
  senderName: string;
  countdownUrl: string;
  scheduledAt: string; // ISO 8601
}

export function teaserTemplate({ senderName, countdownUrl, scheduledAt }: TeaserTemplateParams): string {
  const formattedDate = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px 16px 0 0;padding:50px 40px;text-align:center;">
          <div style="font-size:64px;margin-bottom:16px;">&#x1F4EC;</div>
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;line-height:1.3;">Something special is on its way&hellip;</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="background-color:#1a1a2e;padding:40px;border-radius:0 0 16px 16px;">
          <p style="margin:0 0 24px;color:#e2e8f0;font-size:18px;line-height:1.6;text-align:center;">
            <strong style="color:#ffffff;">${escapeHtml(senderName)}</strong> has sent you a future message
          </p>
          <div style="text-align:center;margin-bottom:32px;">
            <span style="display:inline-block;background-color:#4f46e5;color:#ffffff;font-size:14px;font-weight:600;padding:8px 20px;border-radius:999px;">
              ${escapeHtml(formattedDate)}
            </span>
          </div>
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${escapeHtml(countdownUrl)}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:999px;">
              See the countdown &rarr;
            </a>
          </div>
          <p style="margin:0;color:#64748b;font-size:13px;text-align:center;">
            You'll receive the full message when the countdown ends.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px;text-align:center;">
          <p style="margin:0;color:#475569;font-size:12px;">Future Email Sender</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

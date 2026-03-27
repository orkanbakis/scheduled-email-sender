interface ScheduledTemplateParams {
  senderName: string;
  subject: string;
  body: string;
}

export function scheduledTemplate({ senderName, subject, body }: ScheduledTemplateParams): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px 16px 0 0;padding:50px 40px;text-align:center;">
          <div style="font-size:64px;margin-bottom:16px;">&#x2709;&#xFE0F;</div>
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;line-height:1.3;">Your message has arrived</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="background-color:#1a1a2e;padding:40px;border-radius:0 0 16px 16px;">
          <p style="margin:0 0 8px;color:#94a3b8;font-size:14px;">From</p>
          <p style="margin:0 0 24px;color:#ffffff;font-size:18px;font-weight:600;">${escapeHtml(senderName)}</p>
          <p style="margin:0 0 8px;color:#94a3b8;font-size:14px;">Subject</p>
          <p style="margin:0 0 24px;color:#ffffff;font-size:24px;font-weight:700;">${escapeHtml(subject)}</p>
          <div style="background-color:#0f0f1a;border-radius:12px;padding:24px;margin-bottom:16px;">
            <p style="margin:0;color:#cbd5e1;font-size:16px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(body)}</p>
          </div>
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

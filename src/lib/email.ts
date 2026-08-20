import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface ComplianceNotificationItem {
  supplierName: string;
  documentTypeName: string;
  documentTypeCode: string;
  documentNumber?: string;
  expirationDate: string;
  status: 'EXPIRING_SOON' | 'EXPIRED';
  daysRemaining: number;
}

export interface SendComplianceDigestParams {
  toEmail: string;
  manufacturerName: string;
  companyName: string;
  expiringDocs: ComplianceNotificationItem[];
  expiredDocs: ComplianceNotificationItem[];
}

export async function sendComplianceDigestEmail(params: SendComplianceDigestParams) {
  const { toEmail, manufacturerName, companyName, expiringDocs, expiredDocs } = params;

  const totalActionItems = expiringDocs.length + expiredDocs.length;
  if (totalActionItems === 0) return { skipped: true };

  const subject = `🚨 Action Required: ${totalActionItems} Supplier Certification Alert(s) for ${companyName}`;

  const textContent = `
Hello ${manufacturerName},

This is an automated compliance digest for ${companyName}.

${expiredDocs.length > 0 ? `EXPIRED CERTIFICATIONS (${expiredDocs.length}):\n` + expiredDocs.map(d => ` - ${d.supplierName} | ${d.documentTypeName} (${d.documentTypeCode}) | Expired on: ${d.expirationDate}`).join('\n') + '\n\n' : ''}
${expiringDocs.length > 0 ? `EXPIRING SOON (${expiringDocs.length}):\n` + expiringDocs.map(d => ` - ${d.supplierName} | ${d.documentTypeName} (${d.documentTypeCode}) | Expires in: ${d.daysRemaining} days (${d.expirationDate})`).join('\n') + '\n\n' : ''}

Please log in to your dashboard to review and request updated certificates from your suppliers.
`.trim();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333; margin-top: 0;">Supplier Certification Compliance Alert</h2>
      <p>Hello <strong>${manufacturerName}</strong>,</p>
      <p>Here is your daily compliance status digest for <strong>${companyName}</strong>.</p>

      ${expiredDocs.length > 0 ? `
        <div style="background-color: #ffebe9; border: 1px solid #ff8182; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
          <h3 style="color: #cf222e; margin-top: 0;">🚨 Expired Certifications (${expiredDocs.length})</h3>
          <ul style="padding-left: 20px; color: #333;">
            ${expiredDocs.map(d => `
              <li style="margin-bottom: 8px;">
                <strong>${d.supplierName}</strong> — ${d.documentTypeName} (<code>${d.documentTypeCode}</code>)<br/>
                <span style="color: #cf222e;">Expired on ${d.expirationDate}</span> (${Math.abs(d.daysRemaining)} days ago)
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${expiringDocs.length > 0 ? `
        <div style="background-color: #fff8c5; border: 1px solid #d4a72c; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
          <h3 style="color: #9a6700; margin-top: 0;">⏳ Certifications Expiring Soon (${expiringDocs.length})</h3>
          <ul style="padding-left: 20px; color: #333;">
            ${expiringDocs.map(d => `
              <li style="margin-bottom: 8px;">
                <strong>${d.supplierName}</strong> — ${d.documentTypeName} (<code>${d.documentTypeCode}</code>)<br/>
                <span style="color: #bf8700;">Expires in ${d.daysRemaining} days (${d.expirationDate})</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <p style="margin-top: 25px;">
        <a href="http://localhost:3000/dashboard" style="background-color: #0066cc; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Compliance Dashboard &rarr;
        </a>
      </p>
    </div>
  `;

  if (resend) {
    try {
      const data = await resend.emails.send({
        from: 'Supplier Cert Tracker <notifications@resend.dev>',
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });
      return { success: true, data };
    } catch (error) {
      console.error('❌ Failed to send email via Resend API:', error);
      return { success: false, error };
    }
  } else {
    // Console fallback logger when RESEND_API_KEY is not configured
    console.log('\n📧 [LOCAL DEV EMAIL DISPATCH LOGGER]');
    console.log(`TO: ${toEmail}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY:\n${textContent}\n----------------------------------------\n`);
    return { success: true, mocked: true };
  }
}

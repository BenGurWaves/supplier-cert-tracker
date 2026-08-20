import Link from 'next/link';

export const metadata = {
  title: 'ISO 9001 & AS9100 Supplier Quality Compliance Software | CertTracker',
  description: 'Track ISO 9001, AS9100, and AWS welding quality certifications for manufacturing suppliers. Automated audit readiness for quality managers.',
};

export default function IsoCompliancePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <p><Link href="/marketing">&larr; Back to Marketing Overview</Link></p>
      <h1>ISO 9001 & AS9100 Supplier Quality Compliance</h1>
      <p style={{ fontSize: '18px', color: '#555', lineHeight: '1.6' }}>
        Quality certifications are the backbone of manufacturing trust. When a supplier’s ISO 9001 or AS9100 certification lapses unnoticed, your entire production line faces audit non-conformance penalties.
      </p>

      <h2>How CertTracker Automates ISO Compliance</h2>
      <ol style={{ lineHeight: '1.8' }}>
        <li><strong>Define Industry Standards:</strong> Configure custom document types (ISO 9001:2015, AS9100 Rev D, Nadcap, AWS D1.1 Welding) with specific validity periods.</li>
        <li><strong>Set Mandatory Requirements:</strong> Mark quality standards as mandatory per supplier tier.</li>
        <li><strong>Automated Expiration Alerts:</strong> Receive advance warnings 30, 15, and 7 days prior to certificate expiration.</li>
        <li><strong>Audit Readiness:</strong> Export structured CSV compliance logs instantly during external auditor site visits.</li>
      </ol>

      <div style={{ marginTop: '40px', padding: '25px', backgroundColor: '#f0f7ff', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Ready to streamline your supplier quality audits?</h3>
        <Link href="/signup" style={{ padding: '12px 24px', backgroundColor: '#0066cc', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Create Free Manufacturer Account &rarr;
        </Link>
      </div>
    </div>
  );
}

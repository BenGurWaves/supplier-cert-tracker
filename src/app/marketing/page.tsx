import Metadata from 'next';
import Link from 'next/link';

export const metadata = {
  title: 'Supplier Certification Tracking Software for Small Manufacturers | CertTracker',
  description: 'Automated supplier certification tracking, ISO compliance monitoring, and Certificate of Insurance (COI) renewal management for small manufacturers.',
  keywords: [
    'supplier certification tracking software',
    'supplier compliance management for manufacturers',
    'ISO 9001 supplier tracking',
    'certificate of insurance tracking small manufacturer',
  ],
};

export default function MarketingLandingPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '50px 20px', borderBottom: '1px solid #eee' }}>
        <h1 style={{ fontSize: '36px', lineHeight: '1.2', color: '#111' }}>
          Supplier Certification Tracking Software for Small Manufacturers
        </h1>
        <p style={{ fontSize: '18px', color: '#555', maxWidth: '700px', margin: '20px auto 30px auto' }}>
          Eliminate supply chain compliance risk. Automatically track ISO quality certificates, certificates of insurance (COI), and custom regulatory approvals on rolling renewal dates.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <Link href="/signup" style={{ padding: '14px 28px', backgroundColor: '#0066cc', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px' }}>
            Start Free Manufacturer Account &rarr;
          </Link>
          <Link href="/login" style={{ padding: '14px 28px', backgroundColor: '#f0f0f0', color: '#333', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px' }}>
            Log In
          </Link>
        </div>
      </section>

      {/* Pain Point Comparison Section */}
      <section style={{ padding: '50px 0', borderBottom: '1px solid #eee' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Why Small Manufacturers Replace Spreadsheets With CertTracker</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div style={{ padding: '25px', borderRadius: '8px', backgroundColor: '#fff5f5', border: '1px solid #ffc9c9' }}>
            <h3 style={{ color: '#c53030', marginTop: 0 }}>❌ Spreadsheet & Email Chaos</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#4a5568' }}>
              <li>Certificates lapse unnoticed until an auditor flags them.</li>
              <li>Scattered email threads with hundreds of suppliers.</li>
              <li>No automated advance warning before 30-day expiration cutoffs.</li>
              <li>Scrambling to pull reports during customer or ISO quality audits.</li>
            </ul>
          </div>
          <div style={{ padding: '25px', borderRadius: '8px', backgroundColor: '#f0fff4', border: '1px solid #c6f6d5' }}>
            <h3 style={{ color: '#276749', marginTop: 0 }}>✅ Automated CertTracker System</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#2d3748' }}>
              <li>Configurable document requirements per supplier type.</li>
              <li>Automated daily email digests before expirations occur.</li>
              <li>Real-time worst-case risk status dashboard.</li>
              <li>One-click CSV audit export for ISO & customer compliance requests.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Industry Solutions Links */}
      <section style={{ padding: '50px 0', textAlign: 'center' }}>
        <h2>Targeted Compliance Solutions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '25px' }}>
          <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left' }}>
            <h3>ISO 9001 & AS9100 Quality Compliance</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Ensure all machining, forging, and component suppliers maintain active quality management system certifications.</p>
            <Link href="/solutions/iso-compliance" style={{ color: '#0066cc', fontWeight: 'bold' }}>
              Learn about ISO Compliance &rarr;
            </Link>
          </div>
          <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left' }}>
            <h3>Certificate of Insurance (COI) Tracking</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Prevent liability exposure by monitoring general liability and product coverage expiration dates across suppliers.</p>
            <Link href="/solutions/insurance-tracking" style={{ color: '#0066cc', fontWeight: 'bold' }}>
              Learn about Insurance Tracking &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

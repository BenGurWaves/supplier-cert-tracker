import Link from 'next/link';

export const metadata = {
  title: 'Supplier Certificate of Insurance (COI) Tracking for Manufacturers',
  description: 'Automate Certificate of Insurance (COI) tracking, general liability policy verification, and product coverage renewals across manufacturing suppliers.',
};

export default function InsuranceTrackingPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <p><Link href="/marketing">&larr; Back to Marketing Overview</Link></p>
      <h1>Supplier Certificate of Insurance (COI) Tracking</h1>
      <p style={{ fontSize: '18px', color: '#555', lineHeight: '1.6' }}>
        Uninsured or underinsured suppliers create massive financial liability for small manufacturers. CertTracker automates COI renewal tracking so your factory is never exposed to un-covered risk.
      </p>

      <h2>Key COI Tracking Features</h2>
      <ul style={{ lineHeight: '1.8' }}>
        <li><strong>Policy Period Monitoring:</strong> Track General Liability ($2M+ aggregate), Product Liability, and Workers Compensation policies.</li>
        <li><strong>Automated Renewal Reminders:</strong> Receive daily digests when supplier insurance policies enter the 30-day renewal window.</li>
        <li><strong>Coverage History Log:</strong> Maintain a searchable archive of policy numbers, insurance carrier brokers, and certificate file links.</li>
      </ul>

      <div style={{ marginTop: '40px', padding: '25px', backgroundColor: '#f0f7ff', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Protect your manufacturing operations from insurance lapses.</h3>
        <Link href="/signup" style={{ padding: '12px 24px', backgroundColor: '#0066cc', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Get Started Self-Serve &rarr;
        </Link>
      </div>
    </div>
  );
}

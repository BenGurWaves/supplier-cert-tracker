import { getCurrentManufacturer } from '@/lib/auth';
import { logoutManufacturer } from '@/app/actions/authActions';
import Link from 'next/link';

export default async function NavigationHeader() {
  const manufacturer = await getCurrentManufacturer();

  if (!manufacturer) {
    return (
      <header style={{ padding: '15px 30px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <h3 style={{ margin: 0 }}>Supplier Cert Tracker</h3>
        <div>
          <Link href="/login" style={{ marginRight: '15px' }}>Log In</Link>
          <Link href="/signup">Sign Up</Link>
        </div>
      </header>
    );
  }

  return (
    <header style={{ padding: '15px 30px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'sans-serif', backgroundColor: '#fafafa' }}>
      <div>
        <strong style={{ fontSize: '18px', marginRight: '20px' }}>{manufacturer.companyName}</strong>
        <Link href="/dashboard" style={{ marginRight: '15px', fontWeight: 'bold' }}>Dashboard</Link>
        <Link href="/suppliers" style={{ marginRight: '15px', fontWeight: 'bold' }}>Suppliers</Link>
        <Link href="/document-types" style={{ marginRight: '15px', fontWeight: 'bold' }}>Required Cert Types</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ fontSize: '14px', color: '#555' }}>Logged in as: {manufacturer.email}</span>
        <form action={logoutManufacturer}>
          <button type="submit" style={{ padding: '5px 10px', cursor: 'pointer', background: '#eee', border: '1px solid #ccc', borderRadius: '4px' }}>
            Log Out
          </button>
        </form>
      </div>
    </header>
  );
}

'use client';

import { loginManufacturer } from '@/app/actions/authActions';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const res = await loginManufacturer(formData);
    if (res?.error) {
      setError(res.error);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Manufacturer Login</h2>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      <form action={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
          <input name="email" type="email" required style={{ width: '100%', padding: '8px' }} defaultValue="elena@apexprecision.com" />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input name="password" type="password" required style={{ width: '100%', padding: '8px' }} defaultValue="Password123!" />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Log In
        </button>
      </form>
      <p style={{ marginTop: '15px', fontSize: '14px' }}>
        Don't have an account? <Link href="/signup">Sign up here</Link>
      </p>
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <strong>Demo Seed Credentials:</strong><br/>
        Email: <code>elena@apexprecision.com</code><br/>
        Password: <code>Password123!</code>
      </div>
    </div>
  );
}

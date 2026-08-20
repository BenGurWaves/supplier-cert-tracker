'use client';

import { signupManufacturer } from '@/app/actions/authActions';
import { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const res = await signupManufacturer(formData);
    if (res?.error) {
      setError(res.error);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Create Manufacturer Account</h2>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      <form action={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Your Full Name</label>
          <input name="name" type="text" required style={{ width: '100%', padding: '8px' }} placeholder="e.g. Sarah Connor" />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Manufacturing Company Name</label>
          <input name="companyName" type="text" required style={{ width: '100%', padding: '8px' }} placeholder="e.g. Cyberdyne Systems" />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
          <input name="email" type="email" required style={{ width: '100%', padding: '8px' }} placeholder="sarah@cyberdyne.com" />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input name="password" type="password" required style={{ width: '100%', padding: '8px' }} placeholder="••••••••" />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#008055', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sign Up & Create Account
        </button>
      </form>
      <p style={{ marginTop: '15px', fontSize: '14px' }}>
        Already have an account? <Link href="/login">Log in here</Link>
      </p>
    </div>
  );
}

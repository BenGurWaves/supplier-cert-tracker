'use server';

import { prisma } from '@/lib/prisma';
import { createSession, destroySession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function signupManufacturer(formData: FormData) {
  const name = formData.get('name') as string;
  const companyName = formData.get('companyName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password || !name || !companyName) {
    return { error: 'All fields are required.' };
  }

  const existing = await prisma.manufacturer.findUnique({
    where: { email },
  });

  if (existing) {
    return { error: 'An account with this email already exists.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const manufacturer = await prisma.manufacturer.create({
    data: {
      name,
      companyName,
      email,
      passwordHash,
    },
  });

  // Default initial Document Types for new manufacturer
  await prisma.documentType.createMany({
    data: [
      {
        manufacturerId: manufacturer.id,
        name: 'General Liability Insurance',
        code: 'INS-GEN',
        description: 'Standard General Liability Insurance Policy',
        isRequired: true,
        validityPeriodDays: 365,
      },
      {
        manufacturerId: manufacturer.id,
        name: 'ISO 9001:2015 Quality Management',
        code: 'ISO-9001',
        description: 'ISO Quality System Certification',
        isRequired: true,
        validityPeriodDays: 1095,
      },
    ],
  });

  await createSession({
    manufacturerId: manufacturer.id,
    email: manufacturer.email,
    companyName: manufacturer.companyName,
  });

  redirect('/suppliers');
}

export async function loginManufacturer(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const manufacturer = await prisma.manufacturer.findUnique({
    where: { email },
  });

  if (!manufacturer) {
    return { error: 'Invalid credentials.' };
  }

  const isValid = await bcrypt.compare(password, manufacturer.passwordHash);

  if (!isValid) {
    return { error: 'Invalid credentials.' };
  }

  await createSession({
    manufacturerId: manufacturer.id,
    email: manufacturer.email,
    companyName: manufacturer.companyName,
  });

  redirect('/suppliers');
}

export async function logoutManufacturer() {
  await destroySession();
  redirect('/login');
}

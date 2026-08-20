'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentManufacturer } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createDocumentType(formData: FormData) {
  const manufacturer = await getCurrentManufacturer();
  if (!manufacturer) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const code = formData.get('code') as string;
  const description = (formData.get('description') as string) || null;
  const isRequired = formData.get('isRequired') === 'on' || formData.get('isRequired') === 'true';
  const validityPeriodDaysStr = formData.get('validityPeriodDays') as string;
  const validityPeriodDays = validityPeriodDaysStr ? parseInt(validityPeriodDaysStr, 10) : null;

  if (!name || !code) {
    throw new Error('Name and Code are required for Document Type.');
  }

  await prisma.documentType.create({
    data: {
      manufacturerId: manufacturer.id,
      name,
      code: code.toUpperCase().trim(),
      description,
      isRequired,
      validityPeriodDays,
    },
  });

  revalidatePath('/document-types');
}

export async function deleteDocumentType(documentTypeId: string) {
  const manufacturer = await getCurrentManufacturer();
  if (!manufacturer) throw new Error('Unauthorized');

  const existing = await prisma.documentType.findFirst({
    where: { id: documentTypeId, manufacturerId: manufacturer.id },
  });

  if (!existing) throw new Error('Document type not found or unauthorized.');

  await prisma.documentType.delete({
    where: { id: documentTypeId },
  });

  revalidatePath('/document-types');
}

'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentManufacturer } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createSupplier(formData: FormData) {
  const manufacturer = await getCurrentManufacturer();
  if (!manufacturer) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const contactEmail = formData.get('contactEmail') as string;
  const contactPhone = (formData.get('contactPhone') as string) || null;
  const taxId = (formData.get('taxId') as string) || null;
  const status = (formData.get('status') as string) || 'ACTIVE';

  if (!name || !contactEmail) {
    throw new Error('Supplier name and contact email are required.');
  }

  await prisma.supplier.create({
    data: {
      manufacturerId: manufacturer.id,
      name,
      contactEmail,
      contactPhone,
      taxId,
      status,
    },
  });

  revalidatePath('/suppliers');
}

export async function updateSupplier(formData: FormData) {
  const manufacturer = await getCurrentManufacturer();
  if (!manufacturer) throw new Error('Unauthorized');

  const supplierId = formData.get('supplierId') as string;
  const name = formData.get('name') as string;
  const contactEmail = formData.get('contactEmail') as string;
  const contactPhone = (formData.get('contactPhone') as string) || null;
  const taxId = (formData.get('taxId') as string) || null;
  const status = formData.get('status') as string;

  // Verify ownership
  const existing = await prisma.supplier.findFirst({
    where: { id: supplierId, manufacturerId: manufacturer.id },
  });

  if (!existing) throw new Error('Supplier not found or unauthorized.');

  await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      name,
      contactEmail,
      contactPhone,
      taxId,
      status,
    },
  });

  revalidatePath('/suppliers');
}

export async function deleteSupplier(supplierId: string) {
  const manufacturer = await getCurrentManufacturer();
  if (!manufacturer) throw new Error('Unauthorized');

  const existing = await prisma.supplier.findFirst({
    where: { id: supplierId, manufacturerId: manufacturer.id },
  });

  if (!existing) throw new Error('Supplier not found or unauthorized.');

  await prisma.supplier.delete({
    where: { id: supplierId },
  });

  revalidatePath('/suppliers');
}

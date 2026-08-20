'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentManufacturer } from '@/lib/auth';
import { DocumentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function createSupplierDocument(formData: FormData) {
  const manufacturer = await getCurrentManufacturer();
  if (!manufacturer) throw new Error('Unauthorized');

  const supplierId = formData.get('supplierId') as string;
  const documentTypeId = formData.get('documentTypeId') as string;
  const documentNumber = (formData.get('documentNumber') as string) || null;
  const fileUrl = (formData.get('fileUrl') as string) || null;
  const issueDateStr = formData.get('issueDate') as string;
  const expirationDateStr = formData.get('expirationDate') as string;
  const notes = (formData.get('notes') as string) || null;

  if (!supplierId || !documentTypeId || !issueDateStr || !expirationDateStr) {
    throw new Error('Supplier, Document Type, Issue Date, and Expiration Date are required.');
  }

  // Verify supplier belongs to this manufacturer
  const supplier = await prisma.supplier.findFirst({
    where: { id: supplierId, manufacturerId: manufacturer.id },
  });

  if (!supplier) throw new Error('Supplier not found or unauthorized.');

  const issueDate = new Date(issueDateStr);
  const expirationDate = new Date(expirationDateStr);
  const now = new Date();

  // Automatic status calculation based on expiration date
  let status: DocumentStatus = DocumentStatus.VALID;
  const daysToExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysToExpiration < 0) {
    status = DocumentStatus.EXPIRED;
  } else if (daysToExpiration <= 30) {
    status = DocumentStatus.EXPIRING_SOON;
  }

  await prisma.supplierDocument.create({
    data: {
      supplierId,
      documentTypeId,
      documentNumber,
      fileUrl,
      issueDate,
      expirationDate,
      status,
      notes,
    },
  });

  revalidatePath(`/suppliers/${supplierId}/documents`);
  revalidatePath('/suppliers');
}

export async function deleteSupplierDocument(documentId: string, supplierId: string) {
  const manufacturer = await getCurrentManufacturer();
  if (!manufacturer) throw new Error('Unauthorized');

  const document = await prisma.supplierDocument.findFirst({
    where: {
      id: documentId,
      supplier: {
        manufacturerId: manufacturer.id,
      },
    },
  });

  if (!document) throw new Error('Document not found or unauthorized.');

  await prisma.supplierDocument.delete({
    where: { id: documentId },
  });

  revalidatePath(`/suppliers/${supplierId}/documents`);
  revalidatePath('/suppliers');
}

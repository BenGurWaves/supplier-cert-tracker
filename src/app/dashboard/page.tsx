import { getCurrentManufacturer } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { evaluateSupplierCompliance, EvaluatedSupplierCompliance } from '@/lib/compliance';
import { redirect } from 'next/navigation';
import DashboardClientView from './DashboardClientView';

export default async function DashboardPage() {
  const manufacturer = await getCurrentManufacturer();

  if (!manufacturer) {
    redirect('/login');
  }

  // Retrieve configured document types for this manufacturer
  const configuredDocTypes = await prisma.documentType.findMany({
    where: { manufacturerId: manufacturer.id },
  });

  // Retrieve all suppliers for this manufacturer with their logged documents
  const suppliersWithDocs = await prisma.supplier.findMany({
    where: { manufacturerId: manufacturer.id },
    include: {
      documents: {
        include: {
          documentType: true,
        },
      },
    },
  });

  const warningThresholdDays = 30;
  const now = new Date();

  // Evaluate compliance status for all suppliers
  const evaluatedSuppliers: EvaluatedSupplierCompliance[] = suppliersWithDocs.map((supplier) =>
    evaluateSupplierCompliance(
      {
        id: supplier.id,
        name: supplier.name,
        contactEmail: supplier.contactEmail,
        contactPhone: supplier.contactPhone,
        status: supplier.status,
        documents: supplier.documents.map((d) => ({
          id: d.id,
          documentTypeId: d.documentTypeId,
          expirationDate: d.expirationDate,
          status: d.status,
          documentType: {
            id: d.documentType.id,
            name: d.documentType.name,
            code: d.documentType.code,
            isRequired: d.documentType.isRequired,
          },
        })),
      },
      configuredDocTypes.map((dt) => ({
        id: dt.id,
        name: dt.name,
        code: dt.code,
        isRequired: dt.isRequired,
      })),
      warningThresholdDays,
      now
    )
  );

  // Sort suppliers by severity rank (1: EXPIRED -> 2: MISSING -> 3: EXPIRING_SOON -> 4: VALID)
  evaluatedSuppliers.sort((a, b) => a.severityRank - b.severityRank);

  return (
    <DashboardClientView
      initialSuppliers={evaluatedSuppliers}
      warningThresholdDays={warningThresholdDays}
      companyName={manufacturer.companyName}
    />
  );
}

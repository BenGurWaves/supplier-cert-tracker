import { NextResponse } from 'next/server';
import { getCurrentManufacturer } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { evaluateSupplierCompliance } from '@/lib/compliance';

export async function GET() {
  const manufacturer = await getCurrentManufacturer();

  if (!manufacturer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Retrieve configured document types
  const configuredDocTypes = await prisma.documentType.findMany({
    where: { manufacturerId: manufacturer.id },
  });

  // Retrieve all suppliers for this manufacturer
  const suppliers = await prisma.supplier.findMany({
    where: { manufacturerId: manufacturer.id },
    include: {
      documents: {
        include: {
          documentType: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  const now = new Date();
  const warningThresholdDays = 30;

  // Build CSV Rows
  const headers = [
    'Supplier Name',
    'Contact Email',
    'Overall Supplier Status',
    'Document Type Code',
    'Document Type Name',
    'Is Mandatory',
    'Document Status',
    'Expiration Date',
    'Days Remaining',
    'Document Number',
    'File URL',
  ];

  const rows: string[][] = [headers];

  suppliers.forEach((s) => {
    const evaluated = evaluateSupplierCompliance(
      {
        id: s.id,
        name: s.name,
        contactEmail: s.contactEmail,
        contactPhone: s.contactPhone,
        status: s.status,
        documents: s.documents.map((d) => ({
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
    );

    evaluated.evaluatedDocs.forEach((doc) => {
      // Find original doc details if uploaded
      const rawDoc = s.documents.find((d) => d.id === doc.docId);

      rows.push([
        escapeCsv(s.name),
        escapeCsv(s.contactEmail),
        escapeCsv(evaluated.overallComplianceStatus),
        escapeCsv(doc.documentTypeCode),
        escapeCsv(doc.documentTypeName),
        doc.isRequired ? 'YES' : 'NO',
        escapeCsv(doc.status),
        doc.expirationDate ? doc.expirationDate.toISOString().split('T')[0] : 'N/A',
        doc.daysRemaining !== undefined ? String(doc.daysRemaining) : 'N/A',
        escapeCsv(rawDoc?.documentNumber || 'N/A'),
        escapeCsv(rawDoc?.fileUrl || 'N/A'),
      ]);
    });
  });

  const csvContent = rows.map((r) => r.join(',')).join('\n');
  const filename = `compliance-audit-report-${manufacturer.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${now.toISOString().split('T')[0]}.csv`;

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

function escapeCsv(field: string): string {
  if (!field) return '""';
  const clean = field.replace(/"/g, '""');
  return `"${clean}"`;
}

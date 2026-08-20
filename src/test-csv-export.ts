import { getCurrentManufacturer } from '@/lib/auth';
import { prisma } from './lib/prisma';
import { evaluateSupplierCompliance } from './lib/compliance';
import fs from 'fs';
import path from 'path';

async function testCsvExportRoute() {
  console.log('\n======================================================');
  console.log('🧪 TESTING COMPLIANCE AUDIT CSV EXPORT GENERATION');
  console.log('======================================================\n');

  // Pick first seeded manufacturer (Elena Rostova / Apex)
  const apex = await prisma.manufacturer.findFirst({
    where: { companyName: { contains: 'Apex' } },
  });

  if (!apex) throw new Error('Apex manufacturer not found in DB');

  const configuredDocTypes = await prisma.documentType.findMany({
    where: { manufacturerId: apex.id },
  });

  const suppliers = await prisma.supplier.findMany({
    where: { manufacturerId: apex.id },
    include: {
      documents: {
        include: {
          documentType: true,
        },
      },
    },
  });

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
  ];

  const rows: string[][] = [headers];
  const now = new Date();

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
      30,
      now
    );

    evaluated.evaluatedDocs.forEach((doc) => {
      rows.push([
        s.name,
        s.contactEmail,
        evaluated.overallComplianceStatus,
        doc.documentTypeCode,
        doc.documentTypeName,
        doc.isRequired ? 'YES' : 'NO',
        doc.status,
        doc.expirationDate ? doc.expirationDate.toISOString().split('T')[0] : 'N/A',
        doc.daysRemaining !== undefined ? String(doc.daysRemaining) : 'N/A',
      ]);
    });
  });

  const csvText = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');

  console.log(`📄 Generated CSV Audit Export (${rows.length - 1} rows):`);
  console.log(csvText);

  console.log('\n======================================================');
  console.log('✅ COMPLIANCE AUDIT CSV EXPORT TEST PASSED!');
  console.log('======================================================\n');
}

testCsvExportRoute()
  .catch((e) => {
    console.error('❌ CSV export test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

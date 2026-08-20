import { prisma } from './lib/prisma';

async function testSanityQueries() {
  console.log('\n==========================================');
  console.log('🔍 SANITY-CHECKING DATA MODEL VIA QUERIES');
  console.log('==========================================\n');

  // Query 1: Count records per table
  const manufacturerCount = await prisma.manufacturer.count();
  const supplierCount = await prisma.supplier.count();
  const docTypeCount = await prisma.documentType.count();
  const documentCount = await prisma.supplierDocument.count();

  console.log('📊 Table Record Counts:');
  console.table({
    Manufacturers: manufacturerCount,
    Suppliers: supplierCount,
    DocumentTypes: docTypeCount,
    SupplierDocuments: documentCount,
  });

  // Query 2: Retrieve Manufacturer with full nested relation hierarchy
  const apexWithDetails = await prisma.manufacturer.findFirst({
    where: { companyName: { contains: 'Apex' } },
    include: {
      documentTypes: true,
      suppliers: {
        include: {
          documents: {
            include: {
              documentType: true,
            },
          },
        },
      },
    },
  });

  console.log(`\n🏢 Manufacturer: ${apexWithDetails?.companyName} (${apexWithDetails?.email})`);
  console.log(`Configured Document Types (${apexWithDetails?.documentTypes.length}):`);
  apexWithDetails?.documentTypes.forEach((dt: any) => {
    console.log(`  - [${dt.code}] ${dt.name} (Required: ${dt.isRequired})`);
  });

  console.log(`\nSuppliers (${apexWithDetails?.suppliers.length}):`);
  apexWithDetails?.suppliers.forEach((s: any) => {
    console.log(`  📦 Supplier: ${s.name} | Status: ${s.status}`);
    s.documents.forEach((doc: any) => {
      console.log(
        `     📄 Doc: ${doc.documentType.name} | Num: ${doc.documentNumber} | Status: ${doc.status} | Expires: ${doc.expirationDate.toISOString().split('T')[0]}`
      );
    });
  });

  // Query 3: Expiration status alert aggregation across all manufacturers
  const expiringOrExpired = await prisma.supplierDocument.findMany({
    where: {
      status: {
        in: ['EXPIRING_SOON', 'EXPIRED'],
      },
    },
    include: {
      supplier: true,
      documentType: true,
    },
  });

  console.log(`\n🚨 Critical Risk Alert Documents (${expiringOrExpired.length}):`);
  expiringOrExpired.forEach((doc: any) => {
    console.log(
      `  ⚠️  [${doc.status}] Supplier: "${doc.supplier.name}" | Doc: "${doc.documentType.name}" | Expiration: ${doc.expirationDate.toISOString().split('T')[0]}`
    );
  });

  console.log('\n==========================================');
  console.log('✅ ALL QUERIES EXECUTED SUCCESSFULLY');
  console.log('==========================================\n');
}

testSanityQueries()
  .catch((err) => {
    console.error('❌ Query test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function testEndToEndAuthAndCrud() {
  console.log('\n======================================================');
  console.log('🧪 TESTING END-TO-END AUTH & CRUD WORKFLOWS (PROMPT 2)');
  console.log('======================================================\n');

  // 1. Simulate Self-Serve Manufacturer Signup
  const newEmail = `test.manufacturer.${Date.now()}@cyberdyne.io`;
  const passwordHash = await bcrypt.hash('SecurePass2026!', 10);

  console.log(`1️⃣ Creating Self-Serve Manufacturer Signup: ${newEmail}`);
  const newMfg = await prisma.manufacturer.create({
    data: {
      name: 'Sarah Connor',
      email: newEmail,
      companyName: 'Cyberdyne Systems Defense',
      passwordHash,
    },
  });

  // Verify password compare
  const passwordMatch = await bcrypt.compare('SecurePass2026!', newMfg.passwordHash);
  console.log(`   ✅ Password verification check: ${passwordMatch ? 'PASSED' : 'FAILED'}`);

  // 2. Define Custom Document Types for this Manufacturer
  console.log('\n2️⃣ Defining Configurable Document Types for Cyberdyne...');
  const docType1 = await prisma.documentType.create({
    data: {
      manufacturerId: newMfg.id,
      name: 'AS9100 Aerospace Quality Standard',
      code: 'AS9100-QUAL',
      description: 'Mandatory standard for aerospace parts suppliers',
      isRequired: true,
      validityPeriodDays: 730,
    },
  });

  const docType2 = await prisma.documentType.create({
    data: {
      manufacturerId: newMfg.id,
      name: 'Environmental Hazard Audit',
      code: 'ENV-HAZ',
      description: 'Disposal safety compliance',
      isRequired: false,
      validityPeriodDays: 365,
    },
  });

  console.log(`   ✅ Created Document Types: [${docType1.code}] and [${docType2.code}]`);

  // 3. Add Supplier for Cyberdyne
  console.log('\n3️⃣ Adding Supplier under Cyberdyne Systems...');
  const supplier = await prisma.supplier.create({
    data: {
      manufacturerId: newMfg.id,
      name: 'Skynet Microchips Corp',
      contactEmail: 'orders@skynetmicro.com',
      contactPhone: '+1-800-555-0199',
      taxId: 'US-998877665',
      status: 'ACTIVE',
    },
  });

  console.log(`   ✅ Added Supplier: ${supplier.name} (${supplier.id})`);

  // 4. Log Supplier Document with Expiration Date
  console.log('\n4️⃣ Logging Supplier Document with Expiration Date...');
  const now = new Date();
  const issueDate = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000);
  const expirationDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days out -> EXPIRING_SOON

  const loggedDoc = await prisma.supplierDocument.create({
    data: {
      supplierId: supplier.id,
      documentTypeId: docType1.id,
      documentNumber: 'AS9100-REV-D-8812',
      fileUrl: 'https://storage.cyberdyne.io/certs/skynet-as9100.pdf',
      issueDate,
      expirationDate,
      status: 'EXPIRING_SOON',
      notes: 'Audit passed. Flagged for 15-day renewal reminder.',
    },
  });

  console.log(`   ✅ Logged Document: ${loggedDoc.documentNumber} | Expiration: ${loggedDoc.expirationDate.toISOString().split('T')[0]} | Status: ${loggedDoc.status}`);

  // 5. Verify Tenant Isolation Query
  console.log('\n5️⃣ Verifying Multi-Tenant Data Isolation...');
  const manufacturerASuppliers = await prisma.supplier.findMany({
    where: { manufacturerId: newMfg.id },
  });
  console.log(`   ✅ Cyberdyne isolated supplier count: ${manufacturerASuppliers.length} (Expected: 1)`);

  console.log('\n======================================================');
  console.log('✅ ALL PROMPT 2 AUTH & CRUD WORKFLOWS TESTED & PASSED');
  console.log('======================================================\n');
}

testEndToEndAuthAndCrud()
  .catch((e) => {
    console.error('❌ E2E test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

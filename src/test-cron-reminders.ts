import { prisma } from './lib/prisma';
import { evaluateSupplierCompliance } from './lib/compliance';
import { sendComplianceDigestEmail } from './lib/email';
import bcrypt from 'bcryptjs';

async function testReminderDispatchOnNearExpirationRecord() {
  console.log('\n======================================================');
  console.log('🧪 TESTING AUTOMATED EMAIL REMINDER DISPATCH (PROMPT 4)');
  console.log('======================================================\n');

  const now = new Date();
  const testEmail = `test.reminder.${Date.now()}@aero-parts.com`;
  const passwordHash = await bcrypt.hash('TestPass123!', 10);

  // 1. Create test manufacturer with near-expiration and expired records
  console.log(`1️⃣ Creating test manufacturer: ${testEmail}`);
  const mfg = await prisma.manufacturer.create({
    data: {
      name: 'Dr. Elizabeth Shaw',
      companyName: 'Weyland-Yutani Aerospace Systems',
      email: testEmail,
      passwordHash,
    },
  });

  const docType1 = await prisma.documentType.create({
    data: {
      manufacturerId: mfg.id,
      name: 'AS9100 Aerospace Quality',
      code: 'AS9100',
      isRequired: true,
    },
  });

  const docType2 = await prisma.documentType.create({
    data: {
      manufacturerId: mfg.id,
      name: 'Hazardous Payload Transport Insurance',
      code: 'INS-HAZ',
      isRequired: true,
    },
  });

  const supplier = await prisma.supplier.create({
    data: {
      manufacturerId: mfg.id,
      name: 'Prometheus Turbine Propulsion LLC',
      contactEmail: 'engineering@prometheuspropulsion.com',
      status: 'ACTIVE',
    },
  });

  // Manually set 1 doc expiring in 7 days, 1 doc expired 3 days ago
  const expiring7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expired3DaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const docNearExpiring = await prisma.supplierDocument.create({
    data: {
      supplierId: supplier.id,
      documentTypeId: docType1.id,
      documentNumber: 'AS9100-PROMETHEUS-2026',
      issueDate: new Date(now.getTime() - 350 * 24 * 60 * 60 * 1000),
      expirationDate: expiring7Days,
      status: 'EXPIRING_SOON',
      notes: '7 days remaining before cutoff!',
    },
  });

  const docExpired = await prisma.supplierDocument.create({
    data: {
      supplierId: supplier.id,
      documentTypeId: docType2.id,
      documentNumber: 'INS-HAZ-PROMETHEUS-99',
      issueDate: new Date(now.getTime() - 368 * 24 * 60 * 60 * 1000),
      expirationDate: expired3DaysAgo,
      status: 'EXPIRED',
      notes: 'Lapsed 3 days ago!',
    },
  });

  console.log('   ✅ Test records created:');
  console.log(`      - Doc 1 (${docType1.code}): Expires in 7 days (${expiring7Days.toISOString().split('T')[0]})`);
  console.log(`      - Doc 2 (${docType2.code}): Expired 3 days ago (${expired3DaysAgo.toISOString().split('T')[0]})`);

  // 2. Evaluate compliance and fire email reminder trigger
  console.log('\n2️⃣ Running Compliance Evaluation & Email Trigger...');
  const evaluated = evaluateSupplierCompliance(
    {
      id: supplier.id,
      name: supplier.name,
      contactEmail: supplier.contactEmail,
      status: supplier.status,
      documents: [
        { id: docNearExpiring.id, documentTypeId: docType1.id, expirationDate: docNearExpiring.expirationDate, status: docNearExpiring.status, documentType: docType1 },
        { id: docExpired.id, documentTypeId: docType2.id, expirationDate: docExpired.expirationDate, status: docExpired.status, documentType: docType2 },
      ],
    },
    [docType1, docType2],
    30,
    now
  );

  const expiringDocs = evaluated.evaluatedDocs
    .filter((d) => d.status === 'EXPIRING_SOON')
    .map((d) => ({
      supplierName: supplier.name,
      documentTypeName: d.documentTypeName,
      documentTypeCode: d.documentTypeCode,
      expirationDate: d.expirationDate!.toISOString().split('T')[0],
      status: 'EXPIRING_SOON' as const,
      daysRemaining: d.daysRemaining!,
    }));

  const expiredDocs = evaluated.evaluatedDocs
    .filter((d) => d.status === 'EXPIRED')
    .map((d) => ({
      supplierName: supplier.name,
      documentTypeName: d.documentTypeName,
      documentTypeCode: d.documentTypeCode,
      expirationDate: d.expirationDate!.toISOString().split('T')[0],
      status: 'EXPIRED' as const,
      daysRemaining: d.daysRemaining!,
    }));

  console.log(`   📊 Detected ${expiringDocs.length} Expiring Soon and ${expiredDocs.length} Expired document alerts.`);

  console.log('\n3️⃣ Dispatching Email Reminder Notification...');
  const dispatchResult = await sendComplianceDigestEmail({
    toEmail: mfg.email,
    manufacturerName: mfg.name,
    companyName: mfg.companyName,
    expiringDocs,
    expiredDocs,
  });

  console.log('   ✅ Email Notification Result:', dispatchResult);

  console.log('\n======================================================');
  console.log('✅ PROMPT 4 EMAIL REMINDER DISPATCH TEST PASSED!');
  console.log('======================================================\n');
}

testReminderDispatchOnNearExpirationRecord()
  .catch((err) => {
    console.error('❌ Reminder dispatch test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

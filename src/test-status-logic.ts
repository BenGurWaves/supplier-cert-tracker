import { evaluateSupplierCompliance, DocumentComplianceStatus } from './lib/compliance';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✅ ${message}`);
  }
}

async function testStatusLogicScenarios() {
  console.log('\n======================================================');
  console.log('🧪 TESTING COMPLIANCE STATUS CALCULATION LOGIC');
  console.log('======================================================\n');

  const refDate = new Date('2026-08-20T12:00:00Z');

  // Standard Configured Document Types
  const docTypeIso = { id: 'dt-1', name: 'ISO 9001', code: 'ISO-9001', isRequired: true };
  const docTypeIns = { id: 'dt-2', name: 'General Liability Insurance', code: 'INS-GEN', isRequired: true };
  const docTypeOpt = { id: 'dt-3', name: 'Welding Cert', code: 'WELD', isRequired: false };

  const configuredTypes = [docTypeIso, docTypeIns, docTypeOpt];

  // Test Case 1: Fully Valid Supplier
  console.log('1️⃣ Test Case 1: Fully Valid Supplier (All required docs > 30 days)');
  const validSupplier = {
    id: 's-1',
    name: 'Valid Metals Corp',
    contactEmail: 'valid@metals.com',
    status: 'ACTIVE',
    documents: [
      { id: 'doc-1', documentTypeId: 'dt-1', expirationDate: new Date('2027-08-20T12:00:00Z'), status: 'VALID', documentType: docTypeIso },
      { id: 'doc-2', documentTypeId: 'dt-2', expirationDate: new Date('2027-01-01T12:00:00Z'), status: 'VALID', documentType: docTypeIns },
    ],
  };

  const eval1 = evaluateSupplierCompliance(validSupplier, configuredTypes, 30, refDate);
  assert(eval1.overallComplianceStatus === 'VALID', 'Overall status should be VALID');
  assert(eval1.severityRank === 4, 'Severity rank should be 4 (best)');

  // Test Case 2: Expiring Soon Supplier
  console.log('\n2️⃣ Test Case 2: Expiring Soon Supplier (Doc expires in 15 days)');
  const expiringSupplier = {
    id: 's-2',
    name: 'Expiring Tech LLC',
    contactEmail: 'info@expiring.com',
    status: 'ACTIVE',
    documents: [
      { id: 'doc-1', documentTypeId: 'dt-1', expirationDate: new Date('2027-08-20T12:00:00Z'), status: 'VALID', documentType: docTypeIso },
      { id: 'doc-2', documentTypeId: 'dt-2', expirationDate: new Date('2026-09-04T12:00:00Z'), status: 'EXPIRING_SOON', documentType: docTypeIns }, // 15 days out
    ],
  };

  const eval2 = evaluateSupplierCompliance(expiringSupplier, configuredTypes, 30, refDate);
  assert(eval2.overallComplianceStatus === 'EXPIRING_SOON', 'Overall status should be EXPIRING_SOON');
  assert(eval2.expiringSoonCount === 1, 'Expiring soon count should be 1');
  assert(eval2.severityRank === 3, 'Severity rank should be 3');

  // Test Case 3: Expired Supplier
  console.log('\n3️⃣ Test Case 3: Expired Supplier (Doc expired 10 days ago)');
  const expiredSupplier = {
    id: 's-3',
    name: 'Lapsed Forging Co',
    contactEmail: 'qa@lapsed.com',
    status: 'ACTIVE',
    documents: [
      { id: 'doc-1', documentTypeId: 'dt-1', expirationDate: new Date('2026-08-10T12:00:00Z'), status: 'EXPIRED', documentType: docTypeIso }, // Expired
      { id: 'doc-2', documentTypeId: 'dt-2', expirationDate: new Date('2027-01-01T12:00:00Z'), status: 'VALID', documentType: docTypeIns },
    ],
  };

  const eval3 = evaluateSupplierCompliance(expiredSupplier, configuredTypes, 30, refDate);
  assert(eval3.overallComplianceStatus === 'EXPIRED', 'Overall status should be EXPIRED');
  assert(eval3.expiredCount === 1, 'Expired count should be 1');
  assert(eval3.severityRank === 1, 'Severity rank should be 1 (worst)');

  // Test Case 4: Missing Required Document Supplier
  console.log('\n4️⃣ Test Case 4: Missing Required Document Supplier (No ISO 9001 logged)');
  const missingSupplier = {
    id: 's-4',
    name: 'Newbie Fasteners',
    contactEmail: 'hello@newbie.com',
    status: 'ONBOARDING',
    documents: [
      { id: 'doc-2', documentTypeId: 'dt-2', expirationDate: new Date('2027-01-01T12:00:00Z'), status: 'VALID', documentType: docTypeIns },
      // ISO-9001 (dt-1) missing!
    ],
  };

  const eval4 = evaluateSupplierCompliance(missingSupplier, configuredTypes, 30, refDate);
  assert(eval4.overallComplianceStatus === 'MISSING', 'Overall status should be MISSING');
  assert(eval4.missingCount === 1, 'Missing count should be 1');
  assert(eval4.severityRank === 2, 'Severity rank should be 2');

  console.log('\n======================================================');
  console.log('✅ ALL COMPLIANCE STATUS LOGIC TEST CASES PASSED!');
  console.log('======================================================\n');
}

testStatusLogicScenarios();

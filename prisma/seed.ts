import { PrismaClient, DocumentStatus } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: './dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing tables
  await prisma.supplierDocument.deleteMany();
  await prisma.documentType.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.manufacturer.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // Create 3 Manufacturers
  const apex = await prisma.manufacturer.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena@apexprecision.com',
      passwordHash: defaultPasswordHash,
      companyName: 'Apex Precision Machining',
    },
  });

  const titan = await prisma.manufacturer.create({
    data: {
      name: 'Marcus Vance',
      email: 'm.vance@titanrobotics.io',
      passwordHash: defaultPasswordHash,
      companyName: 'Titan Robotics & Automation',
    },
  });

  const aero = await prisma.manufacturer.create({
    data: {
      name: 'Sarah Chen',
      email: 'schen@aerocomp.org',
      passwordHash: defaultPasswordHash,
      companyName: 'AeroComposite Systems',
    },
  });

  // Create Configurable Document Types per Manufacturer
  const iso9001Apex = await prisma.documentType.create({
    data: {
      manufacturerId: apex.id,
      name: 'ISO 9001:2015 Quality Standard',
      code: 'ISO-9001',
      description: 'Standard Quality Management System Certification',
      isRequired: true,
      validityPeriodDays: 1095,
    },
  });

  const insApex = await prisma.documentType.create({
    data: {
      manufacturerId: apex.id,
      name: 'General Liability Insurance',
      code: 'INS-GEN',
      description: 'Minimum $2M general aggregate policy required for site access',
      isRequired: true,
      validityPeriodDays: 365,
    },
  });

  const qualApex = await prisma.documentType.create({
    data: {
      manufacturerId: apex.id,
      name: 'Specialized Welding Inspection Audit',
      code: 'QUAL-WELD',
      description: 'AWS D1.1 structural welding approval document',
      isRequired: false,
      validityPeriodDays: 730,
    },
  });

  const iso14001Titan = await prisma.documentType.create({
    data: {
      manufacturerId: titan.id,
      name: 'ISO 14001 Environmental Standard',
      code: 'ISO-14001',
      description: 'Environmental management compliance verification',
      isRequired: true,
      validityPeriodDays: 1095,
    },
  });

  const rohsTitan = await prisma.documentType.create({
    data: {
      manufacturerId: titan.id,
      name: 'RoHS & REACH Compliance Declaration',
      code: 'ROHS-REACH',
      description: 'Hazardous substance compliance declaration for sub-assemblies',
      isRequired: true,
      validityPeriodDays: 365,
    },
  });

  // Create Suppliers
  const s1Apex = await prisma.supplier.create({
    data: {
      manufacturerId: apex.id,
      name: 'Vanguard Alloy Works',
      contactEmail: 'orders@vanguardalloy.com',
      contactPhone: '+1-555-019-2831',
      taxId: 'US-987654321',
      status: 'ACTIVE',
    },
  });

  const s2Apex = await prisma.supplier.create({
    data: {
      manufacturerId: apex.id,
      name: 'Krypton Heat Treating LLC',
      contactEmail: 'qa@kryptonheat.com',
      contactPhone: '+1-555-014-9922',
      taxId: 'US-123498765',
      status: 'ACTIVE',
    },
  });

  const s3Apex = await prisma.supplier.create({
    data: {
      manufacturerId: apex.id,
      name: 'Nexus Precision Fasteners',
      contactEmail: 'compliance@nexusfasteners.com',
      contactPhone: '+1-555-017-4488',
      status: 'ONBOARDING',
    },
  });

  const s1Titan = await prisma.supplier.create({
    data: {
      manufacturerId: titan.id,
      name: 'HyperDrive Motors Corp',
      contactEmail: 'sales@hyperdrivemotors.com',
      contactPhone: '+1-555-018-7711',
      status: 'ACTIVE',
    },
  });

  // Create Supplier Documents
  const now = new Date();
  const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  await prisma.supplierDocument.create({
    data: {
      supplierId: s1Apex.id,
      documentTypeId: iso9001Apex.id,
      documentNumber: 'ISO-9001-2023-VAW',
      fileUrl: 'https://storage.provider.com/certs/vaw-iso9001.pdf',
      issueDate: daysFromNow(-365),
      expirationDate: daysFromNow(365),
      status: DocumentStatus.VALID,
      notes: 'Audited by TUV Rhineland. All non-conformances cleared.',
    },
  });

  await prisma.supplierDocument.create({
    data: {
      supplierId: s1Apex.id,
      documentTypeId: insApex.id,
      documentNumber: 'POL-GL-99812-VAW',
      fileUrl: 'https://storage.provider.com/certs/vaw-insurance-2026.pdf',
      issueDate: daysFromNow(-350),
      expirationDate: daysFromNow(15),
      status: DocumentStatus.EXPIRING_SOON,
      notes: 'Automated renewal prompt sent to broker.',
    },
  });

  await prisma.supplierDocument.create({
    data: {
      supplierId: s2Apex.id,
      documentTypeId: iso9001Apex.id,
      documentNumber: 'ISO-9001-2021-KHT',
      fileUrl: 'https://storage.provider.com/certs/kht-iso.pdf',
      issueDate: daysFromNow(-1095),
      expirationDate: daysFromNow(-10),
      status: DocumentStatus.EXPIRED,
      notes: 'Lapsed! Supplier flagged. Pending renewal upload.',
    },
  });

  await prisma.supplierDocument.create({
    data: {
      supplierId: s2Apex.id,
      documentTypeId: qualApex.id,
      documentNumber: 'AWS-D1.1-KHT-88',
      issueDate: daysFromNow(-100),
      expirationDate: daysFromNow(630),
      status: DocumentStatus.VALID,
      notes: 'Qualified for high-temp structural steel welds.',
    },
  });

  await prisma.supplierDocument.create({
    data: {
      supplierId: s1Titan.id,
      documentTypeId: iso14001Titan.id,
      documentNumber: 'ENV-14001-HDM',
      issueDate: daysFromNow(-200),
      expirationDate: daysFromNow(800),
      status: DocumentStatus.VALID,
    },
  });

  await prisma.supplierDocument.create({
    data: {
      supplierId: s1Titan.id,
      documentTypeId: rohsTitan.id,
      documentNumber: 'ROHS-DECL-2026',
      issueDate: daysFromNow(-30),
      expirationDate: daysFromNow(335),
      status: DocumentStatus.VALID,
    },
  });

  console.log('✅ Database successfully seeded with password hashes.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

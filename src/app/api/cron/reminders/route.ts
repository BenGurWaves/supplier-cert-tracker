import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateSupplierCompliance } from '@/lib/compliance';
import { sendComplianceDigestEmail, ComplianceNotificationItem } from '@/lib/email';

export async function GET(request: Request) {
  return handleCronReminders(request);
}

export async function POST(request: Request) {
  return handleCronReminders(request);
}

async function handleCronReminders(request: Request) {
  // Bearer authentication check for CRON_SECRET
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET || 'dev-cron-secret-12345';

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron trigger.' }, { status: 401 });
  }

  const now = new Date();
  const warningThresholdDays = 30;

  // Retrieve all manufacturers
  const manufacturers = await prisma.manufacturer.findMany({
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

  let emailsSent = 0;
  const dispatchResults = [];

  for (const mfg of manufacturers) {
    const expiringDocs: ComplianceNotificationItem[] = [];
    const expiredDocs: ComplianceNotificationItem[] = [];

    const configuredTypes = mfg.documentTypes.map((dt) => ({
      id: dt.id,
      name: dt.name,
      code: dt.code,
      isRequired: dt.isRequired,
    }));

    for (const supplier of mfg.suppliers) {
      const evaluated = evaluateSupplierCompliance(
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
        configuredTypes,
        warningThresholdDays,
        now
      );

      evaluated.evaluatedDocs.forEach((doc) => {
        if (doc.status === 'EXPIRED') {
          expiredDocs.push({
            supplierName: supplier.name,
            documentTypeName: doc.documentTypeName,
            documentTypeCode: doc.documentTypeCode,
            expirationDate: doc.expirationDate ? doc.expirationDate.toISOString().split('T')[0] : 'N/A',
            status: 'EXPIRED',
            daysRemaining: doc.daysRemaining ?? 0,
          });
        } else if (doc.status === 'EXPIRING_SOON') {
          expiringDocs.push({
            supplierName: supplier.name,
            documentTypeName: doc.documentTypeName,
            documentTypeCode: doc.documentTypeCode,
            expirationDate: doc.expirationDate ? doc.expirationDate.toISOString().split('T')[0] : 'N/A',
            status: 'EXPIRING_SOON',
            daysRemaining: doc.daysRemaining ?? 0,
          });
        }
      });
    }

    if (expiringDocs.length > 0 || expiredDocs.length > 0) {
      const result = await sendComplianceDigestEmail({
        toEmail: mfg.email,
        manufacturerName: mfg.name,
        companyName: mfg.companyName,
        expiringDocs,
        expiredDocs,
      });

      emailsSent++;
      dispatchResults.push({
        manufacturer: mfg.companyName,
        email: mfg.email,
        expiringCount: expiringDocs.length,
        expiredCount: expiredDocs.length,
        result,
      });
    }
  }

  return NextResponse.json({
    success: true,
    processedManufacturers: manufacturers.length,
    emailsSent,
    details: dispatchResults,
  });
}

export type DocumentComplianceStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING';

export interface RawDocument {
  id: string;
  documentTypeId: string;
  expirationDate: Date;
  status: string;
}

export interface RawDocumentType {
  id: string;
  name: string;
  code: string;
  isRequired: boolean;
}

export interface RawSupplier {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone?: string | null;
  status: string;
  documents: (RawDocument & { documentType: RawDocumentType })[];
}

export interface EvaluatedDocument {
  docId?: string;
  documentTypeId: string;
  documentTypeName: string;
  documentTypeCode: string;
  isRequired: boolean;
  expirationDate?: Date;
  daysRemaining?: number;
  status: DocumentComplianceStatus;
}

export interface EvaluatedSupplierCompliance {
  supplierId: string;
  supplierName: string;
  contactEmail: string;
  status: string;
  overallComplianceStatus: DocumentComplianceStatus;
  severityRank: number; // 1 (worst) to 4 (best)
  evaluatedDocs: EvaluatedDocument[];
  missingCount: number;
  expiredCount: number;
  expiringSoonCount: number;
  validCount: number;
}

/**
 * Calculates single document status given an expiration date and warning threshold in days.
 */
export function calculateDocumentStatus(
  expirationDate: Date,
  warningThresholdDays = 30,
  referenceDate = new Date()
): DocumentComplianceStatus {
  const diffMs = expirationDate.getTime() - referenceDate.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return 'EXPIRED';
  } else if (daysRemaining <= warningThresholdDays) {
    return 'EXPIRING_SOON';
  } else {
    return 'VALID';
  }
}

/**
 * Evaluates full compliance status for a supplier against all configured required document types.
 */
export function evaluateSupplierCompliance(
  supplier: RawSupplier,
  configuredDocTypes: RawDocumentType[],
  warningThresholdDays = 30,
  referenceDate = new Date()
): EvaluatedSupplierCompliance {
  const evaluatedDocs: EvaluatedDocument[] = [];

  let expiredCount = 0;
  let expiringSoonCount = 0;
  let validCount = 0;
  let missingCount = 0;

  // Map existing documents by DocumentType ID
  const docsByTypeId = new Map<string, (RawDocument & { documentType: RawDocumentType })[]>();
  supplier.documents.forEach((doc) => {
    const list = docsByTypeId.get(doc.documentTypeId) || [];
    list.push(doc);
    docsByTypeId.set(doc.documentTypeId, list);
  });

  // 1. Evaluate configured document types (check for logged docs or missing status)
  configuredDocTypes.forEach((docType) => {
    const loggedDocs = docsByTypeId.get(docType.id) || [];

    if (loggedDocs.length === 0) {
      if (docType.isRequired) {
        missingCount++;
        evaluatedDocs.push({
          documentTypeId: docType.id,
          documentTypeName: docType.name,
          documentTypeCode: docType.code,
          isRequired: true,
          status: 'MISSING',
        });
      }
    } else {
      // Pick doc with latest expiration if multiple logged
      const latestDoc = loggedDocs.reduce((prev, curr) =>
        new Date(curr.expirationDate).getTime() > new Date(prev.expirationDate).getTime() ? curr : prev
      );

      const expDate = new Date(latestDoc.expirationDate);
      const diffMs = expDate.getTime() - referenceDate.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const status = calculateDocumentStatus(expDate, warningThresholdDays, referenceDate);

      if (status === 'EXPIRED') expiredCount++;
      else if (status === 'EXPIRING_SOON') expiringSoonCount++;
      else if (status === 'VALID') validCount++;

      evaluatedDocs.push({
        docId: latestDoc.id,
        documentTypeId: docType.id,
        documentTypeName: docType.name,
        documentTypeCode: docType.code,
        isRequired: docType.isRequired,
        expirationDate: expDate,
        daysRemaining,
        status,
      });
    }
  });

  // 2. Aggregate worst-case compliance status
  let overallComplianceStatus: DocumentComplianceStatus = 'VALID';
  let severityRank = 4; // 1 = EXPIRED, 2 = MISSING, 3 = EXPIRING_SOON, 4 = VALID

  if (expiredCount > 0) {
    overallComplianceStatus = 'EXPIRED';
    severityRank = 1;
  } else if (missingCount > 0) {
    overallComplianceStatus = 'MISSING';
    severityRank = 2;
  } else if (expiringSoonCount > 0) {
    overallComplianceStatus = 'EXPIRING_SOON';
    severityRank = 3;
  } else {
    overallComplianceStatus = 'VALID';
    severityRank = 4;
  }

  return {
    supplierId: supplier.id,
    supplierName: supplier.name,
    contactEmail: supplier.contactEmail,
    status: supplier.status,
    overallComplianceStatus,
    severityRank,
    evaluatedDocs,
    missingCount,
    expiredCount,
    expiringSoonCount,
    validCount,
  };
}

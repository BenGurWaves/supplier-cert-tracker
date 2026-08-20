'use client';

import { EvaluatedSupplierCompliance, DocumentComplianceStatus } from '@/lib/compliance';
import { useState } from 'react';
import Link from 'next/link';

interface DashboardClientViewProps {
  initialSuppliers: EvaluatedSupplierCompliance[];
  warningThresholdDays: number;
  companyName: string;
}

export default function DashboardClientView({
  initialSuppliers,
  warningThresholdDays,
  companyName,
}: DashboardClientViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);

  // Filter suppliers based on tab selection
  const filteredSuppliers = initialSuppliers.filter((s) => {
    if (filterStatus === 'ALL') return true;
    return s.overallComplianceStatus === filterStatus;
  });

  // Calculate high-level summary counters
  const totalCount = initialSuppliers.length;
  const expiredCount = initialSuppliers.filter((s) => s.overallComplianceStatus === 'EXPIRED').length;
  const missingCount = initialSuppliers.filter((s) => s.overallComplianceStatus === 'MISSING').length;
  const expiringSoonCount = initialSuppliers.filter((s) => s.overallComplianceStatus === 'EXPIRING_SOON').length;
  const validCount = initialSuppliers.filter((s) => s.overallComplianceStatus === 'VALID').length;

  const toggleExpand = (id: string) => {
    setExpandedSupplierId(expandedSupplierId === id ? null : id);
  };

  const getBadgeStyle = (status: DocumentComplianceStatus) => {
    switch (status) {
      case 'EXPIRED':
        return { bg: '#ffebe9', text: '#cf222e', border: '#ff8182', label: '🚨 EXPIRED' };
      case 'MISSING':
        return { bg: '#fff8c5', text: '#9a6700', border: '#d4a72c', label: '⚠️ MISSING CERT' };
      case 'EXPIRING_SOON':
        return { bg: '#fff8c5', text: '#bf8700', border: '#eac54f', label: '⏳ EXPIRING SOON' };
      case 'VALID':
        return { bg: '#dafbe1', text: '#1a7f37', border: '#4ac26b', label: '✅ VALID' };
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>Supplier Compliance Dashboard — {companyName}</h2>
          <p style={{ margin: 0, color: '#666' }}>
            Overview of supplier certification health & real-time risk status (Warning threshold: {warningThresholdDays} days).
          </p>
        </div>
        <a href="/api/export/compliance-csv" download style={{ padding: '8px 16px', backgroundColor: '#1a7f37', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px' }}>
          📥 Export Audit Report (CSV)
        </a>
      </header>

      {/* Summary Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '25px' }}>
        <div style={{ padding: '15px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#f8f9fa' }}>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Suppliers</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '5px' }}>{totalCount}</div>
        </div>
        <div
          onClick={() => setFilterStatus('EXPIRED')}
          style={{ padding: '15px', borderRadius: '6px', border: '1px solid #ff8182', backgroundColor: '#ffebe9', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '12px', color: '#cf222e', fontWeight: 'bold' }}>Expired</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#cf222e', marginTop: '5px' }}>{expiredCount}</div>
        </div>
        <div
          onClick={() => setFilterStatus('MISSING')}
          style={{ padding: '15px', borderRadius: '6px', border: '1px solid #d4a72c', backgroundColor: '#fff8c5', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '12px', color: '#9a6700', fontWeight: 'bold' }}>Missing Required Cert</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9a6700', marginTop: '5px' }}>{missingCount}</div>
        </div>
        <div
          onClick={() => setFilterStatus('EXPIRING_SOON')}
          style={{ padding: '15px', borderRadius: '6px', border: '1px solid #eac54f', backgroundColor: '#fffbe6', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '12px', color: '#bf8700', fontWeight: 'bold' }}>Expiring Soon (&le;{warningThresholdDays}d)</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#bf8700', marginTop: '5px' }}>{expiringSoonCount}</div>
        </div>
        <div
          onClick={() => setFilterStatus('VALID')}
          style={{ padding: '15px', borderRadius: '6px', border: '1px solid #4ac26b', backgroundColor: '#dafbe1', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '12px', color: '#1a7f37', fontWeight: 'bold' }}>Fully Compliant</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a7f37', marginTop: '5px' }}>{validCount}</div>
        </div>
      </div>

      {/* Filter / Sort Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '10px 15px', backgroundColor: '#f0f0f0', borderRadius: '6px' }}>
        <div>
          <strong style={{ marginRight: '15px' }}>Filter Status:</strong>
          {(['ALL', 'EXPIRED', 'MISSING', 'EXPIRING_SOON', 'VALID'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                marginRight: '8px',
                padding: '6px 12px',
                borderRadius: '4px',
                border: filterStatus === st ? '2px solid #0066cc' : '1px solid #ccc',
                backgroundColor: filterStatus === st ? '#e6f0fa' : '#fff',
                fontWeight: filterStatus === st ? 'bold' : 'normal',
                cursor: 'pointer',
              }}
            >
              {st === 'ALL' ? 'Show All' : st}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '13px', color: '#555' }}>
          Sorted by: <strong>Risk Severity (Worst-Case First)</strong>
        </div>
      </div>

      {/* Suppliers Compliance Table */}
      {filteredSuppliers.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '6px', color: '#666' }}>
          No suppliers match filter: <strong>{filterStatus}</strong>.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }} border={1} cellPadding={10}>
          <thead>
            <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left' }}>
              <th style={{ width: '40px' }}></th>
              <th>Supplier Name</th>
              <th>Overall Compliance Status</th>
              <th>Breakdown (V / ES / EX / M)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((s) => {
              const badge = getBadgeStyle(s.overallComplianceStatus);
              const isExpanded = expandedSupplierId === s.supplierId;

              return (
                <>
                  <tr key={s.supplierId} style={{ backgroundColor: isExpanded ? '#fafafa' : '#fff' }}>
                    <td style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleExpand(s.supplierId)}>
                      {isExpanded ? '▼' : '►'}
                    </td>
                    <td>
                      <strong>{s.supplierName}</strong><br />
                      <small style={{ color: '#666' }}>{s.contactEmail}</small>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          fontWeight: 'bold',
                          fontSize: '13px',
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#1a7f37' }}>{s.validCount} Valid</span> |{' '}
                      <span style={{ color: '#bf8700' }}>{s.expiringSoonCount} Expiring</span> |{' '}
                      <span style={{ color: '#cf222e' }}>{s.expiredCount} Expired</span> |{' '}
                      <span style={{ color: '#9a6700' }}>{s.missingCount} Missing</span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleExpand(s.supplierId)}
                        style={{ marginRight: '10px', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        {isExpanded ? 'Hide Details' : '🔍 Inspect Risk'}
                      </button>
                      <Link href={`/suppliers/${s.supplierId}/documents`}>
                        <button style={{ padding: '4px 8px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #0066cc', backgroundColor: '#e6f0fa', color: '#0066cc' }}>
                          Manage Documents ↗
                        </button>
                      </Link>
                    </td>
                  </tr>

                  {/* Expanded Drill-Down Inspector Row */}
                  {isExpanded && (
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <td colSpan={5} style={{ padding: '15px 25px' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>Required Certification Inspection — {s.supplierName}</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }} border={1} cellPadding={8}>
                          <thead>
                            <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left', fontSize: '12px' }}>
                              <th>Code</th>
                              <th>Required Certification Name</th>
                              <th>Mandatory?</th>
                              <th>Status</th>
                              <th>Expiration Date</th>
                              <th>Days Remaining</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.evaluatedDocs.map((doc) => {
                              const docBadge = getBadgeStyle(doc.status);
                              return (
                                <tr key={doc.documentTypeId}>
                                  <td><code>{doc.documentTypeCode}</code></td>
                                  <td>{doc.documentTypeName}</td>
                                  <td>{doc.isRequired ? '✅ Mandatory' : '⚪ Optional'}</td>
                                  <td>
                                    <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: docBadge.bg, color: docBadge.text, fontSize: '12px', border: `1px solid ${docBadge.border}` }}>
                                      {docBadge.label}
                                    </span>
                                  </td>
                                  <td>{doc.expirationDate ? doc.expirationDate.toISOString().split('T')[0] : '— (No document uploaded)'}</td>
                                  <td>
                                    {doc.daysRemaining !== undefined ? (
                                      doc.daysRemaining < 0 ? (
                                        <strong style={{ color: '#cf222e' }}>Expired {Math.abs(doc.daysRemaining)} days ago</strong>
                                      ) : (
                                        <span>{doc.daysRemaining} days</span>
                                      )
                                    ) : (
                                      '—'
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

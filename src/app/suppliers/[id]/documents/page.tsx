import { getCurrentManufacturer } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSupplierDocument, deleteSupplierDocument } from '@/app/actions/documentActions';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SupplierDocumentsPage({ params }: PageProps) {
  const manufacturer = await getCurrentManufacturer();

  if (!manufacturer) {
    redirect('/login');
  }

  const { id: supplierId } = await params;

  // Retrieve supplier with tenant isolation
  const supplier = await prisma.supplier.findFirst({
    where: { id: supplierId, manufacturerId: manufacturer.id },
  });

  if (!supplier) {
    return <div>Supplier not found or unauthorized. <Link href="/suppliers">Back to suppliers</Link></div>;
  }

  // Retrieve available document types for this manufacturer
  const availableDocumentTypes = await prisma.documentType.findMany({
    where: { manufacturerId: manufacturer.id },
    orderBy: { name: 'asc' },
  });

  // Retrieve existing logged documents for this supplier
  const documents = await prisma.supplierDocument.findMany({
    where: { supplierId: supplier.id },
    include: {
      documentType: true,
    },
    orderBy: { expirationDate: 'asc' },
  });

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <p><Link href="/suppliers">← Back to Suppliers List</Link></p>
      <h2>Logged Documents & Compliance — {supplier.name}</h2>
      <p style={{ color: 'gray' }}>Contact Email: {supplier.contactEmail} | Status: <strong>{supplier.status}</strong></p>

      {/* Form to upload/log new document */}
      <fieldset style={{ marginBottom: '30px', padding: '20px', borderRadius: '6px', border: '1px solid #ccc' }}>
        <legend><strong>+ Log / Upload New Document</strong></legend>
        <form action={createSupplierDocument} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
          <input type="hidden" name="supplierId" value={supplier.id} />
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Document Type *</label>
            <select name="documentTypeId" required style={{ width: '100%', padding: '6px' }}>
              <option value="">-- Select Cert/Doc Type --</option>
              {availableDocumentTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  [{dt.code}] {dt.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Document / Cert #</label>
            <input name="documentNumber" type="text" placeholder="e.g. POL-99812-X" style={{ width: '100%', padding: '6px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Issue Date *</label>
            <input name="issueDate" type="date" required style={{ width: '100%', padding: '6px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Expiration Date *</label>
            <input name="expirationDate" type="date" required style={{ width: '100%', padding: '6px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>File URL (Optional)</label>
            <input name="fileUrl" type="url" placeholder="https://..." style={{ width: '100%', padding: '6px' }} />
          </div>

          <div style={{ gridColumn: 'span 4' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Notes / Remarks</label>
            <input name="notes" type="text" placeholder="Audited by external body..." style={{ width: '100%', padding: '6px' }} />
          </div>

          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '35px' }}>
            Log Document
          </button>
        </form>
      </fieldset>

      {/* Logged Documents Table */}
      <h3>Logged Documents ({documents.length})</h3>
      {documents.length === 0 ? (
        <p>No documents logged for this supplier yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }} border={1} cellPadding={10}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
              <th>Type</th>
              <th>Cert / Doc #</th>
              <th>Issue Date</th>
              <th>Expiration Date</th>
              <th>Status</th>
              <th>Notes / File</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const statusColor = 
                doc.status === 'VALID' ? '#e6ffed' : 
                doc.status === 'EXPIRING_SOON' ? '#fffbe6' : '#ffebe9';
              
              return (
                <tr key={doc.id}>
                  <td><strong>[{doc.documentType.code}]</strong> {doc.documentType.name}</td>
                  <td>{doc.documentNumber || 'N/A'}</td>
                  <td>{doc.issueDate.toISOString().split('T')[0]}</td>
                  <td><strong>{doc.expirationDate.toISOString().split('T')[0]}</strong></td>
                  <td>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: statusColor, border: '1px solid #ccc', fontWeight: 'bold' }}>
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    {doc.notes && <div><small>{doc.notes}</small></div>}
                    {doc.fileUrl && <div><a href={doc.fileUrl} target="_blank" rel="noreferrer"><small>View Attached File ↗</small></a></div>}
                  </td>
                  <td>
                    <form action={async () => {
                      'use server';
                      await deleteSupplierDocument(doc.id, supplier.id);
                    }}>
                      <button type="submit" style={{ color: 'red', cursor: 'pointer', background: 'none', border: '1px solid red', padding: '4px 8px', borderRadius: '4px' }}>
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

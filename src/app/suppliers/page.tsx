import { getCurrentManufacturer } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSupplier, deleteSupplier } from '@/app/actions/supplierActions';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SuppliersPage() {
  const manufacturer = await getCurrentManufacturer();

  if (!manufacturer) {
    redirect('/login');
  }

  const suppliers = await prisma.supplier.findMany({
    where: { manufacturerId: manufacturer.id },
    include: {
      documents: {
        include: {
          documentType: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h2>Supplier Management</h2>
      <p style={{ color: 'gray' }}>Manage suppliers and monitor compliance status for {manufacturer.companyName}.</p>

      {/* Create New Supplier Form */}
      <fieldset style={{ marginBottom: '30px', padding: '20px', borderRadius: '6px', border: '1px solid #ccc' }}>
        <legend><strong>+ Add New Supplier</strong></legend>
        <form action={createSupplier} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>Supplier Name *</label>
            <input name="name" type="text" required placeholder="e.g. Apex Metals Corp" style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>Contact Email *</label>
            <input name="contactEmail" type="email" required placeholder="orders@supplier.com" style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>Contact Phone</label>
            <input name="contactPhone" type="text" placeholder="+1-555-0192" style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>Tax / EIN ID</label>
            <input name="taxId" type="text" placeholder="US-12345678" style={{ width: '100%', padding: '6px' }} />
          </div>
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Add Supplier
          </button>
        </form>
      </fieldset>

      {/* Supplier List */}
      <h3>Current Suppliers ({suppliers.length})</h3>
      {suppliers.length === 0 ? (
        <p>No suppliers added yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }} border={1} cellPadding={10}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
              <th>Supplier Name</th>
              <th>Contact</th>
              <th>Tax ID</th>
              <th>Status</th>
              <th>Logged Certs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.name}</strong>
                </td>
                <td>
                  {s.contactEmail}<br/>
                  <small>{s.contactPhone || 'No phone'}</small>
                </td>
                <td>{s.taxId || 'N/A'}</td>
                <td>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: s.status === 'ACTIVE' ? '#e6ffed' : '#fffbe6', border: '1px solid #ccc' }}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <Link href={`/suppliers/${s.id}/documents`}>
                    📄 Manage Documents ({s.documents.length})
                  </Link>
                </td>
                <td>
                  <form action={async () => {
                    'use server';
                    await deleteSupplier(s.id);
                  }}>
                    <button type="submit" style={{ color: 'red', cursor: 'pointer', background: 'none', border: '1px solid red', padding: '4px 8px', borderRadius: '4px' }}>
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

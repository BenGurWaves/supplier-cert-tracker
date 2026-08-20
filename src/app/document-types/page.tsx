import { getCurrentManufacturer } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createDocumentType, deleteDocumentType } from '@/app/actions/documentTypeActions';
import { redirect } from 'next/navigation';

export default async function DocumentTypesPage() {
  const manufacturer = await getCurrentManufacturer();

  if (!manufacturer) {
    redirect('/login');
  }

  const documentTypes = await prisma.documentType.findMany({
    where: { manufacturerId: manufacturer.id },
    orderBy: { name: 'asc' },
  });

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h2>Configurable Certification & Document Types</h2>
      <p style={{ color: 'gray' }}>
        Define mandatory or optional document types required from your suppliers (e.g. ISO certificates, insurance policies, quality compliance).
      </p>

      {/* Form to add Document Type */}
      <fieldset style={{ marginBottom: '30px', padding: '20px', borderRadius: '6px', border: '1px solid #ccc' }}>
        <legend><strong>+ Define New Document / Cert Type</strong></legend>
        <form action={createDocumentType} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 100px 100px auto', gap: '10px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>Document Name *</label>
            <input name="name" type="text" required placeholder="e.g. AS9100 Aerospace Quality" style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>Short Code *</label>
            <input name="code" type="text" required placeholder="e.g. AS9100" style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>Description</label>
            <input name="description" type="text" placeholder="e.g. Mandatory standard for aerospace suppliers" style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>Validity (Days)</label>
            <input name="validityPeriodDays" type="number" placeholder="365" style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>Mandatory?</label>
            <input name="isRequired" type="checkbox" defaultChecked style={{ marginTop: '8px' }} />
          </div>
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#008055', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save Type
          </button>
        </form>
      </fieldset>

      {/* List existing Document Types */}
      <h3>Configured Types ({documentTypes.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }} border={1} cellPadding={10}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
            <th>Code</th>
            <th>Name</th>
            <th>Description</th>
            <th>Required?</th>
            <th>Default Validity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documentTypes.map((dt) => (
            <tr key={dt.id}>
              <td><code>{dt.code}</code></td>
              <td><strong>{dt.name}</strong></td>
              <td>{dt.description || 'N/A'}</td>
              <td>{dt.isRequired ? '✅ Mandatory' : '⚪ Optional'}</td>
              <td>{dt.validityPeriodDays ? `${dt.validityPeriodDays} days` : 'N/A'}</td>
              <td>
                <form action={async () => {
                  'use server';
                  await deleteDocumentType(dt.id);
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
    </div>
  );
}

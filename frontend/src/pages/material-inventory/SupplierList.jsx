import React, { useState, useEffect } from 'react';

function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data supplier dari API
    const fetchSuppliers = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, name: 'PT. Baja Perkasa', contact: '021-123456', email: 'info@bajaperkasa.com' },
              { id: 2, name: 'CV. Kayu Indah', contact: '021-654321', email: 'sales@kayuindah.co.id' },
              { id: 3, name: 'Global Plastik', contact: '021-987654', email: 'admin@globalplastik.net' },
            ])
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSuppliers(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  if (loading) {
    return <div>Memuat daftar supplier...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="supplier-list-container">
      <h1>Daftar Supplier</h1>
      {suppliers.length === 0 ? (
        <p>Tidak ada supplier yang tersedia.</p>
      ) : (
        <table className="supplier-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Supplier</th>
              <th>Kontak</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(supplier => (
              <tr key={supplier.id}>
                <td>{supplier.id}</td>
                <td>{supplier.name}</td>
                <td>{supplier.contact}</td>
                <td>{supplier.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SupplierList;
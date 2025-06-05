import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function SupplierDetail() {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil detail supplier dari API berdasarkan ID
    const fetchSupplierDetail = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          const suppliers = [
            { id: 1, name: 'PT. Baja Perkasa', contact: '021-123456', email: 'info@bajaperkasa.com', address: 'Jl. Baja No. 1, Jakarta' },
            { id: 2, name: 'CV. Kayu Indah', contact: '021-654321', email: 'sales@kayuindah.co.id', address: 'Jl. Kayu No. 2, Bandung' },
            { id: 3, name: 'Global Plastik', contact: '021-987654', email: 'admin@globalplastik.net', address: 'Jl. Plastik No. 3, Surabaya' },
          ];
          const foundSupplier = suppliers.find(s => s.id === parseInt(id));
          resolve({
            ok: !!foundSupplier,
            json: () => Promise.resolve(foundSupplier)
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSupplier(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierDetail();
  }, [id]);

  if (loading) {
    return <div>Memuat detail supplier...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!supplier) {
    return <div>Supplier tidak ditemukan.</div>;
  }

  return (
    <div className="supplier-detail-container">
      <h1>Detail Supplier</h1>
      <p><strong>ID:</strong> {supplier.id}</p>
      <p><strong>Nama Supplier:</strong> {supplier.name}</p>
      <p><strong>Kontak:</strong> {supplier.contact}</p>
      <p><strong>Email:</strong> {supplier.email}</p>
      <p><strong>Alamat:</strong> {supplier.address}</p>
      {/* Tambahkan tombol kembali atau navigasi lainnya jika diperlukan */}
    </div>
  );
}

export default SupplierDetail;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function MaterialDetail() {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil detail material dari API berdasarkan ID
    const fetchMaterialDetail = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          const materials = [
            { id: 1, name: 'Besi', quantity: 100, unit: 'kg', description: 'Besi baja kualitas tinggi.' },
            { id: 2, name: 'Kayu', quantity: 50, unit: 'm3', description: 'Kayu jati solid.' },
            { id: 3, name: 'Plastik', quantity: 200, unit: 'unit', description: 'Plastik daur ulang.' },
          ];
          const foundMaterial = materials.find(m => m.id === parseInt(id));
          resolve({
            ok: !!foundMaterial,
            json: () => Promise.resolve(foundMaterial)
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMaterial(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialDetail();
  }, [id]);

  if (loading) {
    return <div>Memuat detail material...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!material) {
    return <div>Material tidak ditemukan.</div>;
  }

  return (
    <div className="material-detail-container">
      <h1>Detail Material</h1>
      <p><strong>ID:</strong> {material.id}</p>
      <p><strong>Nama Material:</strong> {material.name}</p>
      <p><strong>Jumlah:</strong> {material.quantity} {material.unit}</p>
      <p><strong>Deskripsi:</strong> {material.description}</p>
      {/* Tambahkan tombol kembali atau navigasi lainnya jika diperlukan */}
    </div>
  );
}

export default MaterialDetail;
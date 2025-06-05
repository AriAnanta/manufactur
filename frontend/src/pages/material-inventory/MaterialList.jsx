import React, { useState, useEffect } from 'react';

function MaterialList() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data material dari API
    const fetchMaterials = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, name: 'Besi', quantity: 100, unit: 'kg' },
              { id: 2, name: 'Kayu', quantity: 50, unit: 'm3' },
              { id: 3, name: 'Plastik', quantity: 200, unit: 'unit' },
            ])
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMaterials(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  if (loading) {
    return <div>Memuat daftar material...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="material-list-container">
      <h1>Daftar Material</h1>
      {materials.length === 0 ? (
        <p>Tidak ada material yang tersedia.</p>
      ) : (
        <table className="material-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Material</th>
              <th>Jumlah</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(material => (
              <tr key={material.id}>
                <td>{material.id}</td>
                <td>{material.name}</td>
                <td>{material.quantity}</td>
                <td>{material.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MaterialList;
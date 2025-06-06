import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function MaterialDetail() {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil detail material dari API berdasarkan ID
    const fetchMaterialDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost:5004/api/materials/${id}`
        );

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
      <p>
        <strong>ID:</strong> {material.id}
      </p>
      <p>
        <strong>Nama Material:</strong> {material.name}
      </p>
      <p>
        <strong>Jumlah Stok:</strong> {material.stockQuantity} {material.unit}
      </p>
      <p>
        <strong>Deskripsi:</strong>{" "}
        {material.description || "Tidak ada deskripsi."}
      </p>
      <p>
        <strong>Kategori:</strong> {material.category}
      </p>
      <p>
        <strong>Tipe:</strong> {material.type}
      </p>
      <p>
        <strong>Tingkat Reorder:</strong> {material.reorderLevel}
      </p>
      <p>
        <strong>Harga:</strong> {material.price}
      </p>
      <p>
        <strong>Waktu Tunggu (hari):</strong> {material.leadTime}
      </p>
      <p>
        <strong>Lokasi:</strong> {material.location}
      </p>
      <p>
        <strong>Supplier ID:</strong> {material.supplierId}
      </p>
      <p>
        <strong>Status:</strong> {material.status}
      </p>
      <p>
        <strong>Catatan:</strong> {material.notes || "-"}
      </p>
    </div>
  );
}

export default MaterialDetail;

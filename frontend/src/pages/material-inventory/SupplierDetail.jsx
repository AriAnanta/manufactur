import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function SupplierDetail() {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil detail supplier dari API berdasarkan ID
    const fetchSupplierDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost:5004/api/suppliers/${id}`
        );

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
      <p>
        <strong>ID:</strong> {supplier.id}
      </p>
      <p>
        <strong>Supplier ID:</strong> {supplier.supplierId}
      </p>
      <p>
        <strong>Nama Supplier:</strong> {supplier.name}
      </p>
      <p>
        <strong>Kontak Person:</strong> {supplier.contactPerson}
      </p>
      <p>
        <strong>Email:</strong> {supplier.email}
      </p>
      <p>
        <strong>Telepon:</strong> {supplier.phone}
      </p>
      <p>
        <strong>Alamat:</strong> {supplier.address}
      </p>
      <p>
        <strong>Kota:</strong> {supplier.city}
      </p>
      <p>
        <strong>Negara:</strong> {supplier.country}
      </p>
      <p>
        <strong>Kode Pos:</strong> {supplier.postalCode}
      </p>
      <p>
        <strong>ID Pajak:</strong> {supplier.taxId || "-"}
      </p>
      <p>
        <strong>Syarat Pembayaran:</strong> {supplier.paymentTerms || "-"}
      </p>
      <p>
        <strong>Waktu Tunggu (hari):</strong> {supplier.leadTime || "-"}
      </p>
      <p>
        <strong>Rating:</strong> {supplier.rating || "-"}
      </p>
      <p>
        <strong>Status:</strong> {supplier.status}
      </p>
      <p>
        <strong>Catatan:</strong> {supplier.notes || "-"}
      </p>
    </div>
  );
}

export default SupplierDetail;

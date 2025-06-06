import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateSupplier() {
  const [formData, setFormData] = useState({
    supplierId: "",
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Indonesia",
    contactPerson: "",
    phone: "",
    email: "",
    website: "",
    paymentTerms: "",
    leadTime: 7,
    rating: 0.0,
    status: "Active",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5004/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      alert("Supplier berhasil ditambahkan!");
      navigate("/suppliers"); // Kembali ke daftar supplier setelah berhasil
    } catch (e) {
      setError(e);
      alert(`Gagal menambahkan supplier: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="create-supplier-container"
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h1>Tambah Supplier Baru</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}
      >
        <div>
          <label>Supplier ID:</label>
          <input
            type="text"
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label>Nama Supplier:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ gridColumn: "1 / 3" }}>
          <label>Alamat:</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            style={{
              width: "calc(100% - 16px)",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          ></textarea>
        </div>
        <div>
          <label>Kota:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label>Provinsi/Negara Bagian:</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label>Kode Pos:</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label>Negara:</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label>Kontak Person:</label>
          <input
            type="text"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label>Telepon:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label>Website:</label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label>Syarat Pembayaran:</label>
          <input
            type="text"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label>Lead Time (hari):</label>
          <input
            type="number"
            name="leadTime"
            value={formData.leadTime}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label>Rating (0-5):</label>
          <input
            type="number"
            name="rating"
            step="0.01"
            min="0"
            max="5"
            value={formData.rating}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label>Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Hold">On Hold</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / 3" }}>
          <label>Catatan:</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            style={{
              width: "calc(100% - 16px)",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          ></textarea>
        </div>

        <div style={{ gridColumn: "1 / 3", textAlign: "right" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 15px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            {loading ? "Menambahkan..." : "Tambah Supplier"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/suppliers")}
            style={{
              padding: "10px 15px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateSupplier;

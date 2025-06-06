import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateMaterial() {
  const [formData, setFormData] = useState({
    materialId: "",
    name: "",
    description: "",
    category: "",
    type: "",
    unit: "",
    stockQuantity: 0,
    reorderLevel: 10,
    price: 0,
    leadTime: 0,
    location: "",
    supplierId: "",
    status: "active",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Define ENUM values for dropdowns
  const categories = [
    "Raw Material",
    "Component",
    "Work-in-Progress (WIP)",
    "Finished Goods",
    "Packaging Material",
    "Consumable",
    "Spare Part",
    "Tool",
  ];

  const units = [
    "Kilogram (kg)",
    "Gram (g)",
    "Liter (L)",
    "Milliliter (mL)",
    "Pieces (pcs)",
    "Meter (m)",
    "Square Meter (m²)",
    "Cubic Meter (m³)",
    "Ton",
  ];

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
      const response = await fetch("http://localhost:5004/api/materials", {
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
      alert("Material berhasil ditambahkan!");
      navigate("/materials"); // Kembali ke daftar material setelah berhasil
    } catch (e) {
      setError(e);
      alert(`Gagal menambahkan material: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="create-material-container"
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h1>Tambah Material Baru</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}
      >
        <div>
          <label>Material ID:</label>
          <input
            type="text"
            name="materialId"
            value={formData.materialId}
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
          <label>Nama Material:</label>
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
        <div>
          <label>Kategori:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="">Pilih Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Tipe:</label>
          <input
            type="text"
            name="type"
            value={formData.type}
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
        <div>
          <label>Unit:</label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            required
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="">Pilih Unit</option>
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Jumlah Stok:</label>
          <input
            type="number"
            name="stockQuantity"
            value={formData.stockQuantity}
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
          <label>Reorder Level:</label>
          <input
            type="number"
            name="reorderLevel"
            value={formData.reorderLevel}
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
          <label>Harga:</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label>Waktu Tunggu (hari):</label>
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
          <label>Lokasi:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
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
            <option value="active">Active</option>
            <option value="discontinued">Discontinued</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / span 2" }}>
          <label>Deskripsi:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{
              width: "95%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              minHeight: "60px",
            }}
          ></textarea>
        </div>
        <div style={{ gridColumn: "1 / span 2" }}>
          <label>Catatan:</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            style={{
              width: "95%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              minHeight: "60px",
            }}
          ></textarea>
        </div>
        <div style={{ gridColumn: "1 / span 2", textAlign: "right" }}>
          <button
            type="button"
            onClick={() => navigate("/materials")}
            style={{
              padding: "10px 15px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Batal
          </button>
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
            }}
          >
            {loading ? "Menyimpan..." : "Simpan Material"}
          </button>
        </div>
      </form>
      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          Error: {error.message}
        </p>
      )}
    </div>
  );
}

export default CreateMaterial;

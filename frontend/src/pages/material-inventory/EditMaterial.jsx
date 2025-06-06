import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditMaterial() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await fetch(
          `http://localhost:5004/api/materials/${id}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFormData(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [id]);

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
      const response = await fetch(
        `http://localhost:5004/api/materials/${id}`,
        {
          method: "PUT", // Menggunakan PUT untuk update
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      alert("Material berhasil diperbarui!");
      navigate("/materials"); // Kembali ke daftar material setelah berhasil
    } catch (e) {
      setError(e);
      alert(`Gagal memperbarui material: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Memuat data material...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div
      className="edit-material-container"
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h1>Edit Material</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}
      >
        <div>
          <label>Material ID:</label>
          <input
            type="text"
            name="materialId"
            value={formData.materialId || ""}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
            readOnly // Material ID biasanya tidak bisa diubah
          />
        </div>
        <div>
          <label>Nama Material:</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
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
            value={formData.category || ""}
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
            value={formData.type || ""}
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
            value={formData.unit || ""}
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
            value={formData.stockQuantity || 0}
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
          <label>Level Reorder:</label>
          <input
            type="number"
            name="reorderLevel"
            value={formData.reorderLevel || 0}
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
            value={formData.price || 0}
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
            value={formData.leadTime || 0}
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
            value={formData.location || ""}
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
            value={formData.supplierId || ""}
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
            value={formData.status || ""}
            onChange={handleChange}
            style={{
              width: "90%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
            <option value="obsolete">Usang</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / 3" }}>
          <label>Deskripsi:</label>
          <textarea
            name="description"
            value={formData.description || ""}
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
        <div style={{ gridColumn: "1 / 3" }}>
          <label>Catatan:</label>
          <textarea
            name="notes"
            value={formData.notes || ""}
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
            {loading ? "Memperbarui..." : "Perbarui Material"}
          </button>
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
            }}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditMaterial;

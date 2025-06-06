import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MaterialList() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchMaterials = async () => {
    try {
      const response = await fetch("http://localhost:5004/api/materials");

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

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleEdit = (id) => {
    navigate(`/materials/${id}/edit`);
  };

  const handleViewDetail = (id) => {
    navigate(`/materials/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus material ini?")) {
      try {
        const response = await fetch(
          `http://localhost:5004/api/materials/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        alert("Material berhasil dihapus!");
        fetchMaterials();
      } catch (e) {
        setError(e);
        alert(`Gagal menghapus material: ${e.message}`);
      }
    }
  };

  const handleCreateNew = () => {
    navigate("/materials/new");
  };

  if (loading) {
    return <div>Memuat daftar material...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="material-list-container">
      <h1>Daftar Material</h1>
      <div className="action-buttons" style={{ marginBottom: "20px" }}>
        <button
          onClick={handleCreateNew}
          style={{
            padding: "10px 15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Tambah Material
        </button>
      </div>
      {materials.length === 0 ? (
        <p>Tidak ada material yang tersedia.</p>
      ) : (
        <table
          className="material-table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                ID
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                Nama Material
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                Jumlah
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                Unit
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <tr key={material.id}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {material.id}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {material.name}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {material.stockQuantity}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {material.unit}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <button
                    onClick={() => handleViewDetail(material.id)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginRight: "5px",
                    }}
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => handleEdit(material.id)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginRight: "5px",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MaterialList;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("http://localhost:5004/api/suppliers");

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

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleViewDetail = (id) => {
    navigate(`/suppliers/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/suppliers/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus supplier ini?")) {
      try {
        const response = await fetch(
          `http://localhost:5004/api/suppliers/${id}`,
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

        alert("Supplier berhasil dihapus!");
        fetchSuppliers();
      } catch (e) {
        setError(e);
        alert(`Gagal menghapus supplier: ${e.message}`);
      }
    }
  };

  const handleCreateNew = () => {
    navigate("/suppliers/new");
  };

  if (loading) {
    return <div>Memuat daftar supplier...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="supplier-list-container">
      <h1>Daftar Supplier</h1>
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
          Tambah Supplier Baru
        </button>
      </div>
      {suppliers.length === 0 ? (
        <p>Tidak ada supplier yang tersedia.</p>
      ) : (
        <table
          className="supplier-table"
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
                Nama Supplier
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                Kontak
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                Email
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
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {supplier.id}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {supplier.name}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {supplier.contactPerson}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {supplier.email}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <button
                    onClick={() => handleViewDetail(supplier.id)}
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
                    onClick={() => handleEdit(supplier.id)}
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
                    onClick={() => handleDelete(supplier.id)}
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

export default SupplierList;

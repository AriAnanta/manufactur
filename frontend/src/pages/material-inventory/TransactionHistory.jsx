import React, { useState, useEffect } from "react";

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data riwayat transaksi dari API
    const fetchTransactions = async () => {
      try {
        const response = await fetch("http://localhost:5004/api/transactions");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTransactions(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return <div>Memuat riwayat transaksi...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="transaction-history-container">
      <h1>Riwayat Transaksi Material</h1>
      {transactions.length === 0 ? (
        <p>Tidak ada riwayat transaksi yang tersedia.</p>
      ) : (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Material</th>
              <th>Tipe</th>
              <th>Jumlah</th>
              <th>Tanggal</th>
              <th>Referensi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>
                  {transaction.material ? transaction.material.name : "N/A"}
                </td>
                <td>{transaction.type}</td>
                <td>
                  {transaction.quantity} {transaction.unit}
                </td>
                <td>
                  {new Date(transaction.transactionDate).toLocaleDateString()}
                </td>
                <td>{transaction.referenceNumber || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TransactionHistory;

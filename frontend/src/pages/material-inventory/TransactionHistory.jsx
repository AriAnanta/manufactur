import React, { useState, useEffect } from 'react';

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data riwayat transaksi dari API
    const fetchTransactions = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, material: 'Besi', type: 'Masuk', quantity: 10, date: '2023-01-05' },
              { id: 2, material: 'Kayu', type: 'Keluar', quantity: 5, date: '2023-01-10' },
              { id: 3, material: 'Plastik', type: 'Masuk', quantity: 20, date: '2023-01-15' },
            ])
          });
        }, 1000));

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
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.material}</td>
                <td>{transaction.type}</td>
                <td>{transaction.quantity}</td>
                <td>{transaction.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TransactionHistory;
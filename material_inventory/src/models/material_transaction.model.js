/**
 * Model MaterialTransaction
 * 
 * Merepresentasikan transaksi material (masuk/keluar)
 */
module.exports = (sequelize, DataTypes) => {
  const MaterialTransaction = sequelize.define('MaterialTransaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    transactionId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'materials',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('receipt', 'issue', 'adjustment', 'return'),
      allowNull: false,
      comment: 'Jenis transaksi: penerimaan, pengeluaran, penyesuaian, atau pengembalian'
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Jumlah material (positif untuk masuk, negatif untuk keluar)'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Harga per unit untuk transaksi ini'
    },
    batchNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    referenceNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Nomor referensi PO/DO/batch produksi'
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'suppliers',
        key: 'id'
      }
    },
    receivedBy: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    issuedBy: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    previousQuantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Jumlah stok sebelum transaksi'
    },
    newQuantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Jumlah stok setelah transaksi'
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    productionOrderId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'ID pesanan produksi terkait'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      defaultValue: 'completed'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Lokasi penyimpanan di gudang'
    }
  }, {
    tableName: 'material_transactions',
    timestamps: true
  });

  // Definisi asosiasi
  MaterialTransaction.associate = (models) => {
    MaterialTransaction.belongsTo(models.Material, {
      foreignKey: 'materialId',
      as: 'material'
    });
    
    MaterialTransaction.belongsTo(models.Supplier, {
      foreignKey: 'supplierId',
      as: 'supplier'
    });
  };

  return MaterialTransaction;
};

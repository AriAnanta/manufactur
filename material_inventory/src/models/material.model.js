/**
 * Model Material
 * 
 * Merepresentasikan data material bahan baku
 */
module.exports = (sequelize, DataTypes) => {
  const Material = sequelize.define('Material', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    materialId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Satuan pengukuran (kg, liter, meter, dll)'
    },
    stockQuantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    reorderLevel: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 10,
      comment: 'Jumlah minimum sebelum perlu melakukan pemesanan ulang'
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Harga per unit'
    },
    leadTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Waktu pengiriman dalam hari'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Lokasi penyimpanan di gudang'
    },
    supplier: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Pemasok utama'
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'suppliers',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'discontinued', 'out_of_stock'),
      defaultValue: 'active'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'materials',
    timestamps: true
  });

  // Definisi asosiasi
  Material.associate = (models) => {
    Material.belongsTo(models.Supplier, {
      foreignKey: 'supplierId',
      as: 'supplierInfo'
    });
    
    Material.hasMany(models.MaterialTransaction, {
      foreignKey: 'materialId',
      as: 'transactions'
    });
  };

  return Material;
};

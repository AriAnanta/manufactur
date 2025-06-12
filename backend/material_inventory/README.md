# Material Inventory Service - Dokumentasi API GraphQL

## Gambaran Umum

Layanan Material Inventory menyediakan API GraphQL untuk mengelola inventaris material, pemasok, dan transaksi material. Layanan ini menangani semua aspek manajemen inventaris mulai dari pengelolaan stok, supplier, hingga pelaporan.

## Daftar Isi

- [Tipe Objek](#tipe-objek)
- [Tipe Input](#tipe-input)
- [Query](#query)
- [Mutasi](#mutasi)
- [Contoh](#contoh)
- [Penanganan Error](#penanganan-error)

## Tipe Objek

### Material
Entitas utama untuk material dalam inventaris.
```graphql
type Material {
  id: ID!                           # Identifier unik
  materialId: String!               # ID material eksternal
  name: String!                     # Nama material
  description: String               # Deskripsi material
  category: String!                 # Kategori material
  type: String!                     # Tipe material
  unit: String!                     # Unit pengukuran
  stockQuantity: Float!             # Jumlah stok saat ini
  reorderLevel: Float               # Level untuk reorder
  price: Float                      # Harga per unit
  leadTime: Int                     # Waktu tunggu pengiriman (hari)
  location: String                  # Lokasi penyimpanan
  supplierId: ID                    # ID pemasok
  status: String!                   # Status material (active/inactive)
  notes: String                     # Catatan tambahan
  createdAt: String                 # Timestamp pembuatan
  updatedAt: String                 # Timestamp update terakhir
  supplierInfo: Supplier            # Informasi pemasok
  transactions: [MaterialTransaction] # Riwayat transaksi
}
```

### Supplier
Entitas pemasok material.
```graphql
type Supplier {
  id: ID!                           # Identifier unik
  supplierId: String!               # ID pemasok eksternal
  name: String!                     # Nama pemasok
  address: String                   # Alamat
  city: String                      # Kota
  state: String                     # Provinsi/negara bagian
  postalCode: String                # Kode pos
  country: String                   # Negara
  contactPerson: String             # Kontak person
  phone: String                     # Nomor telepon
  email: String                     # Alamat email
  website: String                   # Website
  paymentTerms: String              # Syarat pembayaran
  leadTime: Int                     # Waktu tunggu pengiriman (hari)
  rating: Float                     # Rating pemasok (1-5)
  status: String!                   # Status pemasok (active/inactive)
  notes: String                     # Catatan tambahan
  createdAt: String                 # Timestamp pembuatan
  updatedAt: String                 # Timestamp update terakhir
  materials: [Material]             # Material yang disuplai
}
```

### MaterialTransaction
Transaksi material (masuk, keluar, adjustment).
```graphql
type MaterialTransaction {
  id: ID!                           # Identifier unik
  transactionId: String!            # ID transaksi eksternal
  type: String!                     # Tipe transaksi (receive/issue/adjustment)
  materialId: ID!                   # ID material
  quantity: Float!                  # Jumlah transaksi
  unit: String!                     # Unit pengukuran
  transactionDate: String!          # Tanggal transaksi
  supplierId: ID                    # ID pemasok (untuk receive)
  referenceNumber: String           # Nomor referensi
  unitPrice: Float                  # Harga per unit
  totalPrice: Float                 # Total harga
  notes: String                     # Catatan transaksi
  createdBy: String                 # Dibuat oleh user
  createdAt: String                 # Timestamp pembuatan
  updatedAt: String                 # Timestamp update terakhir
  material: Material                # Data material
  supplier: Supplier                # Data pemasok
}
```

### StockReport
Laporan stok inventaris.
```graphql
type StockReport {
  totalItems: Int!                  # Total item material
  totalValue: Float                 # Total nilai inventaris
  lowStockItems: Int                # Jumlah item stok rendah
  categories: [String]              # Daftar kategori
  materials: [Material]             # List material dalam laporan
}
```

### SupplierPerformance
Performa pemasok.
```graphql
type SupplierPerformance {
  supplierId: ID!                   # ID pemasok
  name: String!                     # Nama pemasok
  totalTransactions: Int            # Total transaksi
  totalValue: Float                 # Total nilai transaksi
  onTimeDelivery: Float             # Persentase ketepatan waktu
  qualityRating: Float              # Rating kualitas
  materialCount: Int                # Jumlah material yang disuplai
}
```

### StockCheckResult
Hasil pengecekan stok.
```graphql
type StockCheckResult {
  materialId: ID!                   # ID material
  name: String!                     # Nama material
  available: Boolean!               # Apakah stok tersedia
  stockQuantity: Float!             # Jumlah stok saat ini
  requestedQuantity: Float!         # Jumlah yang diminta
  difference: Float!                # Selisih (positif jika cukup)
}
```

### GenericResponse
Respons operasi generik.
```graphql
type GenericResponse {
  success: Boolean!                 # Status keberhasilan
  message: String                   # Pesan respons
  id: ID                           # ID hasil operasi
}
```

## Tipe Input

### MaterialInput
Input untuk membuat atau mengupdate material.
```graphql
input MaterialInput {
  materialId: String                # ID material eksternal
  name: String!                     # Nama material
  description: String               # Deskripsi
  category: String!                 # Kategori
  type: String!                     # Tipe material
  unit: String!                     # Unit pengukuran
  stockQuantity: Float              # Jumlah stok awal
  reorderLevel: Float               # Level reorder
  price: Float                      # Harga per unit
  leadTime: Int                     # Lead time (hari)
  location: String                  # Lokasi penyimpanan
  supplierId: ID                    # ID pemasok
  status: String                    # Status material
  notes: String                     # Catatan
}
```

### SupplierInput
Input untuk membuat atau mengupdate pemasok.
```graphql
input SupplierInput {
  supplierId: String                # ID pemasok eksternal
  name: String!                     # Nama pemasok
  address: String                   # Alamat
  city: String                      # Kota
  state: String                     # Provinsi
  postalCode: String                # Kode pos
  country: String                   # Negara
  contactPerson: String             # Kontak person
  phone: String                     # Telepon
  email: String                     # Email
  website: String                   # Website
  paymentTerms: String              # Syarat pembayaran
  leadTime: Int                     # Lead time (hari)
  rating: Float                     # Rating (1-5)
  status: String                    # Status
  notes: String                     # Catatan
}
```

### TransactionInput
Input untuk transaksi material.
```graphql
input TransactionInput {
  transactionId: String             # ID transaksi eksternal
  type: String!                     # Tipe (receive/issue/adjustment)
  materialId: ID!                   # ID material
  quantity: Float!                  # Jumlah
  unit: String!                     # Unit pengukuran
  transactionDate: String           # Tanggal transaksi
  supplierId: ID                    # ID pemasok
  referenceNumber: String           # Nomor referensi
  unitPrice: Float                  # Harga per unit
  totalPrice: Float                 # Total harga
  notes: String                     # Catatan
  createdBy: String                 # Dibuat oleh
}
```

### StockCheckInput
Input untuk pengecekan stok.
```graphql
input StockCheckInput {
  materialId: ID!                   # ID material
  quantity: Float!                  # Jumlah yang dibutuhkan
}
```

## Query

### Query Material

#### Mendapatkan Semua Material
```graphql
query GetAllMaterials(
  $category: String,
  $type: String,
  $status: String,
  $supplierId: ID,
  $lowStock: Boolean
) {
  materials(
    category: $category,
    type: $type,
    status: $status,
    supplierId: $supplierId,
    lowStock: $lowStock
  ) {
    id
    materialId
    name
    description
    category
    type
    unit
    stockQuantity
    reorderLevel
    price
    status
    supplierInfo {
      id
      name
    }
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Satu Material
```graphql
query GetMaterial($id: ID!) {
  material(id: $id) {
    id
    materialId
    name
    description
    category
    type
    unit
    stockQuantity
    reorderLevel
    price
    leadTime
    location
    status
    notes
    supplierInfo {
      id
      name
      contactPerson
      phone
      email
    }
    transactions {
      id
      type
      quantity
      transactionDate
      notes
    }
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Material berdasarkan ID Material
```graphql
query GetMaterialById($materialId: String!) {
  materialById(materialId: $materialId) {
    id
    materialId
    name
    stockQuantity
    reorderLevel
    status
    supplierInfo {
      name
      contactPerson
    }
  }
}
```

#### Mendapatkan Kategori Material
```graphql
query GetMaterialCategories {
  materialCategories
}
```

#### Mendapatkan Tipe Material
```graphql
query GetMaterialTypes {
  materialTypes
}
```

### Query Supplier

#### Mendapatkan Semua Supplier
```graphql
query GetAllSuppliers($status: String) {
  suppliers(status: $status) {
    id
    supplierId
    name
    city
    country
    contactPerson
    phone
    email
    rating
    status
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Satu Supplier
```graphql
query GetSupplier($id: ID!) {
  supplier(id: $id) {
    id
    supplierId
    name
    address
    city
    state
    postalCode
    country
    contactPerson
    phone
    email
    website
    paymentTerms
    leadTime
    rating
    status
    notes
    materials {
      id
      name
      category
      stockQuantity
    }
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Material dari Supplier
```graphql
query GetSupplierMaterials($id: ID!) {
  supplierMaterials(id: $id) {
    id
    materialId
    name
    category
    type
    unit
    stockQuantity
    price
    status
  }
}
```

### Query Transaksi

#### Mendapatkan Transaksi Material
```graphql
query GetTransactions(
  $type: String,
  $materialId: ID,
  $supplierId: ID,
  $startDate: String,
  $endDate: String,
  $limit: Int
) {
  transactions(
    type: $type,
    materialId: $materialId,
    supplierId: $supplierId,
    startDate: $startDate,
    endDate: $endDate,
    limit: $limit
  ) {
    id
    transactionId
    type
    quantity
    unit
    transactionDate
    referenceNumber
    unitPrice
    totalPrice
    notes
    createdBy
    material {
      name
      category
    }
    supplier {
      name
    }
    createdAt
  }
}
```

#### Mendapatkan Riwayat Transaksi Material
```graphql
query GetMaterialTransactionHistory($materialId: ID!) {
  materialTransactionHistory(materialId: $materialId) {
    id
    type
    quantity
    unit
    transactionDate
    referenceNumber
    unitPrice
    totalPrice
    notes
    createdBy
    supplier {
      name
    }
    createdAt
  }
}
```

### Query Laporan

#### Mendapatkan Laporan Stok
```graphql
query GetStockReport($category: String, $lowStock: Boolean) {
  stockReport(category: $category, lowStock: $lowStock) {
    totalItems
    totalValue
    lowStockItems
    categories
    materials {
      id
      name
      category
      stockQuantity
      reorderLevel
      price
    }
  }
}
```

#### Mendapatkan Performa Supplier
```graphql
query GetSupplierPerformance($supplierId: ID) {
  supplierPerformance(supplierId: $supplierId) {
    supplierId
    name
    totalTransactions
    totalValue
    onTimeDelivery
    qualityRating
    materialCount
  }
}
```

### Query Pengecekan Stok

#### Cek Ketersediaan Stok
```graphql
query CheckStock($input: [StockCheckInput!]!) {
  checkStock(input: $input) {
    materialId
    name
    available
    stockQuantity
    requestedQuantity
    difference
  }
}
```

## Mutasi

### Mutasi Material

#### Membuat Material Baru
```graphql
mutation CreateMaterial($input: MaterialInput!) {
  createMaterial(input: $input) {
    id
    materialId
    name
    category
    type
    unit
    stockQuantity
    reorderLevel
    price
    status
    createdAt
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "input": {
    "name": "Besi Beton 12mm",
    "description": "Besi beton diameter 12mm untuk konstruksi",
    "category": "Logam",
    "type": "Bahan Baku",
    "unit": "batang",
    "stockQuantity": 500,
    "reorderLevel": 100,
    "price": 85000,
    "leadTime": 7,
    "location": "Gudang A-1",
    "supplierId": "1",
    "status": "active",
    "notes": "Material kualitas SNI"
  }
}
```

#### Mengupdate Material
```graphql
mutation UpdateMaterial($id: ID!, $input: MaterialInput!) {
  updateMaterial(id: $id, input: $input) {
    id
    name
    stockQuantity
    reorderLevel
    price
    status
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "id": "1",
  "input": {
    "stockQuantity": 450,
    "reorderLevel": 80,
    "price": 87000,
    "notes": "Harga naik 2% karena inflasi"
  }
}
```

#### Menghapus Material
```graphql
mutation DeleteMaterial($id: ID!) {
  deleteMaterial(id: $id) {
    success
    message
  }
}
```

### Mutasi Supplier

#### Membuat Supplier Baru
```graphql
mutation CreateSupplier($input: SupplierInput!) {
  createSupplier(input: $input) {
    id
    supplierId
    name
    address
    city
    contactPerson
    phone
    email
    status
    createdAt
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "input": {
    "name": "PT Baja Konstruksi Indonesia",
    "address": "Jl. Industri No. 123",
    "city": "Jakarta",
    "state": "DKI Jakarta",
    "postalCode": "12345",
    "country": "Indonesia",
    "contactPerson": "Budi Santoso",
    "phone": "+62-21-1234567",
    "email": "budi@bajakonstruksi.co.id",
    "website": "www.bajakonstruksi.co.id",
    "paymentTerms": "Net 30",
    "leadTime": 7,
    "rating": 4.5,
    "status": "active"
  }
}
```

#### Mengupdate Supplier
```graphql
mutation UpdateSupplier($id: ID!, $input: SupplierInput!) {
  updateSupplier(id: $id, input: $input) {
    id
    name
    contactPerson
    phone
    email
    rating
    status
    updatedAt
  }
}
```

#### Menghapus Supplier
```graphql
mutation DeleteSupplier($id: ID!) {
  deleteSupplier(id: $id) {
    success
    message
  }
}
```

### Mutasi Transaksi

#### Menerima Material (Material Masuk)
```graphql
mutation ReceiveMaterial($input: TransactionInput!) {
  receiveMaterial(input: $input) {
    id
    transactionId
    type
    quantity
    unit
    transactionDate
    referenceNumber
    unitPrice
    totalPrice
    material {
      name
      stockQuantity
    }
    supplier {
      name
    }
    createdAt
  }
}
```

**Variabel:**
```json
{
  "input": {
    "transactionId": "RCV-2024-001",
    "type": "receive",
    "materialId": "1",
    "quantity": 100,
    "unit": "batang",
    "transactionDate": "2024-01-15T10:00:00Z",
    "supplierId": "1",
    "referenceNumber": "PO-2024-001",
    "unitPrice": 85000,
    "totalPrice": 8500000,
    "notes": "Pengiriman sesuai PO",
    "createdBy": "admin"
  }
}
```

#### Mengeluarkan Material (Material Keluar)
```graphql
mutation IssueMaterial($input: TransactionInput!) {
  issueMaterial(input: $input) {
    id
    transactionId
    type
    quantity
    unit
    transactionDate
    referenceNumber
    material {
      name
      stockQuantity
    }
    createdAt
  }
}
```

**Variabel:**
```json
{
  "input": {
    "transactionId": "ISS-2024-001",
    "type": "issue",
    "materialId": "1",
    "quantity": 50,
    "unit": "batang",
    "transactionDate": "2024-01-16T14:00:00Z",
    "referenceNumber": "REQ-2024-001",
    "notes": "Untuk produksi batch B001",
    "createdBy": "supervisor"
  }
}
```

#### Membuat Penyesuaian Stok
```graphql
mutation CreateStockAdjustment($input: TransactionInput!) {
  createStockAdjustment(input: $input) {
    id
    transactionId
    type
    quantity
    unit
    transactionDate
    notes
    material {
      name
      stockQuantity
    }
    createdAt
  }
}
```

**Variabel:**
```json
{
  "input": {
    "transactionId": "ADJ-2024-001",
    "type": "adjustment",
    "materialId": "1",
    "quantity": -5,
    "unit": "batang",
    "transactionDate": "2024-01-17T09:00:00Z",
    "notes": "Penyesuaian karena kerusakan material",
    "createdBy": "warehouse_manager"
  }
}
```

## Contoh

### Contoh Alur Kerja Lengkap

#### 1. Membuat Supplier Baru
```graphql
mutation {
  createSupplier(input: {
    name: "CV Bahan Bangunan Jaya"
    address: "Jl. Raya Industri No. 45"
    city: "Bandung"
    state: "Jawa Barat"
    country: "Indonesia"
    contactPerson: "Andi Wijaya"
    phone: "+62-22-7654321"
    email: "andi@bahanbangunan.co.id"
    paymentTerms: "Net 15"
    leadTime: 5
    rating: 4.0
    status: "active"
  }) {
    id
    name
    contactPerson
    status
  }
}
```

#### 2. Membuat Material Baru
```graphql
mutation {
  createMaterial(input: {
    name: "Semen Portland"
    description: "Semen Portland Type I"
    category: "Semen"
    type: "Bahan Baku"
    unit: "sak"
    stockQuantity: 200
    reorderLevel: 50
    price: 65000
    leadTime: 3
    location: "Gudang B-2"
    supplierId: "1"
    status: "active"
  }) {
    id
    name
    stockQuantity
    status
  }
}
```

#### 3. Menerima Material dari Supplier
```graphql
mutation {
  receiveMaterial(input: {
    type: "receive"
    materialId: "1"
    quantity: 100
    unit: "sak"
    transactionDate: "2024-01-15T08:00:00Z"
    supplierId: "1"
    referenceNumber: "DO-001"
    unitPrice: 65000
    totalPrice: 6500000
    notes: "Pengiriman batch pertama"
    createdBy: "admin"
  }) {
    id
    type
    quantity
    material {
      name
      stockQuantity
    }
  }
}
```

#### 4. Cek Ketersediaan Stok
```graphql
query {
  checkStock(input: [
    {
      materialId: "1"
      quantity: 25
    }
  ]) {
    materialId
    name
    available
    stockQuantity
    requestedQuantity
    difference
  }
}
```

#### 5. Mengeluarkan Material untuk Produksi
```graphql
mutation {
  issueMaterial(input: {
    type: "issue"
    materialId: "1"
    quantity: 25
    unit: "sak"
    transactionDate: "2024-01-16T10:00:00Z"
    referenceNumber: "PROD-001"
    notes: "Untuk produksi batch B001"
    createdBy: "supervisor"
  }) {
    id
    quantity
    material {
      name
      stockQuantity
    }
  }
}
```

#### 6. Melihat Laporan Stok
```graphql
query {
  stockReport(lowStock: true) {
    totalItems
    totalValue
    lowStockItems
    materials {
      id
      name
      category
      stockQuantity
      reorderLevel
    }
  }
}
```

#### 7. Melihat Performa Supplier
```graphql
query {
  supplierPerformance {
    supplierId
    name
    totalTransactions
    totalValue
    onTimeDelivery
    qualityRating
    materialCount
  }
}
```

## Penanganan Error

API GraphQL mengembalikan error dalam format error standar GraphQL:

```json
{
  "errors": [
    {
      "message": "Material tidak ditemukan",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["material"]
    }
  ],
  "data": {
    "material": null
  }
}
```

### Pesan Error Umum

- `"Material tidak ditemukan"` - ID material yang diminta tidak ada
- `"Supplier tidak ditemukan"` - ID supplier yang diminta tidak ada
- `"Transaksi tidak ditemukan"` - ID transaksi yang diminta tidak ada
- `"Stok tidak mencukupi"` - Stok material tidak cukup untuk transaksi keluar
- `"Tidak diotorisasi"` - Pengguna tidak terotentikasi
- `"Kategori material tidak valid"` - Kategori yang dimasukkan tidak sesuai
- `"Unit pengukuran tidak valid"` - Unit yang dimasukkan tidak konsisten
- `"Harga harus positif"` - Nilai harga tidak boleh negatif
- `"Quantity harus positif"` - Jumlah tidak boleh negatif atau nol

### Autentikasi

Sebagian besar mutasi memerlukan autentikasi. Pastikan Anda menyertakan header autentikasi yang tepat saat membuat permintaan ke mutasi yang memodifikasi data.

### Integrasi dengan Layanan Lain

Layanan ini terintegrasi dengan:
- **Production Management Service** - Untuk reservasi material produksi
- **Procurement Service** - Untuk pembelian material
- **Quality Control Service** - Untuk laporan kualitas material

Error jaringan ke layanan-layanan ini dicatat tetapi tidak mencegah operasi utama untuk diselesaikan.

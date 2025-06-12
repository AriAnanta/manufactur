# Production Feedback Service - Dokumentasi API GraphQL

## Gambaran Umum

Layanan Production Feedback menyediakan API GraphQL untuk mengelola umpan balik produksi, kuantitas stok, dan notifikasi status. Layanan ini menangani pelacakan progress produksi, manajemen kualitas, dan sinkronisasi dengan marketplace.

## Daftar Isi

- [Tipe Enum](#tipe-enum)
- [Tipe Objek](#tipe-objek)
- [Tipe Input](#tipe-input)
- [Query](#query)
- [Mutasi](#mutasi)
- [Contoh](#contoh)
- [Penanganan Error](#penanganan-error)

## Tipe Enum

### ProductionStatus
Merepresentasikan status produksi.
```graphql
enum ProductionStatus {
  pending       # Menunggu untuk dimulai
  in_production # Sedang dalam produksi
  on_hold       # Ditunda sementara
  completed     # Selesai
  cancelled     # Dibatalkan
  rejected      # Ditolak
}
```

### QuantityStockStatus
Merepresentasikan status stok kuantitas.
```graphql
enum QuantityStockStatus {
  received      # Diterima
  cancelled     # Dibatalkan
  in_transit    # Dalam perjalanan
  returned      # Dikembalikan
}
```

### NotificationType
Merepresentasikan jenis notifikasi.
```graphql
enum NotificationType {
  status_change    # Perubahan status
  quality_issue    # Masalah kualitas
  step_completion  # Penyelesaian langkah
  comment          # Komentar
  system          # Sistem
}
```

## Tipe Objek

### ProductionFeedback
Entitas utama untuk umpan balik produksi.
```graphql
type ProductionFeedback {
  id: ID!                           # Identifier unik
  feedbackId: String!               # ID feedback eksternal
  batchId: String!                  # ID batch produksi
  orderId: String                   # ID pesanan
  productId: String                 # ID produk
  productName: String!              # Nama produk
  productionPlanId: String          # ID rencana produksi
  status: ProductionStatus!         # Status produksi saat ini
  plannedQuantity: Int!             # Jumlah yang direncanakan
  actualQuantity: Int               # Jumlah aktual yang diproduksi
  defectQuantity: Int               # Jumlah produk cacat
  qualityScore: Float               # Skor kualitas (0-100)
  startDate: String                 # Tanggal mulai produksi
  endDate: String                   # Tanggal selesai produksi
  isMarketplaceUpdated: Boolean!    # Apakah marketplace sudah diupdate
  marketplaceUpdateDate: String     # Tanggal update marketplace
  notes: String                     # Catatan tambahan
  createdBy: String                 # Dibuat oleh user
  updatedBy: String                 # Diupdate oleh user
  createdAt: String!                # Timestamp pembuatan
  updatedAt: String!                # Timestamp update terakhir
  quantityStocks: [QuantityStock]   # Relasi dengan stok kuantitas
}
```

### QuantityStock
Entitas untuk manajemen stok kuantitas.
```graphql
type QuantityStock {
  id: ID!                           # Identifier unik
  productName: String!              # Nama produk
  quantity: Int!                    # Jumlah stok
  reorderPoint: Int                 # Titik reorder
  status: QuantityStockStatus!      # Status stok
  createdAt: String!                # Timestamp pembuatan
  updatedAt: String!                # Timestamp update terakhir
  feedback: ProductionFeedback      # Relasi dengan feedback produksi
}
```

### GenericResponse
Respons operasi generik.
```graphql
type GenericResponse {
  success: Boolean!                 # Status keberhasilan
  message: String                   # Pesan respons
  data: JSON                        # Data tambahan
}
```

### PageInfo
Informasi halaman untuk paginasi.
```graphql
type PageInfo {
  hasNextPage: Boolean!             # Apakah ada halaman berikutnya
  hasPreviousPage: Boolean!         # Apakah ada halaman sebelumnya
}
```

### FeedbackPaginationResponse
Respons paginasi untuk feedback.
```graphql
type FeedbackPaginationResponse {
  items: [ProductionFeedback]!      # List item feedback
  totalCount: Int!                  # Total jumlah item
  pageInfo: PageInfo!               # Informasi halaman
}
```

### QuantityStockPaginationResponse
Respons paginasi untuk quantity stock.
```graphql
type QuantityStockPaginationResponse {
  items: [QuantityStock]!           # List item quantity stock
  totalCount: Int!                  # Total jumlah item
  pageInfo: PageInfo!               # Informasi halaman
}
```

## Tipe Input

### ProductionFeedbackInput
Input untuk membuat atau mengupdate feedback produksi.
```graphql
input ProductionFeedbackInput {
  batchId: String!                  # ID batch produksi
  orderId: String                   # ID pesanan
  productId: String                 # ID produk
  productName: String!              # Nama produk
  productionPlanId: String          # ID rencana produksi
  status: ProductionStatus          # Status produksi
  plannedQuantity: Int!             # Jumlah yang direncanakan
  actualQuantity: Int               # Jumlah aktual
  defectQuantity: Int               # Jumlah cacat
  startDate: String                 # Tanggal mulai
  endDate: String                   # Tanggal selesai
  notes: String                     # Catatan
}
```

### QuantityStockInput
Input untuk membuat atau mengupdate quantity stock.
```graphql
input QuantityStockInput {
  productName: String!              # Nama produk
  quantity: Int!                    # Jumlah stok
  reorderPoint: Int                 # Titik reorder
  status: QuantityStockStatus       # Status stok
}
```

### PaginationInput
Input untuk paginasi.
```graphql
input PaginationInput {
  page: Int                         # Nomor halaman
  limit: Int                        # Jumlah item per halaman
}
```

### FeedbackFilterInput
Input untuk filter feedback.
```graphql
input FeedbackFilterInput {
  status: ProductionStatus          # Filter berdasarkan status
  batchId: String                   # Filter berdasarkan batch ID
  productName: String               # Filter berdasarkan nama produk
  startDate: String                 # Filter tanggal mulai
  endDate: String                   # Filter tanggal selesai
}
```

### QuantityStockFilterInput
Input untuk filter quantity stock.
```graphql
input QuantityStockFilterInput {
  status: QuantityStockStatus       # Filter berdasarkan status
  productName: String               # Filter berdasarkan nama produk
}
```

## Query

### Query Feedback Produksi

#### Mendapatkan Feedback berdasarkan ID
```graphql
query GetFeedbackById($id: ID!) {
  getFeedbackById(id: $id) {
    id
    feedbackId
    batchId
    orderId
    productName
    status
    plannedQuantity
    actualQuantity
    defectQuantity
    qualityScore
    startDate
    endDate
    isMarketplaceUpdated
    notes
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Feedback berdasarkan Feedback ID
```graphql
query GetFeedbackByFeedbackId($feedbackId: String!) {
  getFeedbackByFeedbackId(feedbackId: $feedbackId) {
    id
    feedbackId
    batchId
    productName
    status
    plannedQuantity
    actualQuantity
    qualityScore
    quantityStocks {
      id
      productName
      quantity
      status
    }
  }
}
```

#### Mendapatkan Feedback berdasarkan Batch ID
```graphql
query GetFeedbackByBatchId($batchId: String!) {
  getFeedbackByBatchId(batchId: $batchId) {
    id
    feedbackId
    batchId
    productName
    status
    plannedQuantity
    actualQuantity
    defectQuantity
    startDate
    endDate
    notes
  }
}
```

#### Mendapatkan Semua Feedback dengan Paginasi
```graphql
query GetAllFeedback(
  $pagination: PaginationInput,
  $filters: FeedbackFilterInput
) {
  getAllFeedback(pagination: $pagination, filters: $filters) {
    items {
      id
      feedbackId
      batchId
      productName
      status
      plannedQuantity
      actualQuantity
      qualityScore
      createdAt
      updatedAt
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
```

### Query Quantity Stock

#### Mendapatkan Quantity Stock berdasarkan ID
```graphql
query GetQuantityStockById($id: ID!) {
  getQuantityStockById(id: $id) {
    id
    productName
    quantity
    reorderPoint
    status
    createdAt
    updatedAt
    feedback {
      feedbackId
      productName
      status
    }
  }
}
```

#### Mendapatkan Semua Quantity Stocks
```graphql
query GetAllQuantityStocks(
  $pagination: PaginationInput,
  $filters: QuantityStockFilterInput
) {
  getAllQuantityStocks(pagination: $pagination, filters: $filters) {
    items {
      id
      productName
      quantity
      reorderPoint
      status
      createdAt
      updatedAt
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
```

#### Mendapatkan Quantity Stocks berdasarkan Nama Produk
```graphql
query GetQuantityStocksByProductName($productName: String!) {
  getQuantityStocksByProductName(productName: $productName) {
    id
    productName
    quantity
    reorderPoint
    status
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Item Stok Rendah
```graphql
query GetLowStockItems($threshold: Int) {
  getLowStockItems(threshold: $threshold) {
    id
    productName
    quantity
    reorderPoint
    status
    createdAt
  }
}
```

## Mutasi

### Mutasi Feedback Produksi

#### Membuat Feedback Baru
```graphql
mutation CreateFeedback($input: ProductionFeedbackInput!) {
  createFeedback(input: $input) {
    id
    feedbackId
    batchId
    productName
    status
    plannedQuantity
    actualQuantity
    createdAt
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "input": {
    "batchId": "B-2024-001",
    "orderId": "ORD-001",
    "productId": "PROD-001",
    "productName": "Widget Premium",
    "productionPlanId": "PLAN-001",
    "status": "in_production",
    "plannedQuantity": 100,
    "actualQuantity": 0,
    "defectQuantity": 0,
    "startDate": "2024-01-15T08:00:00Z",
    "notes": "Produksi dimulai sesuai jadwal"
  }
}
```

#### Mengupdate Feedback
```graphql
mutation UpdateFeedback($id: ID!, $input: ProductionFeedbackInput!) {
  updateFeedback(id: $id, input: $input) {
    id
    feedbackId
    status
    actualQuantity
    defectQuantity
    qualityScore
    endDate
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "id": "1",
  "input": {
    "batchId": "B-2024-001",
    "productName": "Widget Premium",
    "status": "completed",
    "plannedQuantity": 100,
    "actualQuantity": 98,
    "defectQuantity": 2,
    "endDate": "2024-01-16T17:00:00Z",
    "notes": "Produksi selesai dengan 2% defect"
  }
}
```

#### Mengupdate Status Feedback
```graphql
mutation UpdateFeedbackStatus($id: ID!, $status: ProductionStatus!) {
  updateFeedbackStatus(id: $id, status: $status) {
    id
    feedbackId
    status
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "id": "1",
  "status": "completed"
}
```

#### Mengupdate Kuantitas Feedback
```graphql
mutation UpdateFeedbackQuantities(
  $id: ID!,
  $actualQuantity: Int,
  $defectQuantity: Int
) {
  updateFeedbackQuantities(
    id: $id,
    actualQuantity: $actualQuantity,
    defectQuantity: $defectQuantity
  ) {
    id
    feedbackId
    actualQuantity
    defectQuantity
    qualityScore
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "id": "1",
  "actualQuantity": 95,
  "defectQuantity": 5
}
```

#### Mengirim Update ke Marketplace
```graphql
mutation SendMarketplaceUpdate($feedbackId: String!) {
  sendMarketplaceUpdate(feedbackId: $feedbackId) {
    success
    message
    data
  }
}
```

**Variabel:**
```json
{
  "feedbackId": "FB-2024-001"
}
```

#### Menghapus Feedback
```graphql
mutation DeleteFeedback($id: ID!) {
  deleteFeedback(id: $id) {
    success
    message
  }
}
```

### Mutasi Quantity Stock

#### Membuat Quantity Stock Baru
```graphql
mutation CreateQuantityStock($input: QuantityStockInput!) {
  createQuantityStock(input: $input) {
    id
    productName
    quantity
    reorderPoint
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
    "productName": "Widget Premium",
    "quantity": 150,
    "reorderPoint": 50,
    "status": "received"
  }
}
```

#### Mengupdate Quantity Stock
```graphql
mutation UpdateQuantityStock(
  $id: ID!,
  $quantity: Int!,
  $reorderPoint: Int,
  $status: QuantityStockStatus
) {
  updateQuantityStock(
    id: $id,
    quantity: $quantity,
    reorderPoint: $reorderPoint,
    status: $status
  ) {
    id
    productName
    quantity
    reorderPoint
    status
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "id": "1",
  "quantity": 200,
  "reorderPoint": 75,
  "status": "received"
}
```

#### Mengupdate Status Quantity Stock
```graphql
mutation UpdateQuantityStockStatus($id: ID!, $status: QuantityStockStatus!) {
  updateQuantityStockStatus(id: $id, status: $status) {
    id
    productName
    status
    updatedAt
  }
}
```

#### Menyesuaikan Quantity Stock
```graphql
mutation AdjustQuantityStock(
  $id: ID!,
  $adjustmentQuantity: Int!,
  $notes: String
) {
  adjustQuantityStock(
    id: $id,
    adjustmentQuantity: $adjustmentQuantity,
    notes: $notes
  ) {
    id
    productName
    quantity
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "id": "1",
  "adjustmentQuantity": -10,
  "notes": "Penyesuaian karena kerusakan produk"
}
```

#### Menghapus Quantity Stock
```graphql
mutation DeleteQuantityStock($id: ID!) {
  deleteQuantityStock(id: $id) {
    success
    message
  }
}
```

## Contoh

### Contoh Alur Kerja Lengkap

#### 1. Membuat Feedback Produksi Baru
```graphql
mutation {
  createFeedback(input: {
    batchId: "B-2024-002"
    orderId: "ORD-002"
    productName: "Komponen Presisi"
    productionPlanId: "PLAN-002"
    status: in_production
    plannedQuantity: 50
    startDate: "2024-01-16T09:00:00Z"
    notes: "Memulai produksi komponen presisi untuk pesanan khusus"
  }) {
    id
    feedbackId
    batchId
    status
  }
}
```

#### 2. Membuat Quantity Stock untuk Produk
```graphql
mutation {
  createQuantityStock(input: {
    productName: "Komponen Presisi"
    quantity: 0
    reorderPoint: 25
    status: in_transit
  }) {
    id
    productName
    quantity
    status
  }
}
```

#### 3. Mengupdate Progress Produksi
```graphql
mutation {
  updateFeedbackQuantities(
    id: "2"
    actualQuantity: 30
    defectQuantity: 1
  ) {
    id
    actualQuantity
    defectQuantity
    qualityScore
  }
}
```

#### 4. Menyelesaikan Produksi
```graphql
mutation {
  updateFeedback(id: "2", input: {
    batchId: "B-2024-002"
    productName: "Komponen Presisi"
    status: completed
    plannedQuantity: 50
    actualQuantity: 48
    defectQuantity: 2
    endDate: "2024-01-16T18:00:00Z"
    notes: "Produksi selesai dengan tingkat cacat 4%"
  }) {
    id
    status
    actualQuantity
    qualityScore
  }
}
```

#### 5. Mengupdate Stok setelah Produksi
```graphql
mutation {
  updateQuantityStock(
    id: "2"
    quantity: 48
    status: received
  ) {
    id
    productName
    quantity
    status
  }
}
```

#### 6. Mengirim Update ke Marketplace
```graphql
mutation {
  sendMarketplaceUpdate(feedbackId: "FB-2024-002") {
    success
    message
    data
  }
}
```

#### 7. Memonitor Stok Rendah
```graphql
query {
  getLowStockItems(threshold: 30) {
    id
    productName
    quantity
    reorderPoint
    status
  }
}
```

#### 8. Mendapatkan Laporan Feedback dengan Filter
```graphql
query {
  getAllFeedback(
    pagination: { page: 1, limit: 10 }
    filters: {
      status: completed
      startDate: "2024-01-01T00:00:00Z"
      endDate: "2024-01-31T23:59:59Z"
    }
  ) {
    items {
      id
      feedbackId
      productName
      actualQuantity
      defectQuantity
      qualityScore
      startDate
      endDate
    }
    totalCount
    pageInfo {
      hasNextPage
    }
  }
}
```

## Penanganan Error

API GraphQL mengembalikan error dalam format error standar GraphQL:

```json
{
  "errors": [
    {
      "message": "Feedback produksi tidak ditemukan",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["getFeedbackById"]
    }
  ],
  "data": {
    "getFeedbackById": null
  }
}
```

### Pesan Error Umum

- `"Feedback produksi tidak ditemukan"` - ID feedback yang diminta tidak ada
- `"Quantity stock tidak ditemukan"` - ID quantity stock yang diminta tidak ada
- `"Batch ID diperlukan"` - Parameter batch ID wajib diisi
- `"Nama produk diperlukan"` - Parameter nama produk wajib diisi
- `"Jumlah yang direncanakan harus positif"` - Planned quantity harus lebih dari 0
- `"Jumlah aktual tidak boleh melebihi yang direncanakan"` - Actual quantity tidak valid
- `"Status produksi tidak valid"` - Status yang diberikan tidak sesuai enum
- `"Gagal mengirim update ke marketplace"` - Error saat komunikasi dengan marketplace
- `"Tidak diotorisasi"` - Pengguna tidak terotentikasi
- `"Akses ditolak"` - Pengguna tidak memiliki permission

### Tipe Data Kustom

#### Date
Tipe scalar untuk tanggal dalam format ISO 8601.
```
Contoh: "2024-01-15T08:00:00Z"
```

#### JSON
Tipe scalar untuk data JSON arbitrary.
```json
{
  "marketplaceResponse": {
    "status": "success",
    "updateId": "UPD-001"
  }
}
```

### Autentikasi

Mutasi yang mengubah data memerlukan autentikasi yang tepat. Pastikan header autentikasi disertakan dalam permintaan.

### Integrasi dengan Layanan Lain

Layanan ini terintegrasi dengan:
- **Production Management Service** - Untuk menerima update status produksi
- **Machine Queue Service** - Untuk tracking progress mesin (via RabbitMQ)
- **Quality Control Service** - Untuk data kualitas produk
- **Marketplace API** - Untuk sinkronisasi stok dan status

Error jaringan ke layanan-layanan ini dicatat tetapi tidak mencegah operasi utama untuk diselesaikan.

### RabbitMQ Integration

Layanan ini menggunakan RabbitMQ untuk menerima real-time updates:
- **Queue**: `machine_queue_updates`
- **Message Format**: JSON dengan informasi status produksi
- **Auto-processing**: Update otomatis feedback berdasarkan pesan yang diterima

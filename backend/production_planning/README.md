# Dokumentasi API GraphQL - Production Planning Service

## Daftar Isi
1. [Gambaran Umum](#gambaran-umum)
2. [Endpoint](#endpoint)
3. [Types](#types)
4. [Queries](#queries)
5. [Mutations](#mutations)
6. [Input Types](#input-types)
7. [Response Types](#response-types)
8. [Contoh Penggunaan](#contoh-penggunaan)
9. [Error Handling](#error-handling)

## Gambaran Umum

API GraphQL Production Planning Service menyediakan operasi untuk mengelola rencana produksi, termasuk membuat, memperbarui, menghapus, dan menyetujui rencana produksi.

## Endpoint

```
POST /graphql
```

## Types

### ProductionPlan

Tipe utama yang merepresentasikan rencana produksi.

```graphql
type ProductionPlan {
  id: ID                    # ID unik rencana produksi
  planId: String           # ID rencana yang dapat dibaca manusia
  requestId: Int           # ID permintaan produksi terkait
  productionRequestId: String  # ID string permintaan produksi
  productName: String      # Nama produk yang akan diproduksi
  plannedStartDate: String # Tanggal mulai yang direncanakan (ISO 8601)
  plannedEndDate: String   # Tanggal selesai yang direncanakan (ISO 8601)
  priority: String         # Prioritas: "high", "normal", "low"
  status: String           # Status: "draft", "approved", "in_progress", "completed"
  planningNotes: String    # Catatan perencanaan
  plannedBatches: Int      # Jumlah batch yang direncanakan
  batchId: Int            # ID batch terkait (opsional)
  createdAt: String       # Waktu pembuatan (ISO 8601)
  updatedAt: String       # Waktu pembaruan terakhir (ISO 8601)
}
```

## Queries

### 1. plans

Mengambil semua rencana produksi, diurutkan berdasarkan tanggal pembuatan terbaru.

**Input:** Tidak ada

**Output:** `[ProductionPlan]`

**Contoh Query:**
```graphql
query {
  plans {
    id
    planId
    productName
    status
    priority
    plannedStartDate
    plannedEndDate
    planningNotes
    plannedBatches
  }
}
```

**Contoh Response:**
```json
{
  "data": {
    "plans": [
      {
        "id": "1",
        "planId": "PLAN-1703123456789-123",
        "productName": "Product A",
        "status": "draft",
        "priority": "high",
        "plannedStartDate": "2024-01-15T08:00:00.000Z",
        "plannedEndDate": "2024-01-20T17:00:00.000Z",
        "planningNotes": "Rencana produksi untuk pesanan urgent",
        "plannedBatches": 2
      }
    ]
  }
}
```

### 2. plan

Mengambil detail rencana produksi berdasarkan ID.

**Input:** 
- `id: ID!` - ID rencana produksi

**Output:** `ProductionPlan`

**Contoh Query:**
```graphql
query GetPlan($id: ID!) {
  plan(id: $id) {
    id
    planId
    requestId
    productionRequestId
    productName
    plannedStartDate
    plannedEndDate
    priority
    status
    planningNotes
    plannedBatches
    batchId
    createdAt
    updatedAt
  }
}
```

**Variables:**
```json
{
  "id": "1"
}
```

## Mutations

### 1. createPlan

Membuat rencana produksi baru.

**Input:** `PlanInput!`

**Output:** `ProductionPlan`

**Contoh Mutation:**
```graphql
mutation CreatePlan($input: PlanInput!) {
  createPlan(input: $input) {
    id
    planId
    productName
    status
    priority
    plannedStartDate
    plannedEndDate
    planningNotes
    plannedBatches
  }
}
```

**Variables:**
```json
{
  "input": {
    "requestId": 123,
    "planningNotes": "Rencana produksi untuk pesanan khusus",
    "priority": "high",
    "productName": "Product A",
    "plannedStartDate": "2024-01-15T08:00:00.000Z",
    "plannedEndDate": "2024-01-20T17:00:00.000Z",
    "plannedBatches": 2
  }
}
```

### 2. updatePlan

Memperbarui rencana produksi yang ada.

**Input:** 
- `id: ID!` - ID rencana produksi
- `input: PlanUpdateInput!` - Data yang akan diperbarui

**Output:** `ProductionPlan`

**Contoh Mutation:**
```graphql
mutation UpdatePlan($id: ID!, $input: PlanUpdateInput!) {
  updatePlan(id: $id, input: $input) {
    id
    planId
    productName
    status
    priority
    plannedStartDate
    plannedEndDate
    planningNotes
    plannedBatches
  }
}
```

**Variables:**
```json
{
  "id": "1",
  "input": {
    "status": "approved",
    "priority": "normal",
    "planningNotes": "Rencana telah direvisi dan disetujui"
  }
}
```

### 3. deletePlan

Menghapus rencana produksi.

**Input:** 
- `id: ID!` - ID rencana produksi

**Output:** `SuccessResponse`

**Contoh Mutation:**
```graphql
mutation DeletePlan($id: ID!) {
  deletePlan(id: $id) {
    success
    message
  }
}
```

**Variables:**
```json
{
  "id": "1"
}
```

### 4. approvePlan

Menyetujui rencana produksi dan membuat batch produksi.

**Input:** 
- `id: ID!` - ID rencana produksi

**Output:** `ApproveResponse`

**Contoh Mutation:**
```graphql
mutation ApprovePlan($id: ID!) {
  approvePlan(id: $id) {
    success
    message
    plan {
      id
      planId
      status
      planningNotes
    }
    batchCreated {
      id
      batchNumber
    }
  }
}
```

**Variables:**
```json
{
  "id": "1"
}
```

## Input Types

### PlanInput

Input untuk membuat rencana produksi baru.

```graphql
input PlanInput {
  requestId: Int           # ID permintaan produksi (opsional)
  planningNotes: String!   # Catatan perencanaan (wajib)
  priority: String         # Prioritas: "high", "normal", "low" (opsional)
  batchId: Int            # ID batch terkait (opsional)
  productName: String     # Nama produk (opsional)
  plannedStartDate: String # Tanggal mulai (ISO 8601, opsional)
  plannedEndDate: String  # Tanggal selesai (ISO 8601, opsional)
  plannedBatches: Int     # Jumlah batch (opsional, default: 1)
}
```

### PlanUpdateInput

Input untuk memperbarui rencana produksi.

```graphql
input PlanUpdateInput {
  productName: String     # Nama produk (opsional)
  plannedStartDate: String # Tanggal mulai (ISO 8601, opsional)
  plannedEndDate: String  # Tanggal selesai (ISO 8601, opsional)
  priority: String        # Prioritas (opsional)
  status: String          # Status (opsional)
  planningNotes: String   # Catatan perencanaan (opsional)
  plannedBatches: Int     # Jumlah batch (opsional)
  requestId: Int          # ID permintaan produksi (opsional)
  batchId: Int           # ID batch (opsional)
}
```

## Response Types

### SuccessResponse

Response untuk operasi yang mengembalikan status keberhasilan.

```graphql
type SuccessResponse {
  success: Boolean        # Status keberhasilan operasi
  message: String         # Pesan deskriptif
}
```

### ApproveResponse

Response khusus untuk operasi persetujuan rencana produksi.

```graphql
type ApproveResponse {
  success: Boolean        # Status keberhasilan operasi
  message: String         # Pesan deskriptif
  plan: ProductionPlan    # Rencana produksi yang disetujui
  batchCreated: BatchResponse # Informasi batch yang dibuat
}
```

### BatchResponse

Informasi batch produksi yang dibuat.

```graphql
type BatchResponse {
  id: Int                 # ID batch
  batchNumber: String     # Nomor batch
}
```

## Contoh Penggunaan

### Skenario 1: Membuat Rencana Produksi Baru

```graphql
# 1. Buat rencana produksi
mutation {
  createPlan(input: {
    requestId: 456
    planningNotes: "Rencana produksi untuk pesanan Q1 2024"
    priority: "high"
    productName: "Widget Premium"
    plannedStartDate: "2024-01-15T08:00:00.000Z"
    plannedEndDate: "2024-01-25T17:00:00.000Z"
    plannedBatches: 3
  }) {
    id
    planId
    status
    productName
    plannedBatches
  }
}
```

### Skenario 2: Workflow Persetujuan

```graphql
# 1. Ambil detail rencana
query {
  plan(id: "1") {
    id
    planId
    status
    productName
    planningNotes
  }
}

# 2. Update jika diperlukan
mutation {
  updatePlan(id: "1", input: {
    priority: "high"
    planningNotes: "Diprioritaskan untuk pengiriman urgent"
  }) {
    id
    priority
    planningNotes
  }
}

# 3. Setujui rencana
mutation {
  approvePlan(id: "1") {
    success
    message
    plan {
      status
    }
    batchCreated {
      id
      batchNumber
    }
  }
}
```

### Skenario 3: Monitoring Semua Rencana

```graphql
query {
  plans {
    id
    planId
    productName
    status
    priority
    plannedStartDate
    plannedEndDate
    plannedBatches
  }
}
```

## Error Handling

### Tipe Error Umum

1. **Rencana Tidak Ditemukan**
   ```json
   {
     "errors": [
       {
         "message": "Rencana produksi tidak ditemukan",
         "path": ["plan"]
       }
     ]
   }
   ```

2. **Validasi Input**
   ```json
   {
     "errors": [
       {
         "message": "Request ID tidak valid. Harus angka positif.",
         "path": ["createPlan"]
       }
     ]
   }
   ```

3. **Error Sistem**
   ```json
   {
     "errors": [
       {
         "message": "Gagal mengambil rencana produksi",
         "path": ["plans"]
       }
     ]
   }
   ```

### Best Practices Error Handling

1. **Selalu periksa field `errors` dalam response**
2. **Gunakan field `success` dan `message` dalam mutation response**
3. **Implementasikan retry logic untuk error sementara**
4. **Log error untuk debugging**

## Catatan Pengembangan

1. **Format Tanggal**: Semua tanggal menggunakan format ISO 8601
2. **ID Generation**: `planId` dibuat otomatis dengan format `PLAN-{timestamp}-{random}`
3. **Status Workflow**: `draft` → `approved` → `in_progress` → `completed`
4. **Priority Levels**: `high`, `normal`, `low`
5. **Validasi**: ID numerik harus berupa angka positif
6. **Integrasi**: Service terintegrasi dengan Production Management Service untuk batch creation

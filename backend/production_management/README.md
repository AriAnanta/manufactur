# Production Management Service - Dokumentasi API GraphQL

## Gambaran Umum

Layanan Production Management menyediakan API GraphQL untuk mengelola permintaan produksi, batch, langkah-langkah, dan alokasi material. Layanan ini menangani siklus hidup produksi lengkap dari pembuatan permintaan hingga penyelesaian.

## Daftar Isi

- [Tipe Enum](#tipe-enum)
- [Tipe Objek](#tipe-objek)
- [Tipe Input](#tipe-input)
- [Query](#query)
- [Mutasi](#mutasi)
- [Contoh](#contoh)
- [Penanganan Error](#penanganan-error)

## Tipe Enum

### RequestStatus
Merepresentasikan status dari permintaan produksi.
```graphql
enum RequestStatus {
  received      # Status awal ketika permintaan dibuat
  planned       # Permintaan telah direncanakan dan batch dibuat
  in_production # Produksi telah dimulai
  completed     # Semua produksi selesai
  cancelled     # Permintaan telah dibatalkan
}
```

### BatchStatus
Merepresentasikan status dari batch produksi.
```graphql
enum BatchStatus {
  pending       # Batch dibuat tapi belum dijadwalkan
  scheduled     # Batch dijadwalkan untuk produksi
  in_progress   # Batch sedang dalam proses produksi
  completed     # Produksi batch selesai
  cancelled     # Batch telah dibatalkan
}
```

### StepStatus
Merepresentasikan status dari langkah produksi.
```graphql
enum StepStatus {
  pending       # Langkah menunggu untuk dimulai
  scheduled     # Langkah dijadwalkan dengan mesin/operator
  in_progress   # Langkah sedang dijalankan
  completed     # Langkah selesai
  cancelled     # Langkah dibatalkan
}
```

### MaterialStatus
Merepresentasikan status dari alokasi material.
```graphql
enum MaterialStatus {
  pending       # Alokasi material tertunda
  partial       # Sebagian dialokasikan
  allocated     # Sepenuhnya dialokasikan
  consumed      # Material telah dikonsumsi
}
```

### Priority
Merepresentasikan tingkat prioritas permintaan produksi.
```graphql
enum Priority {
  low           # Prioritas rendah
  normal        # Prioritas normal
  high          # Prioritas tinggi
  urgent        # Prioritas mendesak
}
```

## Tipe Objek

### ProductionRequest
Entitas utama permintaan produksi.
```graphql
type ProductionRequest {
  id: ID!                           # Identifier unik
  requestId: String!                # Identifier permintaan eksternal
  productName: String!              # Nama produk yang akan diproduksi
  quantity: Int!                    # Jumlah yang akan diproduksi
  priority: Priority!               # Prioritas produksi
  status: RequestStatus!            # Status saat ini
  batches: [ProductionBatch]        # Batch produksi terkait
  createdAt: String!                # Timestamp pembuatan
  updatedAt: String!                # Timestamp update terakhir
}
```

### ProductionBatch
Entitas batch produksi yang merepresentasikan bagian dari produksi.
```graphql
type ProductionBatch {
  id: ID!                           # Identifier unik
  batchNumber: String!              # Nomor batch yang dihasilkan
  requestId: Int!                   # Referensi ke permintaan produksi
  scheduledStartDate: String        # Tanggal mulai yang direncanakan
  scheduledEndDate: String          # Tanggal selesai yang direncanakan
  quantity: Int!                    # Jumlah untuk batch ini
  status: BatchStatus!              # Status batch saat ini
  materialsAssigned: Boolean!       # Apakah material sudah ditugaskan
  machineAssigned: Boolean!         # Apakah mesin sudah ditugaskan
  notes: String                     # Catatan tambahan
  request: ProductionRequest        # Permintaan produksi terkait
  steps: [ProductionStep]           # Langkah produksi untuk batch ini
  materialAllocations: [MaterialAllocation] # Alokasi material
  createdAt: String!                # Timestamp pembuatan
  updatedAt: String!                # Timestamp update terakhir
}
```

### ProductionStep
Langkah produksi individual dalam batch.
```graphql
type ProductionStep {
  id: ID!                           # Identifier unik
  batchId: Int!                     # Referensi ke batch produksi
  stepName: String!                 # Nama langkah produksi
  stepOrder: Int!                   # Urutan langkah dalam sequence
  machineType: String               # Tipe mesin yang dibutuhkan
  scheduledStartTime: String        # Waktu mulai yang dijadwalkan
  scheduledEndTime: String          # Waktu selesai yang dijadwalkan
  machineId: Int                    # ID mesin yang ditugaskan
  operatorId: Int                   # ID operator yang ditugaskan
  status: StepStatus!               # Status langkah saat ini
  notes: String                     # Catatan tambahan
  createdAt: String!                # Timestamp pembuatan
  updatedAt: String!                # Timestamp update terakhir
}
```

### MaterialAllocation
Alokasi material untuk batch produksi.
```graphql
type MaterialAllocation {
  id: ID!                           # Identifier unik
  batchId: Int!                     # Referensi ke batch produksi
  materialId: Int!                  # Identifier material
  quantityRequired: Float!          # Jumlah yang dibutuhkan
  quantityAllocated: Float!         # Jumlah yang saat ini dialokasikan
  unitOfMeasure: String!            # Unit pengukuran
  status: MaterialStatus!           # Status alokasi
  allocationDate: String            # Tanggal alokasi
  notes: String                     # Catatan tambahan
  createdAt: String!                # Timestamp pembuatan
  updatedAt: String!                # Timestamp update terakhir
}
```

## Tipe Input

### ProductionRequestInput
Input untuk membuat permintaan produksi baru.
```graphql
input ProductionRequestInput {
  requestId: String!                # Identifier permintaan eksternal
  productName: String!              # Nama produk
  quantity: Int!                    # Jumlah yang akan diproduksi
  priority: Priority!               # Prioritas produksi
}
```

### ProductionRequestUpdateInput
Input untuk mengupdate permintaan produksi yang ada.
```graphql
input ProductionRequestUpdateInput {
  productName: String               # Nama produk yang diupdate
  quantity: Int                     # Jumlah yang diupdate
  priority: Priority                # Prioritas yang diupdate
  status: RequestStatus             # Status yang diupdate
}
```

### ProductionStepInput
Input untuk mendefinisikan langkah produksi.
```graphql
input ProductionStepInput {
  stepName: String!                 # Nama langkah
  machineType: String               # Tipe mesin yang dibutuhkan
  scheduledStartTime: String        # Waktu mulai yang dijadwalkan
  scheduledEndTime: String          # Waktu selesai yang dijadwalkan
}
```

### MaterialInput
Input untuk kebutuhan material.
```graphql
input MaterialInput {
  materialId: Int!                  # Identifier material
  quantityRequired: Float!          # Jumlah yang dibutuhkan
  unitOfMeasure: String!            # Unit pengukuran
}
```

### ProductionBatchInput
Input untuk membuat batch produksi.
```graphql
input ProductionBatchInput {
  requestId: Int!                   # ID permintaan produksi
  quantity: Int!                    # Jumlah batch
  scheduledStartDate: String        # Tanggal mulai yang direncanakan
  scheduledEndDate: String          # Tanggal selesai yang direncanakan
  notes: String                     # Catatan tambahan
  steps: [ProductionStepInput]      # Langkah produksi
  materials: [MaterialInput]        # Kebutuhan material
}
```

### ProductionBatchUpdateInput
Input untuk mengupdate batch produksi.
```graphql
input ProductionBatchUpdateInput {
  scheduledStartDate: String        # Tanggal mulai yang diupdate
  scheduledEndDate: String          # Tanggal selesai yang diupdate
  status: BatchStatus               # Status yang diupdate
  notes: String                     # Catatan yang diupdate
}
```

### ProductionStepUpdateInput
Input untuk mengupdate langkah produksi.
```graphql
input ProductionStepUpdateInput {
  machineId: Int                    # ID mesin yang ditugaskan
  operatorId: Int                   # ID operator yang ditugaskan
  status: StepStatus                # Status yang diupdate
  notes: String                     # Catatan yang diupdate
}
```

## Query

### Query Permintaan Produksi

#### Mendapatkan Semua Permintaan Produksi
```graphql
query GetAllProductionRequests {
  productionRequests {
    id
    requestId
    productName
    quantity
    priority
    status
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Satu Permintaan Produksi
```graphql
query GetProductionRequest($id: ID!) {
  productionRequest(id: $id) {
    id
    requestId
    productName
    quantity
    priority
    status
    batches {
      id
      batchNumber
      quantity
      status
    }
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Permintaan Produksi berdasarkan Status
```graphql
query GetProductionRequestsByStatus($status: RequestStatus!) {
  productionRequestsByStatus(status: $status) {
    id
    requestId
    productName
    quantity
    priority
    status
    createdAt
    updatedAt
  }
}
```

### Query Batch Produksi

#### Mendapatkan Semua Batch Produksi
```graphql
query GetAllProductionBatches {
  productionBatches {
    id
    batchNumber
    requestId
    quantity
    status
    scheduledStartDate
    scheduledEndDate
    request {
      requestId
      productName
      priority
    }
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Satu Batch Produksi
```graphql
query GetProductionBatch($id: ID!) {
  productionBatch(id: $id) {
    id
    batchNumber
    requestId
    quantity
    status
    scheduledStartDate
    scheduledEndDate
    materialsAssigned
    machineAssigned
    notes
    request {
      requestId
      productName
      priority
    }
    steps {
      id
      stepName
      stepOrder
      machineType
      status
    }
    materialAllocations {
      id
      materialId
      quantityRequired
      quantityAllocated
      unitOfMeasure
      status
    }
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Batch Produksi berdasarkan Permintaan
```graphql
query GetProductionBatchesByRequest($requestId: ID!) {
  productionBatchesByRequest(requestId: $requestId) {
    id
    batchNumber
    quantity
    status
    scheduledStartDate
    scheduledEndDate
    steps {
      id
      stepName
      stepOrder
      status
    }
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Batch Produksi berdasarkan Status
```graphql
query GetProductionBatchesByStatus($status: BatchStatus!) {
  productionBatchesByStatus(status: $status) {
    id
    batchNumber
    requestId
    quantity
    status
    request {
      requestId
      productName
      priority
    }
    createdAt
    updatedAt
  }
}
```

### Query Langkah Produksi

#### Mendapatkan Langkah Produksi berdasarkan Batch
```graphql
query GetProductionStepsByBatch($batchId: ID!) {
  productionStepsByBatch(batchId: $batchId) {
    id
    stepName
    stepOrder
    machineType
    scheduledStartTime
    scheduledEndTime
    machineId
    operatorId
    status
    notes
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Satu Langkah Produksi
```graphql
query GetProductionStep($id: ID!) {
  productionStep(id: $id) {
    id
    batchId
    stepName
    stepOrder
    machineType
    scheduledStartTime
    scheduledEndTime
    machineId
    operatorId
    status
    notes
    createdAt
    updatedAt
  }
}
```

### Query Alokasi Material

#### Mendapatkan Alokasi Material berdasarkan Batch
```graphql
query GetMaterialAllocationsByBatch($batchId: ID!) {
  materialAllocationsByBatch(batchId: $batchId) {
    id
    materialId
    quantityRequired
    quantityAllocated
    unitOfMeasure
    status
    allocationDate
    notes
    createdAt
    updatedAt
  }
}
```

## Mutasi

### Mutasi Permintaan Produksi

#### Membuat Permintaan Produksi
```graphql
mutation CreateProductionRequest($input: ProductionRequestInput!) {
  createProductionRequest(input: $input) {
    id
    requestId
    productName
    quantity
    priority
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
    "requestId": "REQ-001",
    "productName": "Widget A",
    "quantity": 100,
    "priority": "normal"
  }
}
```

#### Mengupdate Permintaan Produksi
```graphql
mutation UpdateProductionRequest($id: ID!, $input: ProductionRequestUpdateInput!) {
  updateProductionRequest(id: $id, input: $input) {
    id
    requestId
    productName
    quantity
    priority
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
    "priority": "high",
    "status": "planned"
  }
}
```

#### Membatalkan Permintaan Produksi
```graphql
mutation CancelProductionRequest($id: ID!) {
  cancelProductionRequest(id: $id) {
    id
    requestId
    status
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "id": "1"
}
```

### Mutasi Batch Produksi

#### Membuat Batch Produksi
```graphql
mutation CreateProductionBatch($input: ProductionBatchInput!) {
  createProductionBatch(input: $input) {
    id
    batchNumber
    requestId
    quantity
    status
    scheduledStartDate
    scheduledEndDate
    steps {
      id
      stepName
      stepOrder
      machineType
      status
    }
    materialAllocations {
      id
      materialId
      quantityRequired
      unitOfMeasure
      status
    }
    createdAt
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "input": {
    "requestId": 1,
    "quantity": 50,
    "scheduledStartDate": "2024-01-15T08:00:00Z",
    "scheduledEndDate": "2024-01-20T17:00:00Z",
    "notes": "Batch pertama untuk produksi Widget A",
    "steps": [
      {
        "stepName": "Pemotongan",
        "machineType": "Mesin CNC",
        "scheduledStartTime": "2024-01-15T08:00:00Z",
        "scheduledEndTime": "2024-01-15T12:00:00Z"
      },
      {
        "stepName": "Perakitan",
        "machineType": "Lini Perakitan",
        "scheduledStartTime": "2024-01-15T13:00:00Z",
        "scheduledEndTime": "2024-01-15T17:00:00Z"
      }
    ],
    "materials": [
      {
        "materialId": 101,
        "quantityRequired": 25.5,
        "unitOfMeasure": "kg"
      },
      {
        "materialId": 102,
        "quantityRequired": 100,
        "unitOfMeasure": "buah"
      }
    ]
  }
}
```

#### Mengupdate Batch Produksi
```graphql
mutation UpdateProductionBatch($id: ID!, $input: ProductionBatchUpdateInput!) {
  updateProductionBatch(id: $id, input: $input) {
    id
    batchNumber
    status
    scheduledStartDate
    scheduledEndDate
    notes
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "id": "1",
  "input": {
    "status": "in_progress",
    "notes": "Produksi dimulai lebih awal dari jadwal"
  }
}
```

### Mutasi Langkah Produksi

#### Mengupdate Langkah Produksi
```graphql
mutation UpdateProductionStep($id: ID!, $input: ProductionStepUpdateInput!) {
  updateProductionStep(id: $id, input: $input) {
    id
    batchId
    stepName
    machineId
    operatorId
    status
    notes
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "id": "1",
  "input": {
    "machineId": 5,
    "operatorId": 12,
    "status": "in_progress",
    "notes": "Langkah dimulai di Mesin 5 dengan Operator 12"
  }
}
```

## Contoh

### Contoh Alur Kerja Produksi Lengkap

#### 1. Membuat Permintaan Produksi
```graphql
mutation {
  createProductionRequest(input: {
    requestId: "REQ-2024-001"
    productName: "Widget Premium"
    quantity: 200
    priority: high
  }) {
    id
    requestId
    status
  }
}
```

#### 2. Membuat Batch Produksi
```graphql
mutation {
  createProductionBatch(input: {
    requestId: 1
    quantity: 100
    scheduledStartDate: "2024-01-15T08:00:00Z"
    scheduledEndDate: "2024-01-18T17:00:00Z"
    steps: [
      {
        stepName: "Persiapan Material"
        machineType: "Stasiun Persiapan"
        scheduledStartTime: "2024-01-15T08:00:00Z"
        scheduledEndTime: "2024-01-15T10:00:00Z"
      }
      {
        stepName: "Manufaktur"
        machineType: "Mesin CNC"
        scheduledStartTime: "2024-01-15T10:30:00Z"
        scheduledEndTime: "2024-01-16T17:00:00Z"
      }
      {
        stepName: "Kontrol Kualitas"
        machineType: "Stasiun QC"
        scheduledStartTime: "2024-01-17T08:00:00Z"
        scheduledEndTime: "2024-01-17T12:00:00Z"
      }
      {
        stepName: "Packaging"
        machineType: "Lini Packaging"
        scheduledStartTime: "2024-01-17T13:00:00Z"
        scheduledEndTime: "2024-01-18T17:00:00Z"
      }
    ]
    materials: [
      {
        materialId: 201
        quantityRequired: 50.0
        unitOfMeasure: "kg"
      }
      {
        materialId: 202
        quantityRequired: 200
        unitOfMeasure: "buah"
      }
    ]
  }) {
    id
    batchNumber
    status
  }
}
```

#### 3. Memulai Langkah Produksi
```graphql
mutation {
  updateProductionStep(id: "1", input: {
    machineId: 10
    operatorId: 5
    status: in_progress
    notes: "Memulai persiapan material"
  }) {
    id
    status
    machineId
    operatorId
  }
}
```

#### 4. Menyelesaikan Langkah Produksi
```graphql
mutation {
  updateProductionStep(id: "1", input: {
    status: completed
    notes: "Persiapan material selesai dengan sukses"
  }) {
    id
    status
  }
}
```

#### 5. Memantau Progress
```graphql
query {
  productionBatch(id: "1") {
    id
    batchNumber
    status
    request {
      requestId
      productName
      status
    }
    steps {
      id
      stepName
      stepOrder
      status
      machineId
      operatorId
    }
    materialAllocations {
      materialId
      quantityRequired
      quantityAllocated
      status
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
      "message": "Permintaan produksi tidak ditemukan",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["productionRequest"]
    }
  ],
  "data": {
    "productionRequest": null
  }
}
```


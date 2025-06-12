# Machine Queue Service - Dokumentasi API GraphQL

## Gambaran Umum

Layanan Machine Queue menyediakan API GraphQL untuk mengelola mesin produksi dan antrian pekerjaan. Layanan ini menangani penjadwalan mesin, manajemen antrian produksi, dan monitoring kapasitas mesin.

## Daftar Isi

- [Tipe Enum](#tipe-enum)
- [Tipe Objek](#tipe-objek)
- [Tipe Input](#tipe-input)
- [Query](#query)
- [Mutasi](#mutasi)
- [Contoh](#contoh)
- [Penanganan Error](#penanganan-error)

## Tipe Enum

### MachineStatus
Merepresentasikan status mesin.
```graphql
enum MachineStatus {
  operational   # Mesin beroperasi normal
  maintenance   # Mesin dalam pemeliharaan
  breakdown     # Mesin rusak
  inactive      # Mesin tidak aktif
}
```

### QueueStatus
Merepresentasikan status antrian.
```graphql
enum QueueStatus {
  waiting       # Menunggu untuk diproses
  in_progress   # Sedang diproses
  completed     # Selesai diproses
  paused        # Dijeda sementara
  cancelled     # Dibatalkan
}
```

### QueuePriority
Merepresentasikan prioritas antrian.
```graphql
enum QueuePriority {
  low           # Prioritas rendah
  normal        # Prioritas normal
  high          # Prioritas tinggi
  urgent        # Prioritas mendesak
}
```

## Tipe Objek

### Machine
Entitas mesin produksi.
```graphql
type Machine {
  id: ID!                           # Identifier unik
  machineId: String!                # ID mesin eksternal
  name: String!                     # Nama mesin
  type: String!                     # Tipe mesin
  manufacturer: String              # Nama pabrikan
  modelNumber: String               # Nomor model
  capacity: Float                   # Kapasitas mesin
  capacityUnit: String              # Unit kapasitas
  location: String                  # Lokasi mesin
  installationDate: Date            # Tanggal instalasi
  lastMaintenance: Date             # Pemeliharaan terakhir
  nextMaintenance: Date             # Jadwal pemeliharaan berikutnya
  status: MachineStatus!            # Status mesin saat ini
  hoursPerDay: Float!               # Jam operasi per hari
  notes: String                     # Catatan tambahan
  createdAt: Date!                  # Timestamp pembuatan
  updatedAt: Date!                  # Timestamp update terakhir
  queues: [MachineQueue]            # Antrian pekerjaan
}
```

### MachineQueue
Entitas antrian mesin.
```graphql
type MachineQueue {
  id: ID!                           # Identifier unik
  queueId: String!                  # ID antrian eksternal
  machineId: ID!                    # ID mesin
  batchId: ID!                      # ID batch produksi
  batchNumber: String!              # Nomor batch
  productName: String!              # Nama produk
  stepId: ID                        # ID langkah produksi
  stepName: String                  # Nama langkah produksi
  scheduledStartTime: Date          # Waktu mulai yang dijadwalkan
  scheduledEndTime: Date            # Waktu selesai yang dijadwalkan
  actualStartTime: Date             # Waktu mulai aktual
  actualEndTime: Date               # Waktu selesai aktual
  hoursRequired: Float!             # Jam yang dibutuhkan
  priority: QueuePriority!          # Prioritas antrian
  status: QueueStatus!              # Status antrian
  operatorId: String                # ID operator
  operatorName: String              # Nama operator
  setupTime: Float                  # Waktu setup (jam)
  position: Int!                    # Posisi dalam antrian
  notes: String                     # Catatan tambahan
  createdAt: Date!                  # Timestamp pembuatan
  updatedAt: Date!                  # Timestamp update terakhir
  machine: Machine                  # Data mesin
}
```

### CapacityResponse
Respons pengecekan kapasitas.
```graphql
type CapacityResponse {
  available: Boolean!               # Apakah kapasitas tersedia
  message: String!                  # Pesan respons
  machines: [Machine]               # Daftar mesin yang tersedia
}
```

## Tipe Input

### MachineFilter
Filter untuk query mesin.
```graphql
input MachineFilter {
  type: String                      # Filter berdasarkan tipe
  status: MachineStatus             # Filter berdasarkan status
}
```

### QueueFilter
Filter untuk query antrian.
```graphql
input QueueFilter {
  machineId: ID                     # Filter berdasarkan ID mesin
  batchId: ID                       # Filter berdasarkan ID batch
  status: QueueStatus               # Filter berdasarkan status
  priority: QueuePriority           # Filter berdasarkan prioritas
}
```

### CreateMachineInput
Input untuk membuat mesin baru.
```graphql
input CreateMachineInput {
  name: String!                     # Nama mesin
  type: String!                     # Tipe mesin
  manufacturer: String              # Nama pabrikan
  modelNumber: String               # Nomor model
  capacity: Float                   # Kapasitas
  capacityUnit: String              # Unit kapasitas
  location: String                  # Lokasi
  installationDate: String          # Tanggal instalasi
  hoursPerDay: Float                # Jam operasi per hari
  notes: String                     # Catatan
}
```

### CreateQueueInput
Input untuk membuat antrian baru.
```graphql
input CreateQueueInput {
  machineId: ID!                    # ID mesin
  batchId: ID!                      # ID batch
  batchNumber: String!              # Nomor batch
  productName: String!              # Nama produk
  stepId: ID                        # ID langkah
  stepName: String                  # Nama langkah
  scheduledStartTime: String        # Waktu mulai dijadwalkan
  scheduledEndTime: String          # Waktu selesai dijadwalkan
  hoursRequired: Float!             # Jam yang dibutuhkan
  priority: QueuePriority           # Prioritas
  operatorId: String                # ID operator
  operatorName: String              # Nama operator
  setupTime: Float                  # Waktu setup
  notes: String                     # Catatan
}
```

### UpdateMachineInput
Input untuk mengupdate mesin.
```graphql
input UpdateMachineInput {
  name: String                      # Nama mesin
  type: String                      # Tipe mesin
  manufacturer: String              # Nama pabrikan
  modelNumber: String               # Nomor model
  capacity: Float                   # Kapasitas
  capacityUnit: String              # Unit kapasitas
  location: String                  # Lokasi
  installationDate: String          # Tanggal instalasi
  lastMaintenance: String           # Pemeliharaan terakhir
  nextMaintenance: String           # Jadwal pemeliharaan berikutnya
  status: MachineStatus             # Status mesin
  hoursPerDay: Float                # Jam operasi per hari
  notes: String                     # Catatan
}
```

### UpdateQueueInput
Input untuk mengupdate antrian.
```graphql
input UpdateQueueInput {
  machineId: ID                     # ID mesin
  scheduledStartTime: String        # Waktu mulai dijadwalkan
  scheduledEndTime: String          # Waktu selesai dijadwalkan
  actualStartTime: String           # Waktu mulai aktual
  actualEndTime: String             # Waktu selesai aktual
  hoursRequired: Float              # Jam yang dibutuhkan
  priority: QueuePriority           # Prioritas
  status: QueueStatus               # Status
  operatorId: String                # ID operator
  operatorName: String              # Nama operator
  setupTime: Float                  # Waktu setup
  position: Int                     # Posisi dalam antrian
  notes: String                     # Catatan
}
```

## Query

### Query Mesin

#### Mendapatkan Semua Mesin
```graphql
query GetAllMachines($filter: MachineFilter) {
  machines(filter: $filter) {
    id
    machineId
    name
    type
    manufacturer
    capacity
    capacityUnit
    location
    status
    hoursPerDay
    queues {
      id
      batchNumber
      productName
      status
      priority
    }
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Satu Mesin
```graphql
query GetMachine($id: ID!) {
  machine(id: $id) {
    id
    machineId
    name
    type
    manufacturer
    modelNumber
    capacity
    capacityUnit
    location
    installationDate
    lastMaintenance
    nextMaintenance
    status
    hoursPerDay
    notes
    queues {
      id
      queueId
      batchNumber
      productName
      stepName
      scheduledStartTime
      scheduledEndTime
      status
      priority
    }
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Tipe Mesin
```graphql
query GetMachineTypes {
  machineTypes
}
```

### Query Antrian

#### Mendapatkan Semua Antrian
```graphql
query GetAllQueues($filter: QueueFilter) {
  queues(filter: $filter) {
    id
    queueId
    batchNumber
    productName
    stepName
    scheduledStartTime
    scheduledEndTime
    actualStartTime
    actualEndTime
    hoursRequired
    priority
    status
    operatorName
    position
    machine {
      name
      type
    }
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Satu Antrian
```graphql
query GetQueue($id: ID!) {
  queue(id: $id) {
    id
    queueId
    machineId
    batchId
    batchNumber
    productName
    stepId
    stepName
    scheduledStartTime
    scheduledEndTime
    actualStartTime
    actualEndTime
    hoursRequired
    priority
    status
    operatorId
    operatorName
    setupTime
    position
    notes
    machine {
      name
      type
      location
      status
    }
    createdAt
    updatedAt
  }
}
```

#### Mendapatkan Antrian Mesin
```graphql
query GetMachineQueues($machineId: ID!) {
  machineQueues(machineId: $machineId) {
    id
    queueId
    batchNumber
    productName
    stepName
    scheduledStartTime
    scheduledEndTime
    hoursRequired
    priority
    status
    operatorName
    position
    createdAt
  }
}
```

#### Mendapatkan Antrian Batch
```graphql
query GetBatchQueues($batchId: ID!) {
  batchQueues(batchId: $batchId) {
    id
    queueId
    batchNumber
    productName
    stepName
    scheduledStartTime
    scheduledEndTime
    status
    priority
    machine {
      name
      type
      location
    }
    createdAt
  }
}
```

### Query Kapasitas

#### Cek Kapasitas Mesin
```graphql
query CheckCapacity(
  $machineType: String!,
  $hoursRequired: Float!,
  $startDate: String,
  $endDate: String
) {
  checkCapacity(
    machineType: $machineType,
    hoursRequired: $hoursRequired,
    startDate: $startDate,
    endDate: $endDate
  ) {
    available
    message
    machines {
      id
      name
      type
      location
      status
      hoursPerDay
    }
  }
}
```

## Mutasi

### Mutasi Mesin

#### Membuat Mesin Baru
```graphql
mutation CreateMachine($input: CreateMachineInput!) {
  createMachine(input: $input) {
    id
    machineId
    name
    type
    manufacturer
    capacity
    capacityUnit
    location
    status
    hoursPerDay
    createdAt
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "input": {
    "name": "Mesin CNC-001",
    "type": "CNC Machine",
    "manufacturer": "Haas Automation",
    "modelNumber": "VF-2",
    "capacity": 100,
    "capacityUnit": "parts/hour",
    "location": "Lantai Produksi A",
    "installationDate": "2023-01-15T00:00:00Z",
    "hoursPerDay": 16,
    "notes": "Mesin CNC untuk produksi presisi"
  }
}
```

#### Mengupdate Mesin
```graphql
mutation UpdateMachine($id: ID!, $input: UpdateMachineInput!) {
  updateMachine(id: $id, input: $input) {
    id
    name
    status
    lastMaintenance
    nextMaintenance
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
    "status": "maintenance",
    "lastMaintenance": "2024-01-15T08:00:00Z",
    "nextMaintenance": "2024-04-15T08:00:00Z",
    "notes": "Pemeliharaan rutin triwulan"
  }
}
```

#### Menghapus Mesin
```graphql
mutation DeleteMachine($id: ID!) {
  deleteMachine(id: $id)
}
```

### Mutasi Antrian

#### Membuat Antrian Baru
```graphql
mutation CreateQueue($input: CreateQueueInput!) {
  createQueue(input: $input) {
    id
    queueId
    machineId
    batchNumber
    productName
    stepName
    scheduledStartTime
    scheduledEndTime
    hoursRequired
    priority
    status
    position
    createdAt
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "input": {
    "machineId": "1",
    "batchId": "10",
    "batchNumber": "B-2024-001",
    "productName": "Widget Premium",
    "stepId": "5",
    "stepName": "Pemotongan CNC",
    "scheduledStartTime": "2024-01-16T08:00:00Z",
    "scheduledEndTime": "2024-01-16T16:00:00Z",
    "hoursRequired": 8,
    "priority": "high",
    "operatorId": "OP001",
    "operatorName": "Budi Santoso",
    "setupTime": 0.5,
    "notes": "Pemotongan presisi untuk produk premium"
  }
}
```

#### Mengupdate Antrian
```graphql
mutation UpdateQueue($id: ID!, $input: UpdateQueueInput!) {
  updateQueue(id: $id, input: $input) {
    id
    scheduledStartTime
    scheduledEndTime
    priority
    status
    operatorName
    notes
    updatedAt
  }
}
```

#### Menghapus Antrian
```graphql
mutation DeleteQueue($id: ID!) {
  deleteQueue(id: $id)
}
```

#### Mengubah Prioritas Antrian
```graphql
mutation ChangeQueuePriority($id: ID!, $priority: QueuePriority!) {
  changeQueuePriority(id: $id, priority: $priority) {
    id
    queueId
    priority
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "id": "5",
  "priority": "urgent"
}
```

#### Mengubah Urutan Antrian
```graphql
mutation ReorderQueue($id: ID!, $newPosition: Int!) {
  reorderQueue(id: $id, newPosition: $newPosition) {
    id
    queueId
    position
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "id": "5",
  "newPosition": 1
}
```

#### Memulai Antrian
```graphql
mutation StartQueue($id: ID!, $operatorId: String, $operatorName: String) {
  startQueue(id: $id, operatorId: $operatorId, operatorName: $operatorName) {
    id
    queueId
    status
    actualStartTime
    operatorId
    operatorName
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "id": "5",
  "operatorId": "OP002",
  "operatorName": "Andi Wijaya"
}
```

#### Menyelesaikan Antrian
```graphql
mutation CompleteQueue($id: ID!, $notes: String) {
  completeQueue(id: $id, notes: $notes) {
    id
    queueId
    status
    actualEndTime
    notes
    updatedAt
  }
}
```

**Variabel:**
```json
{
  "id": "5",
  "notes": "Pekerjaan selesai dengan kualitas baik"
}
```

## Contoh

### Contoh Alur Kerja Lengkap

#### 1. Membuat Mesin Baru
```graphql
mutation {
  createMachine(input: {
    name: "Lini Perakitan-001"
    type: "Assembly Line"
    manufacturer: "Industrial Solutions"
    capacity: 50
    capacityUnit: "units/hour"
    location: "Lantai Produksi B"
    hoursPerDay: 24
    notes: "Lini perakitan otomatis 24/7"
  }) {
    id
    machineId
    name
    type
    status
  }
}
```

#### 2. Cek Kapasitas Mesin
```graphql
query {
  checkCapacity(
    machineType: "CNC Machine"
    hoursRequired: 8
    startDate: "2024-01-16T08:00:00Z"
    endDate: "2024-01-16T16:00:00Z"
  ) {
    available
    message
    machines {
      id
      name
      type
      location
      status
    }
  }
}
```

#### 3. Membuat Antrian Produksi
```graphql
mutation {
  createQueue(input: {
    machineId: "1"
    batchId: "10"
    batchNumber: "B-2024-001"
    productName: "Komponen Presisi"
    stepName: "Machining"
    scheduledStartTime: "2024-01-16T08:00:00Z"
    scheduledEndTime: "2024-01-16T16:00:00Z"
    hoursRequired: 8
    priority: normal
    setupTime: 1
    notes: "Produksi komponen presisi tinggi"
  }) {
    id
    queueId
    position
    status
  }
}
```

#### 4. Memulai Pekerjaan
```graphql
mutation {
  startQueue(
    id: "1"
    operatorId: "OP001"
    operatorName: "Ahmad Fauzi"
  ) {
    id
    status
    actualStartTime
    operatorName
  }
}
```

#### 5. Monitor Progress Antrian
```graphql
query {
  machineQueues(machineId: "1") {
    id
    queueId
    batchNumber
    productName
    status
    priority
    position
    scheduledStartTime
    actualStartTime
    operatorName
  }
}
```

#### 6. Mengubah Prioritas Mendadak
```graphql
mutation {
  changeQueuePriority(id: "2", priority: urgent) {
    id
    priority
    position
  }
}
```

#### 7. Menyelesaikan Pekerjaan
```graphql
mutation {
  completeQueue(
    id: "1"
    notes: "Pekerjaan selesai tepat waktu dengan kualitas standar"
  ) {
    id
    status
    actualEndTime
    notes
  }
}
```

## Penanganan Error

API GraphQL mengembalikan error dalam format error standar GraphQL:

```json
{
  "errors": [
    {
      "message": "Mesin tidak ditemukan",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["machine"]
    }
  ],
  "data": {
    "machine": null
  }
}
```

### Pesan Error Umum

- `"Mesin tidak ditemukan"` - ID mesin yang diminta tidak ada
- `"Antrian tidak ditemukan"` - ID antrian yang diminta tidak ada
- `"Gagal mengambil data mesin"` - Error umum saat mengambil data mesin
- `"Gagal mengambil data antrian"` - Error umum saat mengambil data antrian
- `"Gagal mengambil antrian untuk batch"` - Error saat mengambil antrian batch
- `"Tipe mesin dan jam yang dibutuhkan diperlukan"` - Parameter wajib untuk cek kapasitas
- `"Tidak ada mesin [tipe] yang tersedia"` - Tidak ada mesin dengan tipe tertentu
- `"Semua mesin [tipe] sudah dijadwalkan"` - Semua mesin sedang terpakai
- `"Nama dan tipe mesin diperlukan"` - Parameter wajib untuk membuat mesin
- `"Antrian hanya bisa dimulai jika berstatus 'waiting'"` - Status tidak valid untuk memulai
- `"Antrian hanya bisa diselesaikan jika berstatus 'in_progress'"` - Status tidak valid untuk menyelesaikan
- `"Posisi baru harus lebih besar dari 0"` - Posisi antrian tidak valid

### Integrasi RabbitMQ

Layanan ini menggunakan RabbitMQ untuk mengirim notifikasi real-time:
- **Memulai pekerjaan**: Mengirim pesan saat antrian dimulai
- **Menyelesaikan pekerjaan**: Mengirim pesan saat antrian selesai
- **Queue**: `machine_queue_updates`
- **Format pesan**: JSON dengan informasi status antrian

### Autentikasi

Mutasi yang mengubah data memerlukan autentikasi yang tepat. Pastikan header autentikasi disertakan dalam permintaan.

### Integrasi dengan Layanan Lain

Layanan ini terintegrasi dengan:
- **Production Management Service** - Untuk penjadwalan batch produksi
- **Production Feedback Service** - Untuk laporan progress (via RabbitMQ)
- **Maintenance Service** - Untuk jadwal pemeliharaan mesin

Error jaringan ke layanan-layanan ini dicatat tetapi tidak mencegah operasi utama untuk diselesaikan.

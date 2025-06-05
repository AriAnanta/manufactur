# Aplikasi On-Demand Manufacturing

Aplikasi ini merupakan sistem mikroservis untuk mengelola proses manufaktur on-demand, yang terdiri dari beberapa layanan yang saling terintegrasi dengan arsitektur GraphQL API Gateway dan REST API untuk komunikasi internal.

## Daftar Layanan

1. **API Gateway** - GraphQL API Gateway untuk mengintegrasikan semua layanan
2. **User Service** - Layanan terpusat untuk autentikasi dan manajemen pengguna
3. **Production Management Service** - Layanan utama untuk mengelola permintaan produksi
4. **Production Planning Service** - Layanan perencanaan kapasitas dan penjadwalan
5. **Machine Queue Service** - Layanan pengelolaan antrian mesin
6. **Material Inventory Service** - Layanan pengelolaan inventaris bahan baku
7. **Production Feedback Service** - Layanan pencatatan status dan hasil produksi
8. **Frontend** - Aplikasi React dengan Material UI

## Prasyarat

Sebelum menjalankan aplikasi, pastikan sistem Anda telah memiliki:

* Node.js (v14.x atau lebih tinggi)
* NPM (v6.x atau lebih tinggi)
* MySQL (v5.7 atau lebih tinggi)
* Git
* Docker dan Docker Compose (opsional, untuk deployment dengan container)

## Instalasi

### 1. Clone Repository

```bash
git clone [URL_REPOSITORY]
cd tubes-nodejs
```

### 2. Instalasi Dependensi

Untuk menginstal dependensi semua layanan sekaligus:

```bash
# Pada direktori utama
npm run install-all

# Atau instalasi manual untuk setiap layanan
cd user_service && npm install
cd ../production_management && npm install
cd ../production_planning && npm install
cd ../machine_queue && npm install
cd ../material_inventory && npm install
cd ../production_feedback && npm install
```

### 3. Konfigurasi Environment

Salin file `.env.example` menjadi `.env` di setiap direktori layanan:

```bash
# Contoh untuk satu layanan
cd user_service
cp .env.example .env
```

Konfigurasi file `.env` untuk setiap layanan dengan detail database dan konfigurasi lainnya:

```
# Konfigurasi Database
DB_HOST=localhost
DB_PORT=3308
DB_USER=root
DB_PASS=password
DB_NAME=on_demand_manufacturing_[nama_layanan]

# Konfigurasi Server
PORT=5000 # Berbeda untuk setiap layanan
NODE_ENV=development

# URL Layanan
USER_SERVICE_URL=http://localhost:5006
PRODUCTION_MANAGEMENT_URL=http://localhost:5001
PRODUCTION_PLANNING_URL=http://localhost:5002
MACHINE_QUEUE_URL=http://localhost:5003
MATERIAL_INVENTORY_URL=http://localhost:5004
PRODUCTION_FEEDBACK_URL=http://localhost:5005

# Konfigurasi JWT
JWT_SECRET=rahasiajwt
JWT_EXPIRATION=1d

# Konfigurasi Upload
UPLOAD_DIR=uploads
```

Port default untuk setiap layanan:
- User Service: 5006
- Production Management: 5001
- Production Planning: 5002
- Machine Queue: 5003
- Material Inventory: 5004
- Production Feedback: 5005

### 4. Inisialisasi Database

Buat database MySQL untuk setiap layanan:

```sql
CREATE DATABASE IF NOT EXISTS on_demand_manufacturing_user;
CREATE DATABASE IF NOT EXISTS on_demand_manufacturing_production_management;
CREATE DATABASE IF NOT EXISTS on_demand_manufacturing_production_planning;
CREATE DATABASE IF NOT EXISTS on_demand_manufacturing_machine_queue;
CREATE DATABASE IF NOT EXISTS on_demand_manufacturing_material_inventory;
CREATE DATABASE IF NOT EXISTS on_demand_manufacturing_production_feedback;
```

## Menjalankan Aplikasi

### 1. Menjalankan Semua Layanan

Gunakan script berikut untuk menjalankan semua layanan sekaligus:

```bash
# Dari direktori utama
npm run start-all
```

### 2. Menjalankan Layanan Tertentu

Untuk menjalankan layanan tertentu secara terpisah:

```bash
# Contoh untuk Production Feedback Service
cd production_feedback
npm run start

# Atau dengan nodemon untuk development
npm run dev
```

### 3. Memastikan Semua Layanan Berjalan

Setelah menjalankan semua layanan, pastikan semua layanan berjalan dengan memeriksa endpoint health check:

```
http://localhost:5006/health  # User Service
http://localhost:5001/health  # Production Management
http://localhost:5002/health  # Production Planning
http://localhost:5003/health  # Machine Queue
http://localhost:5004/health  # Material Inventory
http://localhost:5005/health  # Production Feedback
```

## Pengujian GraphQL

Setiap layanan memiliki endpoint GraphQL yang dapat diuji menggunakan Apollo Sandbox atau tools lain seperti Postman.

### 1. Menggunakan Apollo Sandbox

Apollo Sandbox tersedia di endpoint GraphQL masing-masing layanan:

```
http://localhost:5001/graphql  # Production Management
http://localhost:5002/graphql  # Production Planning
http://localhost:5003/graphql  # Machine Queue
http://localhost:5004/graphql  # Material Inventory
http://localhost:5005/graphql  # Production Feedback
```

### 2. Contoh Query GraphQL

#### User Service (Autentikasi)

```graphql
mutation Login {
  login(input: {
    username: "admin",
    password: "admin123"
  }) {
    token
    user {
      id
      username
      role
    }
  }
}
```

#### Production Feedback

```graphql
# Mendapatkan daftar feedback dengan paginasi
query GetAllFeedback {
  getAllFeedback(pagination: { page: 1, limit: 10 }) {
    totalItems
    totalPages
    currentPage
    items {
      id
      feedbackId
      batchId
      status
      productName
      createdAt
    }
  }
}

# Membuat feedback baru (memerlukan token autentikasi)
mutation CreateFeedback {
  createFeedback(input: {
    batchId: "BATCH-001",
    orderId: "ORDER-001",
    productId: "PROD-001",
    productName: "Contoh Produk",
    plannedQuantity: 100,
    plannedStartDate: "2025-06-04",
    plannedEndDate: "2025-06-10",
    status: "pending"
  }) {
    id
    feedbackId
    batchId
    status
  }
}
```

#### Material Inventory

```graphql
# Mendapatkan daftar material
query GetAllMaterials {
  getAllMaterials(pagination: { page: 1, limit: 10 }) {
    totalItems
    totalPages
    currentPage
    items {
      id
      materialId
      name
      quantity
      unit
      createdAt
    }
  }
}
```

### 3. Autentikasi di GraphQL

Untuk query/mutation yang memerlukan autentikasi:

1. Dapatkan token dengan menjalankan mutation `login` di User Service
2. Tambahkan token ke HTTP Headers pada Apollo Sandbox:
   ```json
   {
     "Authorization": "Bearer [token_yang_didapat]"
   }
   ```

## Struktur Folder

Setiap layanan memiliki struktur folder yang serupa:

```
layanan/
├── node_modules/
├── public/          # Aset statis
├── src/
│   ├── controllers/ # Controller untuk endpoint REST
│   ├── models/      # Model database Sequelize
│   ├── routes/      # Rute API dan UI
│   ├── graphql/     # Skema dan resolver GraphQL
│   ├── middlewares/ # Middleware aplikasi
│   ├── utils/       # Utilitas umum
│   └── app.js       # Entry point aplikasi
├── uploads/         # Folder upload file
├── views/           # Template UI
├── .env             # Konfigurasi environment
├── .gitignore
├── package.json
└── README.md
```

## Pemecahan Masalah

### Database Connection Issues

Jika terjadi masalah koneksi database:

1. Pastikan server MySQL berjalan
2. Periksa kredensial database di file `.env`
3. Periksa apakah database telah dibuat

### Service Communication Issues

Jika terjadi masalah komunikasi antar layanan:

1. Pastikan semua layanan berjalan
2. Periksa konfigurasi URL layanan di file `.env`
3. Pastikan tidak ada konflik port

### Auth Issues

Jika terjadi masalah autentikasi:

1. Pastikan User Service berjalan dengan benar
2. Periksa JWT_SECRET di file `.env` apakah sama di semua layanan
3. Periksa apakah token belum kedaluwarsa

## Menjalankan dengan Docker

Untuk menjalankan aplikasi menggunakan Docker:

1. Pastikan Docker dan Docker Compose sudah terinstal di sistem Anda
2. Jalankan perintah berikut di direktori root proyek:

```bash
docker-compose up -d
```

3. Akses aplikasi frontend di browser melalui `http://localhost`
4. Akses GraphQL API Gateway di `http://localhost:5000/graphql`

## Kontribusi

Untuk kontribusi pengembangan:

1. Fork repository
2. Buat branch fitur baru (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -am 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request baru

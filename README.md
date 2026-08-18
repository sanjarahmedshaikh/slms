# Smart Library Management System (SLMS)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github-actions)
![Node.js Version](https://img.shields.io/badge/Node.js-v22.23.2-blue?style=for-the-badge&logo=nodedotjs)
![React Version](https://img.shields.io/badge/React-v18.3.1-61DAFB?style=for-the-badge&logo=react)
![Angular Version](https://img.shields.io/badge/Angular-v18.2.0-DD0031?style=for-the-badge&logo=angular)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%20Cloud-47A248?style=for-the-badge&logo=mongodb)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)
![Render](https://img.shields.io/badge/Render-Backend%20Live-46E3B7?style=for-the-badge&logo=render)

A complete, production-ready, enterprise-grade **Smart Library Management System (SLMS)** featuring a Node.js/Express REST API backend with Socket.IO real-time notification engine, connected to MongoDB Atlas, accompanied by a React Student & Faculty Portal and an Angular Admin Dashboard.

---

## 📸 Screenshots & Interfaces

| React Student & Faculty Portal | Angular Admin Dashboard |
|:---:|:---:|
| ![React Portal](https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800) | ![Angular Admin](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800) |
| *Book Catalog, My Loans, Reservations & Fines* | *System Metrics, ApexCharts Analytics, Book Desk, Audit Logs* |

---

## 🏗️ System Architecture

```text
                                  +---------------------------------------+
                                  |           MongoDB Atlas Cloud         |
                                  |                (slms_db)              |
                                  +-------------------+-------------------+
                                                      ^
                                                      | Mongoose ORM
                                                      v
                                  +-------------------+-------------------+
                                  |          Node.js REST API Server      |
                                  |          (Deployed on Render)         |
                                  |    Express.js + Socket.IO + Helmet    |
                                  +---------+-------------------+---------+
                                            ^                   ^
                                            | REST API &        | REST API &
                                            | WebSockets        | WebSockets
                                            v                   v
                     +----------------------+-----+       +-----+-----------------------+
                     |  React Student & Faculty   |       |   Angular Admin Dashboard   |
                     |          Portal            |       |           Console           |
                     |   (Deployed on Vercel)     |       |    (Deployed on Vercel)     |
                     +----------------------------+       +-----------------------------+
```

---

## 🛠️ Technology Stack

### User Frontend
* **Framework**: React.js 18 (Vite)
* **Styling**: Tailwind CSS & Material UI
* **Icons**: Lucide React
* **Charts**: ApexCharts / React ApexCharts
* **Real-time**: Socket.IO Client

### Admin Dashboard
* **Framework**: Angular 18
* **UI**: Angular Material & Tailwind CSS
* **Analytics**: ApexCharts & ng-apexcharts
* **State & Routing**: RxJS & Angular Router
* **Real-time**: Socket.IO Client

### Backend REST API
* **Runtime**: Node.js (v22.23.2)
* **Framework**: Express.js
* **Authentication**: JWT & Bcrypt Password Hashing
* **Real-time**: Socket.IO Server Engine
* **Automation**: Node-Cron Automated Daily Overdue Calculations
* **Logging & Security**: Helmet, Rate Limiter, Compression, Winston, Morgan

### Database
* **Database**: MongoDB Atlas (`slms_db`)
* **ORM**: Mongoose 8.x with Text & Compound Indexing

---

## 📁 Repository Structure

```text
SLMS/
│
├── frontend-react/           # React Student & Faculty Portal (Vite + Tailwind)
│   ├── vercel.json           # Vercel SPA Routing Configuration
│   └── src/                  # React Components, Services, Pages
│
├── admin-angular/            # Angular Admin Dashboard Console
│   ├── vercel.json           # Vercel SPA Routing Configuration
│   └── src/                  # Angular Components, Services, Modules
│
├── backend/                  # Node.js Express REST API & Socket Server
│   ├── server.js             # HTTP & Socket.IO Listener Server
│   └── src/                  # Controllers, Models, Routes, Middlewares
│
├── docs/                     # Production Architecture & Deployment Manuals
│   └── DEPLOYMENT_GUIDE.md   # Step-by-Step Vercel/Render/Atlas Deployment
│
├── .github/workflows/
│   └── ci.yml                # GitHub Actions Automated CI Pipeline
│
├── README.md                 # Project Master Documentation
└── package.json              # Master Automation & Root Scripts
```

---

## 🔑 Pre-seeded Demo Credentials

| Role | Email | Password | Max Loan Limit |
|---|---|---|---|
| **Super Admin** | `admin@slms.com` | `admin123` | 10 Books |
| **Librarian** | `librarian@slms.com` | `librarian123` | 10 Books |
| **Faculty Member** | `faculty@slms.com` | `faculty123` | 7 Books |
| **Student** | `student@slms.com` | `student123` | 3 Books |

---

## 🚀 Local Installation & Setup

### Prerequisites
* Node.js v22.x or higher
* NPM v10.x or higher
* MongoDB Atlas connection URI

### 1. Clone Repository & Install Dependencies
```bash
git clone <repository_url>
cd SLMS
npm install
```

### 2. Configure Backend Environment
Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/slms_db?retryWrites=true&w=majority
JWT_SECRET=slms_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:4200
```

### 3. Seed Database
```bash
cd backend
npm run seed
```

### 4. Run Application Services
```bash
# From workspace root:
# Start Backend API (http://localhost:5000)
npm run dev

# Start React Frontend (http://localhost:5173)
cd frontend-react && npm run dev

# Start Angular Admin (http://localhost:4200)
cd admin-angular && npm run start
```

---

## 🌐 Production Deployment Summary

- **Backend**: Render (`https://slms-backend.onrender.com`)
- **React Frontend**: Vercel (`https://slms-frontend.vercel.app`)
- **Angular Admin**: Vercel (`https://slms-admin.vercel.app`)
- **Database**: MongoDB Atlas (`slms_db`)

For complete deployment steps, refer to [docs/DEPLOYMENT_GUIDE.md](file:///c:/Users/SANJARAHMED/Desktop/SLMS/docs/DEPLOYMENT_GUIDE.md).

---

## 👥 Contributors

* **SLMS Core Engineering Team**: Senior DevOps, Cloud Architect, Security Engineer, Frontend & Backend Engineers.

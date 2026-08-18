# Smart Library Management System (SLMS) - Production Deployment Guide

This guide provides step-by-step instructions for deploying SLMS across **Vercel** (React Frontend & Angular Admin), **Render** (Node.js Backend REST API & Socket Server), and **MongoDB Atlas** (Database Cloud Cluster).

---

## 1. Database Setup: MongoDB Atlas (`slms_db`)

1. Log into your [MongoDB Atlas Dashboard](https://cloud.mongodb.com).
2. Create a Database Cluster (Shared / Serverless / Dedicated).
3. Under **Database Access**:
   - Create a database user (e.g. `slms_admin`) with password.
4. Under **Network Access**:
   - Add IP Address: `0.0.0.0/0` (Allows Render backend dynamic IPs to connect).
5. Obtain the Connection String:
   ```env
   MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/slms_db?retryWrites=true&w=majority
   ```

---

## 2. Backend Deployment: Render

1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure settings:
   - **Name**: `slms-backend`
   - **Region**: Select closest region (e.g. Oregon / Frankfurt / Singapore)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node` (Node v22)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add **Environment Variables**:
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/slms_db?retryWrites=true&w=majority`
   - `JWT_SECRET`: `<YOUR_SECURE_JWT_SECRET>`
   - `CLIENT_URL`: `https://slms-frontend.vercel.app`
   - `ADMIN_URL`: `https://slms-admin.vercel.app`
6. Click **Create Web Service**. Verify health endpoint at `https://slms-backend.onrender.com/api/health`.

---

## 3. Frontend Deployment: React Student Portal (Vercel)

1. Log into [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Select your GitHub repository.
4. Configure settings:
   - **Project Name**: `slms-frontend`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend-react`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variables**:
   - `VITE_API_URL`: `https://slms-backend.onrender.com/api/v1`
6. Click **Deploy**. SPA client routing is automatically handled via `vercel.json`.

---

## 4. Admin Console Deployment: Angular Admin (Vercel)

1. Log into [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import the same GitHub repository.
4. Configure settings:
   - **Project Name**: `slms-admin`
   - **Framework Preset**: `Angular`
   - **Root Directory**: `admin-angular`
   - **Build Command**: `ng build --configuration production`
   - **Output Directory**: `dist/admin-angular/browser`
5. Add **Environment Variables**:
   - `NG_APP_API_URL`: `https://slms-backend.onrender.com/api/v1`
6. Click **Deploy**. SPA routing rewrite is configured via `vercel.json`.

---

## 5. Post-Deployment Verification Checklist

- [x] Backend `/api/health` returns status `success`.
- [x] React Student Portal loads on Vercel without routing errors on page refresh.
- [x] Angular Admin Console loads on Vercel without white screens on deep link refresh.
- [x] MongoDB Atlas database `slms_db` records new users, books, and transactions.
- [x] Real-time Socket.IO notification events are received.

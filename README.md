# Travel-TJ: Central Asia Travel Explorer

A full-stack application for exploring and booking travel experiences in Tajikistan, featuring AI-powered recommendations and real-time chat.

## 🚀 Production Deployment Guide

### Frontend (Vercel)
1. **Repository**: Connect your GitHub repository to Vercel.
2. **Framework Preset**: Vite.
3. **Environment Variables**:
   - `VITE_API_URL`: URL of your deployed backend (e.g., `https://api.travel-tj.render.com/api`).
   - `VITE_GEMINI_API_KEY`: Your Google Gemini API Key.
4. **Build Command**: `npm run build`.
5. **Output Directory**: `dist`.

### Backend (Render / Railway)
1. **Environment Variables**:
   - `DATABASE_URL`: Connection string to your PostgreSQL database.
   - `JWT_SECRET`: A long, secure random string.
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `PORT`: `3000` (or leave blank for Render's default).
2. **Build Command**: `npm install`.
3. **Start Command**: `npm start`.

## 🛠 Local Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 4. Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 📂 Project Structure
- `/src/client`: Frontend React application.
- `/src/server`: Backend Express API.
- `/dist`: Built frontend files for production.
- `server.ts`: Main entry point (Express + Vite Proxy).

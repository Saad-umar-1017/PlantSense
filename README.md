# PlantSense 🌿

**A Gen AI + Computer Vision Virtual Plant Care Advisor**

Full-stack application using Groq API (LLaMA Vision) for plant identification and disease diagnosis, MongoDB Atlas for storage, and React for the frontend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Free Tier) |
| AI/ML | Groq API (LLaMA 4 Scout Vision) |
| Auth | JWT + bcrypt |
| File Upload | Multer |

## Project Structure

```
plantsense/
├── client/          # React Frontend (Vite)
├── server/          # Node.js Backend (Express)
├── .env.example     # Environment variables template
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Groq API key (free at console.groq.com)

## Quick Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd plantsense

# Install backend
cd server
npm install

# Install frontend
cd ../client
npm install
```

### 2. Environment Variables

Copy `.env.example` to `server/.env` and fill in:

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/plantsense
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Run Development

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Deployment (Free Tier)

### Backend → Render.com
1. Push to GitHub
2. New Web Service → connect repo → root directory: `server`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables in Render dashboard

### Frontend → Vercel
1. Import GitHub repo
2. Root directory: `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env variable: `VITE_API_URL=https://your-render-backend.onrender.com/api`

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/profile` — Get profile (protected)
- `PUT /api/auth/profile` — Update profile (protected)

### Plant Identifier
- `POST /api/plants/identify` — Upload image & identify species
- `GET /api/plants/library` — Get user's plant library
- `POST /api/plants/library` — Add plant to library
- `GET /api/plants/history` — Get identification history
- `POST /api/plants/reidentify/:id` — Re-identify with new image

### Health Diagnosis
- `POST /api/diagnosis/analyze` — Upload image & diagnose health
- `GET /api/diagnosis/plant/:plantId` — Get diagnosis history for a plant
- `GET /api/diagnosis/:id` — Get single diagnosis report
- `POST /api/diagnosis/rediagnose/:plantId` — Re-diagnose with new image
- `PUT /api/diagnosis/:id/save` — Save report to plant profile
- `GET /api/diagnosis/:id/share` — Generate shareable report link

## Converting to Mobile (React Native)

This project uses a clean API-first architecture. To convert to mobile:
1. The entire `server/` folder stays unchanged
2. Replace `client/` with a React Native project
3. Reuse all `services/` API call functions
4. Adapt `pages/` components to React Native screens
5. Replace Tailwind classes with React Native StyleSheet

## Authors
- Muhammad Saad Umar Gondal (FA23-BDS-054)
- Sakina Abbas (FA23-BDS-055)

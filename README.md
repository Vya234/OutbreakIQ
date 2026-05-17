# OutbreakIQ

<div align="center">

### AI-powered GIS Disease Outbreak Intelligence Platform

Visualize outbreak hotspots, analyze epidemiological trends, and interact with a Gemma-powered assistant grounded in real-time public health data.

🌐 **Live Demo:** https://outbreak-iq.vercel.app  

</div>

---

## 📌 Overview

OutbreakIQ is a production-ready full-stack application built for the **Gemma 4 Good Hackathon**. It combines geospatial visualization, interactive analytics, and responsible AI to help public health professionals, researchers, and citizens understand disease outbreaks and receive grounded prevention guidance.

The platform supports:

- 🗺️ Interactive GIS mapping of outbreak hotspots
- 📊 Real-time analytics dashboard
- 🤖 Gemma-powered AI chat assistant
- 🛡️ Per-outbreak prevention recommendations
- 📝 Full CRUD data management
- 📄 PDF report generation
- 🎙️ Voice-enabled queries

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🗺️ Interactive Map | Leaflet map with severity-based color-coded markers |
| 📊 Analytics Dashboard | KPI cards, bar/line/pie charts, filters, and PDF export |
| 🤖 AI Chat Assistant | Natural-language Q&A powered by Gemma |
| 🛡️ Prevention Recommendations | AI-generated prevention and risk guidance |
| 🔎 Advanced Filters | Disease, severity, region, search, and date range |
| 📝 Admin CRUD | Create, update, and delete outbreak records |
| 🌙 Dark Mode | Theme toggle with persistence |
| 🎙️ Voice Input | Speech-to-text support for AI chat |
| ☁️ Cloud Deployment | Vercel + Render + MongoDB Atlas |

---

## 🏗️ Architecture

```mermaid
flowchart TB
  subgraph Client["client/ (React + Vite)"]
    UI[Pages & Components]
    Map[Leaflet Map]
    Charts[Recharts]
    UI --> API_CLIENT[Axios]
  end

  subgraph Server["server/ (Express)"]
    API[REST API]
    CTRL[Controllers]
    SVC[Gemma Service]
    DB[(MongoDB)]
    API --> CTRL
    CTRL --> DB
    CTRL --> SVC
  end

  subgraph AI["Gemma 4"]
    Ollama[Ollama Local]
    Google[Google AI Studio]
    Fallback[Grounded Fallback]
  end

  API_CLIENT --> API
  SVC --> Ollama
  SVC --> Google
  SVC --> Fallback
```

---

## 🧰 Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- shadcn/ui
- Leaflet
- Recharts
- Axios

### Backend
- Node.js
- Express.js
- Mongoose
- PDFKit

### AI
- Gemma 2 via Ollama
- Google AI Studio (optional)
- Grounded fallback responses

### Infrastructure
- MongoDB Atlas
- Vercel
- Render

---

## 📁 Project Structure

```text
OutbreakIQ/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── public/
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/
│   │   └── services/
│   └── render.yaml
│
├── package.json
└── README.md
```

---

## 🚀 Live Deployment

| Service | URL |
|--------|-----|
| Frontend | https://outbreak-iq.vercel.app |
| Backend API | https://outbreakiq-api.onrender.com/api/outbreaks |

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas or local MongoDB
- Optional: Ollama with Gemma model

### Clone Repository

```bash
git clone https://github.com/Vya234/OutbreakIQ.git
cd OutbreakIQ
```

### Install Dependencies

```bash
npm install
```

---

## 🔐 Environment Variables

### `server/.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/outbreakiq
GEMMA_PROVIDER=ollama
GEMMA_API_URL=http://127.0.0.1:11434
GEMMA_MODEL=gemma2:2b
CLIENT_URL=http://localhost:5173
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🤖 Ollama Setup (Optional)

```bash
ollama pull gemma2:2b
ollama serve
```

If you don't want to run Ollama locally, set:

```env
GEMMA_PROVIDER=fallback
```

---

## 🌱 Seed Sample Data

```bash
npm run seed
```

Seeds 8 realistic outbreak records across major Indian cities.

---

## 💻 Run Development Server

```bash
npm run dev
```

### Local URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/api/health

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|------|------|------|
| GET | `/api/outbreaks` | Fetch all outbreaks |
| GET | `/api/outbreaks/stats` | Dashboard statistics |
| GET | `/api/outbreaks/report/pdf` | Download PDF report |
| GET | `/api/outbreaks/:id` | Fetch single outbreak |
| POST | `/api/outbreaks` | Create outbreak |
| PUT | `/api/outbreaks/:id` | Update outbreak |
| DELETE | `/api/outbreaks/:id` | Delete outbreak |
| POST | `/api/ai/chat` | AI assistant endpoint |
| POST | `/api/ai/recommendations` | Prevention recommendations |

---

## 🖼️ Screenshots

> Add your screenshots to `docs/screenshots/` and update these paths if needed.

### Home Page
![Home](docs/screenshots/home.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Interactive Map
![Map](docs/screenshots/map.png)

### AI Assistant
![AI Chat](docs/screenshots/ai-chat.png)

---

## ☁️ Deployment

### Frontend (Vercel)

- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment Variable:

```env
VITE_API_URL=https://outbreakiq-api.onrender.com/api
```

### Backend (Render)

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

Environment Variables:

```env
PORT=5000
MONGODB_URI=<your_atlas_uri>
GEMMA_PROVIDER=fallback
CLIENT_URL=https://outbreak-iq.vercel.app
```

---

## 🏆 Hackathon Justification

### 🌍 Social Impact
Supports early awareness of dengue, malaria, cholera, Nipah, and COVID hotspots.

### 🤖 Gemma at the Core
Chat and prevention endpoints use Gemma with outbreak-aware context.

### 🛡️ Responsible AI
Responses are grounded in structured outbreak data and explicitly communicate uncertainty.

### 🚀 Production Ready
Fully deployable monorepo using Vercel, Render, and MongoDB Atlas.

---

## 🔮 Future Enhancements

- Integration with WHO/CDC live data APIs
- Forecasting models
- SMS/email alerts
- Multi-language support
- Mobile application
- Role-based access control

---

## 👤 Author

**Kavya Rai**  
IIT Kharagpur

---

<div align="center">

**OutbreakIQ — AI-powered public health GIS for responsible outbreak intelligence.**

</div>
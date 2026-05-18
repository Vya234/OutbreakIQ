# OutbreakIQ

<div align="center">

### AI-powered GIS Disease Outbreak Intelligence Platform
Built for the Gemma 4 Impact Challenge.

Visualize outbreak hotspots, analyze epidemiological trends, and interact with a Gemma-powered assistant grounded in real-time public health data.

 **Live Demo:** https://outbreak-iq.vercel.app  
 **Demo Video:** https://youtube.com/YOUR_VIDEO_LINK  
 **GitHub Repository:** https://github.com/Vya234/OutbreakIQ  

</div>

---

## Overview

OutbreakIQ is a production-ready full-stack application built for the **Gemma 4 Good Hackathon**. It combines geospatial visualization, interactive analytics, and responsible AI to help public health professionals, researchers, and citizens understand disease outbreaks and receive grounded prevention guidance.

The platform supports:

- Interactive GIS mapping of outbreak hotspots
- Real-time analytics dashboard
- Gemma-powered AI chat assistant
- Per-outbreak prevention recommendations
- Full CRUD data management
- PDF report generation
- Voice-enabled queries

The platform includes a global sample dataset of 28 outbreak records across six continents, demonstrating how the system scales from regional monitoring to worldwide disease intelligence.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| Interactive Map | Leaflet map with severity-based color-coded markers |
| Analytics Dashboard | KPI cards, bar/line/pie charts, filters, and PDF export |
| AI Chat Assistant | Natural-language Q&A powered by Gemma with context-aware suggestion chips |
| Grounded Response Mode | Rule-based fallback with disease-specific symptoms, prevention, and severity-aware risk answers |
| Admin Authentication | JWT-protected CRUD at `/admin` (login at `/admin/login`) |
| Client-Side Filtering | Dashboard, map, and charts update from `filteredOutbreaks` with geographic region mapping |
| Prevention Recommendations | AI-generated prevention and risk guidance |
| Advanced Filters | Disease, severity, region, search, and date range |
| Admin CRUD | Create, update, and delete outbreak records |
| Dark Mode | Theme toggle with persistence |
| Voice Input | Speech-to-text support for AI chat |
| Cloud Deployment | Vercel + Render + MongoDB Atlas |

---

## Architecture

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

## Tech Stack

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
- **Grounded Response Mode** — structured fallback when Gemma is unavailable:
  - Disease-specific **symptoms** and **warning signs**
  - Disease-specific **prevention** guidance
  - **Risk level** answers that interpret Low / Medium / High severity from outbreak data
  - Concise outbreak context (cases, location, severity) without duplicating UI badges

### Infrastructure
- MongoDB Atlas
- Vercel
- Render

---

## Project Structure

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

## Live Deployment

| Service | URL |
|--------|-----|
| Frontend | https://outbreak-iq.vercel.app |
| Backend API | https://outbreakiq-api.onrender.com/api/outbreaks |

---

## Quick Start

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
ADMIN_EMAIL=admin@outbreakiq.com
ADMIN_PASSWORD=yourpassword
JWT_SECRET=your_jwt_secret
GEMMA_PROVIDER=ollama
GEMMA_API_URL=http://127.0.0.1:11434
GEMMA_MODEL=gemma2:2b
CLIENT_URL=http://localhost:5173
```

Copy `server/.env.example` to `server/.env` before running locally. Admin login will not work until `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET` are set.

### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Ollama Setup (Optional)

```bash
ollama pull gemma2:2b
ollama serve
```

If you don't want to run Ollama locally, set:

```env
GEMMA_PROVIDER=fallback
```

The API uses **Grounded Response Mode** automatically when Ollama/Google is unreachable or when `GEMMA_PROVIDER=fallback`. The chat UI shows a single badge: `Grounded Response Mode • Based on N relevant records`.

### AI Chat behavior

| Query type | Fallback behavior |
|------------|-------------------|
| Symptoms | Real disease symptoms + warning signs + brief outbreak context |
| Prevention | Disease-specific prevention steps + outbreak context |
| Risk level | Interprets **Low**, **Medium**, or **High** from record severity |
| High-risk regions | Lists only **High** severity outbreaks |
| Summary | Compact outbreak summary from matched records |

Suggestion chips adapt to the selected **Context** outbreak (e.g. Nipah → “What are the symptoms of Nipah?”).

---

## Seed Sample Data

```bash
npm run seed
```

Seeds 28 realistic outbreak records spanning six continents and covering diseases such as Dengue, COVID-19, Ebola, Cholera, Tuberculosis, MERS, Zika, and Nipah.

---

## 🌍 Global Sample Dataset

OutbreakIQ ships with a curated dataset of 28 outbreak records across six continents, including:

- Asia: India, Japan, Thailand, Bangladesh, Vietnam, Saudi Arabia
- Africa: Nigeria, Kenya, DR Congo, South Africa
- Europe: United Kingdom, Germany, France
- North America: USA, Canada, Mexico
- South America: Brazil, Colombia
- Oceania: Australia

The dataset covers a diverse set of diseases, including:

- Dengue
- Malaria
- COVID-19
- Ebola
- Cholera
- Zika
- Yellow Fever
- Tuberculosis
- MERS
- Influenza
- Measles
- Typhoid
- Lyme Disease
- Hepatitis A

---

## 📊 Dataset Summary

| Metric | Value |
|------|------:|
| Total Outbreak Records | 28 |
| Countries Represented | 19+ |
| Continents Covered | 6 |
| Diseases Included | 18+ |

---

## Run Development Server

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
| POST | `/api/auth/login` | Admin login (returns JWT) |
| POST | `/api/outbreaks` | Create outbreak (JWT required) |
| PUT | `/api/outbreaks/:id` | Update outbreak (JWT required) |
| DELETE | `/api/outbreaks/:id` | Delete outbreak (JWT required) |
| POST | `/api/ai/chat` | AI assistant endpoint |
| POST | `/api/ai/recommendations` | Prevention recommendations |

---

# OutbreakIQ

![OutbreakIQ Home](screenshots/home.png)

## Features
...

## Screenshots

### Interactive Disease Map
![Map](screenshots/map.png)

### Analytics Dashboard
![Dashboard](screenshots/dashboard.png)

### Gemma AI Assistant
![AI Assistant](screenshots/ai-chat.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

---

## Deployment

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
ADMIN_EMAIL=admin@outbreakiq.com
ADMIN_PASSWORD=<strong_password>
JWT_SECRET=<random_secret>
GEMMA_PROVIDER=fallback
CLIENT_URL=https://outbreak-iq.vercel.app
```

---

## Hackathon Justification

### Social Impact
Supports early awareness of disease outbreaks across six continents, helping users identify high-risk regions and access grounded prevention guidance.

### Gemma at the Core
Chat and prevention endpoints use Gemma with outbreak-aware context.

### Responsible AI
Responses are grounded in structured outbreak data. **Grounded Response Mode** provides vetted symptom/prevention content and clear Low/Medium/High severity interpretation when live Gemma is unavailable — shown via a single UI badge, not repeated in the message body.

### Production Ready
Fully deployable monorepo using Vercel, Render, and MongoDB Atlas.

---

## Future Enhancements

- Integration with WHO/CDC live data APIs
- Forecasting models
- SMS/email alerts
- Multi-language support
- Mobile application
- Role-based access control

---

## Team Members

**Kavya Rai**  
**Oindrila Singha**

---

<div align="center">

**OutbreakIQ — AI-powered public health GIS for responsible outbreak intelligence.**

</div>
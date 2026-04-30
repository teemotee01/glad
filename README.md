# NEXUS Platform

> AI-Powered 3D Fashion Design Studio + Fine Dining Restaurant Experience

**Stack:** React 18 · Three.js · React Three Fiber · Supabase · Node.js/Express · Claude AI · jsPDF

---

## Features

### 🧥 Fashion Studio
- Real-time Three.js WebGL 3D mannequin (drag/rotate/zoom)
- 6 garment categories: Shirt, Trousers, Dress, Shoes, Bag, Blazer
- Measurement sliders → live model update
- 12 fabric swatches + custom hex/color picker
- Fabric texture upload (PNG/JPG/WebP → applied to 3D model)
- **AI Design Brief** — Claude generates concept, fabric, construction notes, palette
- **AI Pattern Guide** — Claude generates full cutting guide from measurements
- **PDF Export** — branded A4 pattern sheet with diagram, assembly steps
- Save designs to Supabase / local Zustand store

### 🍽️ Restaurant
- Full 3D dining room (React Three Fiber) — tables, chairs, pendant lights, fog
- Click tables to select (green = available, red = reserved)
- À la carte menu: Starters / Mains / Desserts with live cart
- Order placement → saved to Supabase
- Reservation form → saved to Supabase
- **AI Sommelier** — Claude recommends wine pairings for your meal

### 📊 Dashboard
- Live stats: designs, reservations, cart total, AI generations
- Saved designs table with swatches
- Live activity feed
- Upcoming reservations list

---

## Quick Start

### 1. Install dependencies

```bash
git clone <your-repo>
cd nexus-platform
npm run install:all
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-your-key
CLIENT_URL=http://localhost:3000
```

### 3. Set up Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run `supabase/migrations/001_schema.sql`
3. Enable **Email** auth under Authentication → Providers

### 4. Run locally

```bash
# Option A — run both together (requires root package.json)
npm run dev

# Option B — separate terminals
# Terminal 1:
cd client && npm start

# Terminal 2:
cd server && npm run dev
```

Visit `http://localhost:3000`

---

## Deployment

### Frontend → Netlify

1. Push to GitHub
2. New site → connect repo
3. Base directory: `client`
4. Build command: `npm run build`
5. Publish directory: `build`
6. Add environment variables in Site Settings → Environment

### Backend → Render

1. New Web Service → connect repo
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add `ANTHROPIC_API_KEY` and `CLIENT_URL` env vars

---

## Adding Real 3D Models (.glb)

Place `.glb` files in `client/public/models/` then pass the URL:

```jsx
<ModelViewer
  category="shirt"
  color="#2C3E50"
  modelUrl="/models/shirt.glb"
/>
```

Free GLB sources:
- [Sketchfab](https://sketchfab.com) — search clothing/shoes/bags (CC licensed)
- [Poly.pizza](https://poly.pizza) — free low-poly models
- [Three.js examples](https://github.com/mrdoob/three.js/tree/master/examples/models)

---

## Project Structure

```
nexus-platform/
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── models/          ← place .glb files here
│   ├── src/
│   │   ├── components/
│   │   │   ├── fashion/
│   │   │   │   ├── ModelViewer.js      ← Three.js WebGL viewer
│   │   │   │   ├── DesignControls.js   ← category/color/measurements/texture
│   │   │   │   └── AIDesigner.js       ← AI design + pattern generator
│   │   │   ├── restaurant/
│   │   │   │   ├── RestaurantScene.js  ← 3D dining room
│   │   │   │   ├── Menu.js             ← menu + cart
│   │   │   │   └── ReservationForm.js  ← booking + AI sommelier
│   │   │   └── shared/
│   │   │       ├── Nav.js
│   │   │       └── Toast.js
│   │   ├── hooks/
│   │   │   └── useAI.js               ← Anthropic API hook + system prompts
│   │   ├── lib/
│   │   │   ├── supabase.js            ← Supabase client + CRUD helpers
│   │   │   ├── store.js               ← Zustand global state
│   │   │   └── exportPDF.js           ← jsPDF pattern sheet
│   │   ├── pages/
│   │   │   ├── FashionStudio.js / .css
│   │   │   ├── Restaurant.js / .css
│   │   │   ├── Dashboard.js / .css
│   │   │   └── Auth.js / .css
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/
│   ├── index.js                       ← Express AI proxy (keeps API key server-side)
│   └── package.json
├── supabase/
│   └── migrations/
│       └── 001_schema.sql             ← designs, reservations, orders, ai_logs
├── .env.example
├── .gitignore
├── netlify.toml
├── render.yaml
└── package.json
```

---

## Tech Stack

| Layer      | Tech                                      |
|------------|-------------------------------------------|
| Frontend   | React 18, React Router 6                  |
| 3D         | Three.js, React Three Fiber, Drei         |
| State      | Zustand (persisted to localStorage)       |
| Backend    | Node.js, Express, express-rate-limit      |
| Database   | Supabase (PostgreSQL + RLS + Auth)        |
| AI         | Anthropic Claude (via secure backend proxy)|
| PDF        | jsPDF                                     |
| Deployment | Netlify (client) + Render (server)        |

---

## License

MIT — build freely.

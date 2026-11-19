# SmartCart AI 🛒✨

SmartCart AI is an intelligent grocery shopping and meal planning platform powered by Google Gemini and Firebase. It helps users plan nutritionally balanced meals within their budget and dietary preferences, automatically generating matching grocery carts and tracking deliveries in real time.

---

## 🌟 Features

- **🛒 Smart Grocery Catalog**: Browse, filter, and search fresh produce, dairy, grains, and pantry items with instant stock indicators.
- **🤖 AI Meal Planner**: Generates personalized day-by-day breakfast, lunch, and dinner plans matching your exact household size, dietary restrictions, and budget ceiling using Google Gemini.
- **📦 Intelligent Cart & Checkout**: Automatically compiles recommended grocery items with matched SKUs and quantities, featuring inventory validation and transactional order placement.
- **📍 Live Order Tracking**: Step-by-step interactive tracking from order placement, packaging, and delivery dispatch to your doorstep.
- **🛡️ Built-in Resilience**: Client-side mock fallbacks ensure smooth operation even when local backend emulators are offline.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**:
  - [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/) for fast development and bundling
  - [Tailwind CSS](https://tailwindcss.com/) for modern UI styling
  - [Zustand](https://github.com/pmndrs/zustand) for lightweight state management
  - [Lucide React](https://lucide.dev/) for clean iconography
  - [Framer Motion](https://www.framer.com/motion/) for animations

- **Backend & Cloud Services**:
  - [Firebase Cloud Functions](https://firebase.google.com/docs/functions) with Express & TypeScript
  - [Cloud Firestore](https://firebase.google.com/docs/firestore) for transactional catalog and order storage
  - [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`) for structured AI meal plan generation

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/smartcart-ai.git
   cd smartcart-ai
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Functions Dependencies:**
   ```bash
   cd ../functions
   npm install
   ```

---

## 💻 Running Locally

### Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

The application will be live at `http://localhost:3000`.

### Start Firebase Functions (Optional)

If you have the Firebase CLI configured with Firestore:
```bash
cd functions
npm run serve
```

---

## 📜 Project Structure

```
smartcart-ai/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/       # Cart drawer, meal planner forms & renderers
│   │   ├── pages/            # Dashboard and Order Tracking views
│   │   ├── store/            # Zustand cart & auth state stores
│   │   ├── App.tsx           # Main application view
│   │   └── main.tsx          # Application entry point
│   ├── package.json
│   └── vite.config.ts
├── functions/                # Firebase Cloud Functions (Express + Gemini API)
│   ├── src/
│   │   └── index.ts          # API endpoints: /seed, /generate-plan, /checkout
│   ├── package.json
│   └── tsconfig.json
├── firebase.json             # Firebase configuration
├── firestore.rules           # Security rules for Firestore
└── README.md
```

---

## 📄 License

MIT License. Feel free to use and customize!

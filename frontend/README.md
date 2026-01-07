# Air Cargo Booking Frontend

A premium, high-performance interface for the Air Cargo ecosystem, built with Next.js 15 (App Router) and Ant Design. It focuses on a responsive, professional user experience ("Deep Indigo" theme) with real-time capabilities.

---

## 🌟 Key Highlights

### **1. Modern Tech Stack**
-   **Next.js 15**: Leveraging the latest App Router for server-side rendering and efficient routing.
-   **Ant Design (v5)**: A comprehensive UI library providing accessible, high-quality components (Drawers, Forms, Timelines).
-   **TailwindCSS**: Used for layout utility and custom design tokens.

### **2. Smart Data Handling (SWR)**
-   **Stale-While-Revalidate**: We use `swr` for all data fetching.
-   **Instant Feedback**: Flight search results are cached client-side. Backtracking to search results is instantaneous.
-   **Live Polling**: The tracking interface polls the API every 10 seconds to auto-update shipment status without page reloads.

### **3. Premium UX/UI**
-   **Theme**: Custom "Deep Indigo" (`#44449b`) branding with glassmorphism effects.
-   **Dark Mode**: Fully supported via Tailwind's `dark:` modifiers.
-   **Animations**: GSAP is used for smooth entry transitions and timeline animations.
-   **Responsive**: Mobile-first design with adaptive layouts (e.g., Drawers on mobile vs Modals on desktop).

---

## 📂 Project Structure

-   `app/`: Next.js App Router directory.
    -   `page.tsx`: Home page with Search Widget.
    -   `tracking/`: dedicated tracking page with timeline visualization.
    -   `layout.tsx`: Root layout defining the global `MainLayout` shell.
-   `components/`: Reusable UI modules.
    -   `FlightSearch.tsx`: Complex form logic, API integration, and result rendering.
    -   `TrackingTimeline.tsx`: Ant Design `Steps` component adapted for shipment events.
    -   `MainLayout.tsx`: Responsive navigation bar and footer.
-   `theme/`: Design tokens and global CSS (`globals.css`).

---

## ⚡ Setup & Installation

### Prerequisites
-   Node.js 18+
-   npm or yarn

### Steps

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file in the `frontend/` root:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000
    AUTH_SECRET=your_nextauth_secret
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The app will be live at `http://localhost:3000`.

4.  **Production Build**:
    ```bash
    npm run build
    npm start
    ```

---

## 🎨 Features & Flows

### **1. Intelligent Flight Search**
-   Users can search for flights between global hubs (e.g., DEL -> LHR).
-   **Validation**: Prevents invalid dates or same-origin-destination searches.
-   **Results**: Displays direct flights and transit options with clear pricing and duration metrics.

### **2. Booking Experience**
-   **Review Drawer**: Instead of navigating away, a contextual drawer opens to review flight details and input cargo specifics.
-   **Real-time Feedback**: Loading states and specific error messages (e.g., "Not enough capacity") directly from the backend.

### **3. Shipment Tracking**
-   **Route**: `/tracking?id=BOOK-REF`
-   **visuals**: A vertical timeline showing the exact status of the shipment (`BOOKED` -> `DEPARTED` -> `ARRIVED` -> `DELIVERED`).
-   **Auto-Refresh**: Operators can leave this page open on a dashboard screen; it will update automatically as backend events occur.

### **4. Authentication**
-   Integrated with **NextAuth.js** for secure, session-based user management.
-   Protected routes verify session validity before rendering sensitive booking information.

# Air Cargo Booking Frontend

A premium, high-performance interface for the Air Cargo ecosystem, built with Next.js 14+ and Ant Design.

## 🌟 Highlights

-   **Deep Indigo Theme**: A custom-designed professional aesthetic with a built-in **Dark Mode**.
-   **Smart Caching (SWR)**: 
    -   **Instant Search**: Flight results are cached client-side for immediate navigation.
    -   **Live Tracking**: The tracking page polls for updates every 10 seconds, providing real-time visibility without refreshing.
-   **Responsive UX**: Fully adaptive layouts including a mobile-optimized Hamburger Drawer.
-   **Robust Error Handling**: User-friendly feedback for complex scenarios like high traffic or capacity limits.

## 🛠️ Tech Stack

-   **Core**: [Next.js 14+](https://nextjs.org/) (App Router), TypeScript.
-   **UI Library**: [Ant Design](https://ant.design/), `gsap` (Animations).
-   **Data Fetching**: `swr` (Stale-While-Revalidate).
-   **Styling**: CSS Modules, Tailwind Utilities.

## 📂 Key Dependencies

```json
"dependencies": {
  "antd": "^6.1.4",
  "next": "16.1.1",
  "swr": "^2.3.0",
  "gsap": "^3.14.2"
}
```

## 🚀 Getting Started

1.  **Install**:
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Dev Server**:
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000`.

3.  **Build**:
    ```bash
    npm run build
    npm start
    ```

## 🎨 Features

### 1. Flight Search
-   Interactive widget to search for routes.
-   Displays direct and multi-leg flights.
-   **Cached** results for instant backtracking.

### 2. Real-time Tracking
-   Track any shipment via ID (e.g., `?id=BOOK-123`).
-   **Live Polling** updates status automatically.
-   Visual Timeline of events.

### 3. Booking Management
-   Secure multi-step booking form.
-   Seamless integration with backend concurrency checks.

### 4. Design System
-   **Primary Color**: `#44449b` (Deep Indigo).
-   **Visuals**: Glassmorphism cards, smooth GSAP transitions, clear typography.

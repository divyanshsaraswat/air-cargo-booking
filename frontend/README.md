# Air Cargo Booking Frontend

A modern, responsive, and aesthetically pleasing frontend for the Air Cargo Booking System, built with Next.js and Ant Design.

## 🚀 Features

-   **Deep Indigo Theme**: A premium, professional aesthetic centered around a deep indigo color palette (`#343471ff`, `#44449b`) with a fully integrated specific **Dark Mode**.
-   **Responsive Design**: precise layouts for desktop, tablet, and mobile, including a custom **Hamburger Navigation Drawer** for smaller screens.
-   **Interactive Booking Form**: A multi-step form for creating bookings, featuring validation and simulated API responses.
-   **Real-time Tracking**: A dedicated tracking page that accepts Booking IDs via URL parameters (`?id=BOOK-123`) or manual input, displaying a timeline of shipment events.
-   **Authentication UI**: A clean, branded Login page with social login options (Apple, Google) and email/password inputs.
-   **Custom Theme Toggle**: A delightful, animated sun/moon toggle for switching between Light and Dark modes.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Component Library**: [Ant Design (Antd)](https://ant.design/)
-   **Styling**: CSS Modules (with Tailwind for utilities), Antd Token System for theming.
-   **Icons**: `@ant-design/icons`

## 📂 Project Structure

-   `app/`: App Router pages (`page.tsx`, `layout.tsx`, `globals.css`).
    -   `booking/`: Booking page.
    -   `tracking/`: Tracking page (dynamic search).
    -   `login/`: Login interface.
-   `components/`: Reusable UI components.
    -   `MainLayout.tsx`: The core wrapper with responsive Header, Drawer, and Footer.
    -   `BookingForm.tsx`: The primary booking interface.
    -   `TrackingTimeline.tsx`: Visual timeline for shipment status.
    -   `ThemeToggle.tsx`: Custom animated dark mode switch.
    -   `AntdRegistry.tsx`: Theme provider and token configuration.

## 🏃‍♂️ Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

3.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```

## 🎨 Design System

The application uses a **Deep Indigo** primary color (`#44449b`) to convey trust and professionalism in logistics.

-   **Light Mode**: Clean white backgrounds, sharp text, and elevation shadows.
-   **Dark Mode**: Deep grey/black backgrounds (`#1f1f1f`), white text, and specially styled dark inputs for visual comfort.

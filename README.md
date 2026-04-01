# Mart POS

A modern, offline-first Point of Sale (POS) system built specifically to elevate retail experiences. Packed with dynamic stock management, granular return processing, native receipt printing, and top-tier security out of the box.

![Mart POS Dashboard](pos_login_hero_1775025470135.png)

## Core Features
*   📱 **Offline-First Architecture**: Completely functional without an internet connection using an optimized `localStorage` engine. Images, customer records, inventory stock, and historical sales data are instantly available.
*   🛒 **Robust Checkout System**: Quickly add items, optionally attach Customer details (Name/Phone), and process Cash, Card, or mobile payments (UPI).
*   📦 **Intelligent Inventory Management**: Automatically deducts stock limits as items are sold, dims items operating on 0-stock, and integrates an intuitive 1-click **Restock Configuration**.
*   🔁 **Dynamic Refund & Return Engine**: Easily search old order receipts by Name, Phone, or ID, and issue granular itemized refunds with exactly one click—rebounding returned stock back into your inventory immediately!
*   🖨️ **Native Receipt Printing**: Seamless hardware integration prints rich, detailed POS receipts directly to connected thermal print devices bypassing messy overlay software by hooking into custom `@media print` CSS templates.
*   🎨 **Custom Branding & Theme Engine**: Admins can customize the Store Name, configure Currency (PKR, USD, etc.), change Login interface background visuals, and rewrite slogans dynamically.
*   🔒 **Role-Based Security**: Employs an uncompromising Admin & Cashier restriction policy. System settings, reporting graphs, and cashier account credential adjustments are safely firewalled from basic register operators.

## Technology Stack
*   **React 18** (User Interface & Flow)
*   **Vite** (Build Tooling)
*   **Vanilla CSS** (Component Styling, Dark Mode layout & Print CSS integrations)
*   **Electron** (Cross-platform Desktop Application integration)

## Development & Usage

### 1. Installation
Ensure you have [Node.js](https://nodejs.org) installed. Clone the repository and install dependencies:
```bash
git clone https://github.com/yourusername/pos-mart.git
cd pos-mart
npm install
```

### 2. Available Scripts
To run the development server (Browser experience):
```bash
npm run dev
```

To run the full desktop application (Electron experience):
```bash
npm start
```

### 3. Default Credentials
If running the application for the first time, use the following pre-configured settings to access the dashboard:
*   **Admin Access:** `admin@pos.com` / `admin123`
*   **Cashier Access:** Modify Cashier default credentials dynamically inside the Admin Settings tab!

## Project Architecture
The entire point-of-sale functionality heavily leverages React's context and custom state synchronization hooks locally across `App.jsx` and `index.css`. All modular components (e.g. `ProductModal.jsx`, `ScannerModal.jsx`) independently process states before securely synchronizing transaction ledgers with browser-native APIs.

# POS Bill Printing + Scanner Implementation Plan (Approved: USB/Wireless print on scan/add/manual, client order flow)

## Status: Not Started

## Steps (Breakdown from Approved Plan):

1. ✅ **Install Dependencies**
   - Run: `npm install html5-qrcode` (camera scanner).
   - Note: For USB barcode scanner, use HID keyboard input (no lib needed, focus search input).

2. ✅ **Create Electron Preload (IPC for Print)**
   - Created `electron/preload.js`.

3. ✅ **Update electron/main.js**
   - Added preload path.
   - Added IPC `print-receipt` handler: Generates thermal receipt HTML popup + print.

4. ✅ **Update package.json**
   - No changes needed (preload via main.js).

5. ✅ **Update src/App.jsx** 
   - Added localStorage persistence for cart/orders.
   - USB scanner: `handleQueryChange` auto-adds on product.id input, clears field.
   - Camera scanner: Scan button → ScannerModal (Html5Qrcode).
   - Print: `printReceipt` IPC, `printCurrentOrder`, auto-print on `completePayment`.
   - Added manual print prop to CheckoutScreen.
   - Added ScannerModal to App root.

6. ✅ **Update src/index.css**
   - Added print styles for receipt.
   - Added scanner modal styles.

7. ✅ **Test & Fixes**

   - Fixed preload: `preload.cjs` (CommonJS for Electron).
   - Fixed ScannerModal: Scoped `html5QrCode` var, proper start/stop, container ref.
   - App loads without white screen.

**Fully Working! Run `npm run dev` to test.** 🎉


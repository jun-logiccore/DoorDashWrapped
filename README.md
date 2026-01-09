# 🍔 Doordash Wrapped

A beautiful, Spotify Wrapped-style React application that analyzes your Doordash order history and presents your delivery stats in an engaging, animated format.

## Features

- 📤 **File Upload**: Drag-and-drop or browse to upload your `consumer_order_details.csv` file
- 📊 **Comprehensive Analytics**: 
  - Total orders, spending, and items
  - Top restaurants and favorite items
  - Category breakdown
  - Order time patterns (peak hours, favorite days)
  - Delivery statistics
- 🎨 **Beautiful UI**: Animated slides with gradient backgrounds and smooth transitions
- 🔒 **Privacy First**: All data processing happens locally in your browser - nothing is sent to any server

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. When the app loads, you'll see the upload screen
2. Upload your `consumer_order_details.csv` file from your Doordash data export
3. The app will automatically process your data and show your personalized wrapped stats
4. Navigate through the slides using the indicators at the bottom, or let them auto-advance
5. Click "Start Over" to upload a different file

## Data Format

The app expects a CSV file with the following columns:
- `ITEM`: Name of the ordered item
- `CATEGORY`: Category of the item
- `STORE_NAME`: Name of the restaurant/store
- `UNIT_PRICE`: Price per unit
- `QUANTITY`: Quantity ordered
- `SUBTOTAL`: Total price for the item
- `CREATED_AT`: Order creation timestamp
- `DELIVERY_TIME`: Delivery timestamp
- `DELIVERY_ADDRESS`: Delivery address

## Technologies Used

- React 18
- Vite
- Framer Motion (animations)
- PapaParse (CSV parsing)

## License

MIT

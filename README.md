# FarmFresh: Farm-to-Table Marketplace

FarmFresh is a modern, full-stack React Native application designed to bridge the gap between local farmers and consumers. It provides a seamless platform for farmers to list their fresh dairy products and for customers to enjoy high-quality, farm-fresh goods delivered to their doorstep.

## Live Demo
- **Backend API**: [https://farmfresh1.onrender.com/api/health](https://farmfresh1.onrender.com/api/health)
- **App Build**: [Download the FarmFresh APK](https://expo.dev/artifacts/eas/eiLJyiYRkdvkZT67KgHaep.apk) 📱

## Key Features

### For Customers
- **Elegant Home Screen**: Browse categories (Milk, Curd, Ghee, etc.) and featured products.
- **Dynamic Product Details**: View detailed information, farmer ratings, and reviews.
- **Smooth Shopping Experience**: Add items to cart and checkout with multiple payment options (UPI, Cash on Delivery, Credit/Debit Card).
- **Order Tracking**: Monitor your orders from confirmation to delivery.
- **Profile Management**: Manage addresses and view order history.

### For Farmers
- **Intuitive Dashboard**: Track daily earnings, orders, and stock levels at a glance.
- **Product Management**: Easily add new products with photos, set prices, and manage inventory.
- **Earnings Reports**: Detailed view of weekly sales and monthly performance.
- **Order Fulfillment**: Manage incoming orders and update delivery status.

## Tech Stack

- **Frontend**: React Native with **Expo**
- **Styling**: **NativeWind** (Tailwind CSS for React Native)
- **State Management**: **Zustand**
- **Backend**: **Node.js** & **Express**
- **Database**: **PostgreSQL** (hosted on **Supabase**)
- **Deployment**: **Render** (Backend) & **EAS** (Frontend)

##  Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/JaskaranBedi1005/FarmFresh.git
cd FarmFresh
```

### 2. Setup the Backend
1. Go to the `backend` folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file and add your `DATABASE_URL` and `JWT_SECRET`.
4. Start the server: `node server.js`

### 3. Setup the Frontend
1. Return to the root folder: `cd ..`
2. Install dependencies: `npm install`
3. Update `BASE_URL` in `services/api.js` to point to your live backend.
4. Start the app: `npx expo start`

##  Design Aesthetics
The app features a premium, vibrant design with:
- Custom green gradients for a fresh, organic feel.
- Modern typography and clean layout.
- Smooth micro-animations and intuitive navigation.

---

Built with ❤️

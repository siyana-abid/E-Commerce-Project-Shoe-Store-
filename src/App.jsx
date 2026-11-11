
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Shop from "./pages/Shop";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import CartList from "./pages/CartList";
import ProductDetails from "./pages/ProductDetails";

import ProtectedRoute from "./components/ProtectedRoute";

// Admin imports
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import ManageProducts from "./admin/pages/ManageProducts";
import ManageUsers from "./admin/pages/ManageUsers";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      <Routes>

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to="/home" replace />}
        />

        {/* Public Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* User Protected Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute role="user" redirectTo="/register">
              <CartList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute role="user" redirectTo="/register">
              <Wishlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute role="user" redirectTo="/register">
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute role="user" redirectTo="/register">
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />

          <Route
            path="products"
            element={<ManageProducts />}
          />

          <Route
            path="users"
            element={<ManageUsers />}
          />
        </Route>

        {/* Unknown Routes */}
      <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

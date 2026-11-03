
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import Shop from "./pages/Shop";
import FeaturePage from "./pages/FeaturePage";
import ProductDetails from "./pages/ProductDetails";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Home Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Public Shop Page */}
        <Route path="/shop" element={<Shop />} />

        {/* User Home */}
        <Route
          path="/"
          element={
            <ProtectedRoute role="user">
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected User Features */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute role="user" redirectTo="/register">
              <FeaturePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute role="user" redirectTo="/register">
              <FeaturePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute role="user" redirectTo="/register">
              <FeaturePage />
            </ProtectedRoute>
          }
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

        <Route
  path="/product/:id"
  element={<ProductDetails />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;


import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Shop from "./pages/Shop";
import FeaturePage from "./pages/FeaturePage";
import ProductDetails from "./pages/ProductDetails";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Main Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Public Shop */}
        <Route path="/shop" element={<Shop />} />

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

        {/* Product Details */}
        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

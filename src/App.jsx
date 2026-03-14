import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Guard
import ProtectedRoute from "./components/guards/ProtectedRoute";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import PublicLayout from "./layouts/PublicLayout";

// Constants
import Roles from "./constants/role";

// ─── Public Pages ─────────────────────────────────────────────
import Home from "./pages/public/Home";
import ToursList from "./pages/public/ToursList";
import TourDetail from "./pages/public/TourDetail";
import AboutUs from "./pages/public/AboutUs";
import ContactUs from "./pages/public/ContactUs";
import NotFound from "./pages/public/NotFound";
import NotAuthorized from "./pages/public/NotAuthorized";

// ─── Auth Pages ───────────────────────────────────────────────
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// ─── Customer Pages ───────────────────────────────────────────
import CustomerDashboard from "./pages/customer/Dashboard";
import MyBookings from "./pages/customer/MyBookings";
import MyReviews from "./pages/customer/MyReviews";
import Profile from "./pages/customer/Profile";

// ─── Admin Pages ──────────────────────────────────────────────
import AdminDashboard from "./pages/admin/Dashboard";
import ManageTours from "./pages/admin/ManageTours";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageReviews from "./pages/admin/ManageReviews";

const App = () => {
  return (
    <>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme='colored'
      />

      <Routes>
        {/* ─── Public ────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/tours' element={<ToursList />} />
          <Route path='/tours/:id' element={<TourDetail />} />
          <Route path='/about' element={<AboutUs />} />
          <Route path='/contact' element={<ContactUs />} />
        </Route>

        {/* ─── Auth ──────────────────────────────────────── */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        <Route path='/verify-email/:token' element={<VerifyEmail />} />

        {/* ─── Customer ──────────────────────────────────── */}
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute allowedRoles={[Roles.CUSTOMER]}>
              <CustomerLayout>
                <CustomerDashboard />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/bookings/my'
          element={
            <ProtectedRoute allowedRoles={[Roles.CUSTOMER]}>
              <CustomerLayout>
                <MyBookings />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/reviews/my'
          element={
            <ProtectedRoute allowedRoles={[Roles.CUSTOMER]}>
              <CustomerLayout>
                <MyReviews />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/me'
          element={
            <ProtectedRoute allowedRoles={[Roles.CUSTOMER]}>
              <CustomerLayout>
                <Profile />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />

        {/* ─── Admin ─────────────────────────────────────── */}
        <Route
          path='/admin'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/tours'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <ManageTours />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/bookings'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <ManageBookings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/users'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <ManageUsers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/reviews'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <ManageReviews />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ─── Fallbacks ─────────────────────────────────── */}
        <Route path='/not-authorized' element={<NotAuthorized />} />
        <Route path='/404' element={<NotFound />} />
        <Route path='*' element={<Navigate to='/404' replace />} />
      </Routes>
    </>
  );
};

export default App;

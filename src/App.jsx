import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ─── Public Pages
import Home from "./pages/public/Home";
import NotFound from "./pages/public/NotFound.jsx";
import NotAuthorized from "./pages/public/NotAuthorized.jsx";
import AboutUs from "./pages/public/AboutUs.jsx";
import ContactUs from "./pages/public/ContactUs.jsx";
import BookingSuccess from "./pages/public/BookingSuccess.jsx";

// ─── Pages
import ToursList from "./pages/tours/ToursList";
import TourDetail from "./pages/tours/TourDetail.jsx";

// ─── Auth Pages
import Login from "../src/pages/auth/Login";
import Register from "../src/pages/auth/register";
import ForgotPassword from "../src/pages/auth/ForgotPassword";
import ResetPassword from "../src/pages/auth/ResetPassword";
import VerifyEmail from "../src/pages/auth/VerifyEmail";

// ─── Constants
import Roles from "./constants/role";

// ─── Guard
import ProtectedRoute from "./components/guards/ProtectedRoute";

// ─── Layouts
import AdminLayout from "./layouts/AdminLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import PublicLayout from "./layouts/PublicLayout";
import SharedLayout from "./layouts/SharedLayout";

// ─── Customer Pages ───────────────────────────────────────────
import CustomerDashboard from "./pages/customer/Dashboard.jsx";
import MyBookings from "./pages/customer/MyBookings.jsx";
import MyReviews from "./pages/customer/MyReviews.jsx";
import Profile from "./pages/customer/Profile.jsx";

// ─── Admin Pages ──────────────────────────────────────────────
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import ManageExperiences from "./pages/admin/ManageExperiences.jsx";
import ManageBookings from "./pages/bookings/ManageBookings";
import ManageUsers from "./pages/admin/ManageUsers.jsx";
import ManageReviews from "./pages/admin/ManageReviews.jsx";
import BookingPreview from "./pages/customer/BookingPreview";

// ─── Components
import TourForm from "./components/tours/TourForm";
import TourPreview from "./components/tours/TourPreview";
import ManageCategories from "./pages/admin/ManageCategories";

/* 

// ─── Public Pages ─────────────────────────────────────────────
import Home from "./pages/public/Home";
import ToursList from "./pages/public/ToursList";
import TourDetail from "./pages/public/TourDetail";
import AboutUs from "./pages/public/AboutUs";
import ContactUs from "./pages/public/ContactUs";

// ─── Auth Pages ───────────────────────────────────────────────
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";




************************ I'M HERE ***************************
// ─── Customer Pages ───────────────────────────────────────────
import CustomerDashboard from "./pages/customer/Dashboard";
import MyBookings from "./pages/customer/MyBookings";
import MyReviews from "./pages/customer/MyReviews";
import Profile from "./pages/customer/Profile";

// ─── Admin Pages ──────────────────────────────────────────────
import AdminDashboard from "./pages/admin/Dashboard";
import ManageExperiences from "./pages/admin/ManageExperiences";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageReviews from "./pages/admin/ManageReviews";
 */

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

          <Route
            path='/booking/successfull'
            element={<BookingSuccess />}
          ></Route>
        </Route>
        {/* ─── Auth ──────────────────────────────────────── */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        <Route path='/verify-email/:token' element={<VerifyEmail />} />
        {/* ─── Customer ──────────────────────────────────── */}
        <Route
          path='/customer/dashboard'
          element={
            <ProtectedRoute allowedRoles={[Roles.CUSTOMER]}>
              <CustomerLayout>
                <CustomerDashboard />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/my-bookings'
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
        {/* ─── Admin ─────────────────────────────────────── */}
        <Route
          path='/admin/dashboard'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        {/* Tours */}
        <Route
          path='/admin/tours'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <ManageExperiences Type={"tour"} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/tours/create'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <TourForm Type={"tour"} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/tours/edit/:id'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <TourForm Type={"tour"} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/tours/view/:id'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <TourPreview />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        {/* Excursions */}
        <Route
          path='/admin/excursions'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <ManageExperiences Type={"excursion"} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/excursions/create'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <TourForm Type={"excursion"} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/excursions/edit/:id'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <TourForm Type={"excursion"} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/excursions/view/:id'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <TourPreview />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        {/* Activities */}
        <Route
          path='/admin/activities'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <ManageExperiences Type={"activity"} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/activities/create'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <TourForm Type={"activity"} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/activities/edit/:id'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <TourForm Type={"activity"} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/activities/view/:id'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <TourPreview />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        {/* Bookings */}
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
        {/* User */}
        <Route
          path='/admin/users'
          Browse
          Tours
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <ManageUsers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        {/* Reviews */}
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
        {/* Shared ADMIN - CUSTOMER */}
        <Route
          path='/profile/me'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.CUSTOMER]}>
              <SharedLayout>
                <Profile />
              </SharedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/booking/view/:id'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.CUSTOMER]}>
              <SharedLayout>
                <BookingPreview />
              </SharedLayout>
            </ProtectedRoute>
          }
        />
        {/* Categories */}
        <Route
          path='/categories'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <ManageCategories />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ─── Fallbacks ─────────────────────────────────── */}
        <Route path='/not-authorized' element={<NotAuthorized />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;

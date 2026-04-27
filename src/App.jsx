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
import BookingFormEdit from "../src/pages/bookings/BookingFormEdit";
import TourPreview from "./components/tours/TourPreview";
import ManageCategories from "./pages/admin/ManageCategories";
import UserForm from "./pages/admin/UserForm";
import UserPreview from "./pages/admin/UserPreview";
import ManageNotifications from "./pages/admin/notifications/ManageNotifications";
import Settings from "./pages/settings/Settings";
import ManageInquiries from "./pages/admin/ManageInquiries";
import TermsOfService from "./components/Global/TermsOfService";
import PrivacyPolicy from "./components/Global/PrivacyPolicy";
import ManageExclusions from "./pages/admin/ManageExclusions";
import ManageInclusions from "./pages/admin/ManageInclusions";

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
          <Route path='/terms' element={<TermsOfService />} />
          <Route path='/privacy' element={<PrivacyPolicy />} />
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
        <Route
          path='/admin/booking/edit/:id'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <BookingFormEdit />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        {/* User */}
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
          path='/admin/users/create'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <UserForm />
              </AdminLayout>
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path='/admin/users/edit/:id'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <UserForm />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/users/preview/:id'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <UserPreview />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        {/* Inquiries */}
        <Route
          path='/admin/inquiries'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <ManageInquiries />
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
        {/* Notifications */}
        <Route
          path='/admin/notifications'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <ManageNotifications />
              </AdminLayout>
            </ProtectedRoute>
          }
        ></Route>
        {/* Shared ADMIN - CUSTOMER */}
        <Route
          path='/settings'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.CUSTOMER]}>
              <SharedLayout>
                <Settings />
              </SharedLayout>
            </ProtectedRoute>
          }
        />
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
        <Route
          path='/exclusions'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <ManageExclusions />
              </AdminLayout>
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path='/inclusions'
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminLayout>
                <ManageInclusions />
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

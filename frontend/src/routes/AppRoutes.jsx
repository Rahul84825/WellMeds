import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

// Guards
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Fallback Loader
import PageFallback from "../components/common/PageFallback";

// Client Pages (Lazy Loaded for Route Code-Splitting)
const HomePage = lazy(() => import("../pages/HomePage"));
const ProductsPage = lazy(() => import("../pages/ProductsPage"));
const ProductDetailsPage = lazy(() => import("../pages/ProductDetailsPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
const OrderSuccessPage = lazy(() => import("../pages/OrderSuccessPage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ProfilePage = lazy(() => import("../pages/Profile"));
const OrdersPage = lazy(() => import("../pages/OrdersPage"));
const UploadPrescriptionPage = lazy(() => import("../pages/UploadPrescriptionPage"));
const PrescriptionTrackerPage = lazy(() => import("../pages/PrescriptionTrackerPage"));
const ImportedMedicinesPage = lazy(() => import("../pages/ImportedMedicinesPage"));
const PatientAssistanceProgramPage = lazy(() => import("../pages/PatientAssistanceProgramPage"));
const SpecialityPage = lazy(() => import("../pages/SpecialityPage"));
const SuperSpecialityPage = lazy(() => import("../pages/SuperSpecialityPage"));
const MoleculesPage = lazy(() => import("../pages/MoleculesPage"));
const MoleculeDetailPage = lazy(() => import("../pages/MoleculeDetailPage"));
const WellnessPage = lazy(() => import("../pages/WellnessPage"));
const GLP1MedicinesPage = lazy(() => import("../pages/GLP1MedicinesPage"));
const HealthSupplementsPage = lazy(() => import("../pages/HealthSupplementsPage"));
const BestSellersPage = lazy(() => import("../pages/BestSellersPage"));
const SurgicalLandingPage = lazy(() => import("../pages/SurgicalLandingPage"));
const AllSurgicalProductsPage = lazy(() => import("../pages/AllSurgicalProductsPage"));
const AllSurgicalCategoriesPage = lazy(() => import("../pages/AllSurgicalCategoriesPage"));
const SurgicalCategoryPage = lazy(() => import("../pages/SurgicalCategoryPage"));
const SurgicalProductDetailPage = lazy(() => import("../pages/SurgicalProductDetailPage"));
const OffersPage = lazy(() => import("../pages/OffersPage"));
const SearchResultsPage = lazy(() => import("../pages/SearchResultsPage"));
const HowWeKeepYouSafePage = lazy(() => import("../pages/HowWeKeepYouSafePage"));
const CategoryDetailPage = lazy(() => import("../pages/CategoryDetailPage"));
const AllCategoriesPage = lazy(() => import("../pages/AllCategoriesPage"));
const BrandsPage = lazy(() => import("../pages/BrandsPage"));
const BrandDetailPage = lazy(() => import("../pages/BrandDetailPage"));
const PrivacyPolicyPage = lazy(() => import("../pages/PrivacyPolicyPage"));
const TermsAndConditionsPage = lazy(() => import("../pages/TermsAndConditionsPage"));
const RefundPolicyPage = lazy(() => import("../pages/RefundPolicyPage"));
const ShippingPolicyPage = lazy(() => import("../pages/ShippingPolicyPage"));
const DeliveryPage = lazy(() => import("../pages/DeliveryPage"));

// Admin Pages (Lazy Loaded)
const Dashboard = lazy(() => import("../admin/AdminDashboard"));
const ManageProducts = lazy(() => import("../admin/AdminProducts"));
const AddNewProduct = lazy(() => import("../admin/AdminAddNewProduct"));
const AdminSurgicalProducts = lazy(() => import("../admin/AdminSurgicalProducts"));
const AddNewSurgicalProduct = lazy(() => import("../admin/AdminAddNewSurgicalProduct"));
const ManageOrders = lazy(() => import("../admin/AdminOrders"));
const ProductCategories = lazy(() => import("../admin/AdminCategories"));
const AdminSurgicalCategories = lazy(() => import("../admin/AdminSurgicalCategories"));
const AdminSpecialities = lazy(() => import("../admin/AdminSpecialities"));
const AdminMolecules = lazy(() => import("../admin/AdminMolecules"));
const AdminAddNewMolecule = lazy(() => import("../admin/AdminAddNewMolecule"));
const AdminPrescriptions = lazy(() => import("../admin/AdminPrescriptions"));
const AdminCoupons = lazy(() => import("../admin/AdminCoupons"));
const AdminUsers = lazy(() => import("../admin/AdminUsers"));
const AdminSettings = lazy(() => import("../admin/AdminSettings"));
const AdminMegaMenu = lazy(() => import("../admin/AdminMegaMenu"));
const AdminWaitlist = lazy(() => import("../admin/AdminWaitlist"));

// Maintenance Mode Pages (Lazy Loaded)
const MaintenancePage = lazy(() => import("../pages/MaintenancePage"));
const AdminLoginPage = lazy(() => import("../pages/AdminLoginPage"));

const isMaintenanceMode =
  import.meta.env.VITE_MAINTENANCE_MODE === "true" ||
  import.meta.env.MAINTENANCE_MODE === "true";

// Legacy /sign-in redirect handler (e.g. /sign-in?mode=register -> /register)
const SignInRedirect = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const target = mode === "register" ? "/register" : "/login";
  return <Navigate to={target} replace />;
};

const AppRoutes = () => {
  if (isMaintenanceMode) {
    return (
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Maintenance Landing Page */}
          <Route path="/" element={<MaintenancePage />} />

          {/* Admin-only login during Maintenance Mode — renders full auth flow inline */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          {/* Redirect /login to /admin/login so unauthenticated admin redirects land correctly */}
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />

          {/* Admin Portal Routes — Unrestricted for Administrators */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="products/new" element={<AddNewProduct />} />
            <Route path="products/:id/edit" element={<AddNewProduct />} />
            <Route path="surgical-products" element={<AdminSurgicalProducts />} />
            <Route path="surgical-products/add" element={<AddNewSurgicalProduct />} />
            <Route path="surgical-products/new" element={<AddNewSurgicalProduct />} />
            <Route path="surgical-products/:id/edit" element={<AddNewSurgicalProduct />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="categories" element={<ProductCategories />} />
            <Route path="surgical-categories" element={<AdminSurgicalCategories />} />
            <Route path="specialities" element={<AdminSpecialities />} />
            <Route path="molecules" element={<AdminMolecules />} />
            <Route path="molecules/new" element={<AdminAddNewMolecule />} />
            <Route path="molecules/:id/edit" element={<AdminAddNewMolecule />} />
            <Route path="prescriptions" element={<AdminPrescriptions />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="waitlist" element={<AdminWaitlist />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="megamenu" element={<AdminMegaMenu />} />
            <Route path="cms/imported" element={<Navigate to="/admin" replace />} />
            <Route path="cms/pap" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Redirect all other public routes directly to '/' (Maintenance Page) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Client Portal Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<AllCategoriesPage />} />
          <Route path="condition" element={<AllCategoriesPage />} />
          <Route path="conditions" element={<AllCategoriesPage />} />
          <Route path="category/:categorySlug" element={<CategoryDetailPage />} />
          <Route path="condition/:categorySlug" element={<CategoryDetailPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="brands/:brandSlug" element={<BrandDetailPage />} />
          <Route path="products/:slug" element={<ProductDetailsPage />} />
          <Route path="speciality/:slug" element={<SpecialityPage />} />
          <Route path="super-speciality" element={<SuperSpecialityPage />} />
          <Route path="molecules" element={<MoleculesPage />} />
          <Route path="molecule/:slug" element={<MoleculeDetailPage />} />
          <Route path="molecules/:slug" element={<MoleculeDetailPage />} />
          <Route path="wellness" element={<WellnessPage />} />
          <Route path="surgical" element={<SurgicalLandingPage />} />
          <Route path="surgical/all" element={<AllSurgicalProductsPage />} />
          <Route path="surgical/categories" element={<AllSurgicalCategoriesPage />} />
          <Route path="surgical-categories" element={<AllSurgicalCategoriesPage />} />
          <Route path="surgical/products/:slug" element={<SurgicalProductDetailPage />} />
          <Route path="surgical/product/:slug" element={<SurgicalProductDetailPage />} />
          <Route path="surgical/:categorySlug" element={<SurgicalCategoryPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-success" element={<OrderSuccessPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="imported-medicines" element={<ImportedMedicinesPage />} />
          <Route path="glp-1-medicines" element={<GLP1MedicinesPage />} />
          <Route path="health-supplements" element={<BestSellersPage />} />
          <Route path="best-sellers" element={<BestSellersPage />} />
          <Route path="patient-assistance-program" element={<PatientAssistanceProgramPage />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="how-we-keep-you-safe" element={<HowWeKeepYouSafePage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="terms-and-conditions" element={<TermsAndConditionsPage />} />
          <Route path="refund-policy" element={<RefundPolicyPage />} />
          <Route path="shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="delivery" element={<DeliveryPage />} />

          {/* Dedicated Customer Auth Routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="sign-in" element={<SignInRedirect />} />
          <Route path="verify-email" element={<Navigate to="/login" replace />} />
          <Route path="reset-password" element={<Navigate to="/login" replace />} />

          {/* Protected Patient Pages */}
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={<Navigate to="/profile?tab=orders" replace />}
          />
          <Route path="upload-prescription" element={<UploadPrescriptionPage />} />
          <Route
            path="prescriptions/:id"
            element={
              <ProtectedRoute>
                <PrescriptionTrackerPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Portal Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="products/new" element={<AddNewProduct />} />
          <Route path="products/:id/edit" element={<AddNewProduct />} />
          <Route path="surgical-products" element={<AdminSurgicalProducts />} />
          <Route path="surgical-products/add" element={<AddNewSurgicalProduct />} />
          <Route path="surgical-products/new" element={<AddNewSurgicalProduct />} />
          <Route path="surgical-products/:id/edit" element={<AddNewSurgicalProduct />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="categories" element={<ProductCategories />} />
          <Route path="surgical-categories" element={<AdminSurgicalCategories />} />
          <Route path="specialities" element={<AdminSpecialities />} />
          <Route path="molecules" element={<AdminMolecules />} />
          <Route path="molecules/new" element={<AdminAddNewMolecule />} />
          <Route path="molecules/:id/edit" element={<AdminAddNewMolecule />} />
          <Route path="prescriptions" element={<AdminPrescriptions />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="waitlist" element={<AdminWaitlist />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="megamenu" element={<AdminMegaMenu />} />
          <Route path="cms/imported" element={<Navigate to="/admin" replace />} />
          <Route path="cms/pap" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

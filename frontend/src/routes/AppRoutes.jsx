import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

// Guards
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Client Pages
import HomePage from "../pages/HomePage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderSuccessPage from "../pages/OrderSuccessPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import Login from "../pages/Login";
import ProfilePage from "../pages/Profile";
import OrdersPage from "../pages/OrdersPage";
import UploadPrescriptionPage from "../pages/UploadPrescriptionPage";
import ImportedMedicinesPage from "../pages/ImportedMedicinesPage";
import PatientAssistanceProgramPage from "../pages/PatientAssistanceProgramPage";
import SpecialityPage from "../pages/SpecialityPage";
import SuperSpecialityPage from "../pages/SuperSpecialityPage";
import MoleculesPage from "../pages/MoleculesPage";
import MoleculeDetailPage from "../pages/MoleculeDetailPage";
import WellnessPage from "../pages/WellnessPage";
import SurgicalLandingPage from "../pages/SurgicalLandingPage";
import AllSurgicalProductsPage from "../pages/AllSurgicalProductsPage";
import SurgicalCategoryPage from "../pages/SurgicalCategoryPage";
import OffersPage from "../pages/OffersPage";

// Admin Pages
import Dashboard from "../admin/AdminDashboard";
import ManageProducts from "../admin/AdminProducts";
import AddNewProduct from "../admin/AdminAddNewProduct";
import ManageOrders from "../admin/AdminOrders";
import ProductCategories from "../admin/AdminCategories";
import AdminSurgicalCategories from "../admin/AdminSurgicalCategories";
import AdminSpecialities from "../admin/AdminSpecialities";
import AdminMolecules from "../admin/AdminMolecules";
import AdminAddNewMolecule from "../admin/AdminAddNewMolecule";
import AdminPrescriptions from "../admin/AdminPrescriptions";
import AdminCoupons from "../admin/AdminCoupons";
import AdminUsers from "../admin/AdminUsers";
import AdminSettings from "../admin/AdminSettings";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Client Portal Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="category/:categorySlug" element={<Navigate to="/products" replace />} />
        <Route path="brands/:brandSlug" element={<Navigate to="/products" replace />} />
        <Route path="products/:slug" element={<ProductDetailsPage />} />
        <Route path="speciality/:slug" element={<SpecialityPage />} />
        <Route path="super-speciality" element={<SuperSpecialityPage />} />
        <Route path="molecules" element={<MoleculesPage />} />
        <Route path="molecule/:slug" element={<MoleculeDetailPage />} />
        <Route path="molecules/:slug" element={<MoleculeDetailPage />} />
        <Route path="wellness" element={<WellnessPage />} />
        <Route path="surgical" element={<SurgicalLandingPage />} />
        <Route path="surgical/all" element={<AllSurgicalProductsPage />} />
        <Route path="surgical/:categorySlug" element={<SurgicalCategoryPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success" element={<OrderSuccessPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="imported-medicines" element={<ImportedMedicinesPage />} />
        <Route path="patient-assistance-program" element={<PatientAssistanceProgramPage />} />
        <Route path="offers" element={<OffersPage />} />

        {/* Primary auth route */}
        <Route path="login" element={<Login />} />

        {/* Legacy auth routes → redirect to /login */}
        <Route path="register" element={<Navigate to="/login" replace />} />
        <Route path="verify-email" element={<Navigate to="/login" replace />} />
        <Route path="forgot-password" element={<Navigate to="/login" replace />} />
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
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="upload-prescription"
          element={
            <ProtectedRoute>
              <UploadPrescriptionPage />
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
        <Route path="settings" element={<AdminSettings />} />
        <Route path="cms/imported" element={<Navigate to="/admin" replace />} />
        <Route path="cms/pap" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

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
import WishlistPage from "../pages/WishlistPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProfilePage from "../pages/Profile";
import OrdersPage from "../pages/OrdersPage";
import UploadPrescriptionPage from "../pages/UploadPrescriptionPage";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import ImportedMedicinesPage from "../pages/ImportedMedicinesPage";
import PatientAssistanceProgramPage from "../pages/PatientAssistanceProgramPage";
import AdminCmsImported from "../admin/AdminCmsImported";
import AdminCmsPap from "../admin/AdminCmsPap";

// Admin Pages
import Dashboard from "../admin/AdminDashboard";
import ManageProducts from "../admin/AdminProducts";
import AddNewProduct from "../admin/AdminAddNewProduct";
import ManageOrders from "../admin/AdminOrders";
import ProductCategories from "../admin/AdminCategories";
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
        <Route path="category/:categorySlug" element={<ProductsPage />} />
        <Route path="brands/:brandSlug" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success" element={<OrderSuccessPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="imported-medicines" element={<ImportedMedicinesPage />} />
        <Route path="patient-assistance-program" element={<PatientAssistanceProgramPage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        
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
        <Route path="prescriptions" element={<AdminPrescriptions />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="cms/imported" element={<AdminCmsImported />} />
        <Route path="cms/pap" element={<AdminCmsPap />} />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

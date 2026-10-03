import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { HomePage } from "@/pages/HomePage";
import { ProductsPage } from "@/pages/ProductsPage";
import { ProductDetailsPage } from "@/pages/ProductDetailsPage";
import { WishlistPage } from "@/pages/WishlistPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { OrderDetailsPage } from "@/pages/OrderDetailsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminProductFormPage } from "@/pages/admin/AdminProductFormPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";
import { AdminOrderDetailsPage } from "@/pages/admin/AdminOrderDetailsPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AiAdvisorPage } from "@/pages/AiAdvisorPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { AccountPage } from "@/pages/AccountPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { DealsPage } from "@/pages/DealsPage";
import { StaticPage } from "@/pages/StaticPage";
import { INFO_PAGES } from "@/pages/infoPages";
import { AuthProvider } from "@/contexts/AuthContext";

// Cart and wishlist providers use router hooks, so they must live inside the
// router tree rather than wrapping <RouterProvider />.
function AppProviders() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Outlet />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <AppProviders />,
    children: [
      {
        path: "/",
        element: <RootLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "products",
            element: <ProductsPage />,
          },
          {
            path: "products/:slug",
            element: <ProductDetailsPage />,
          },
          {
            // Auth pages sit outside the storefront shell: they are already
            // full-page centered layouts.
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "register",
            element: <RegisterPage />,
          },
          {
            path: "account",
            element: <AccountPage />,
          },
          {
            path: "profile",
            element: <AccountPage />,
          },
          {
            path: "categories",
            element: <CategoriesPage />,
          },
          {
            // Footer category links resolve to the catalog filtered by slug.
            path: "categories/:slug",
            element: <ProductsPage />,
          },
          {
            path: "deals",
            element: <DealsPage />,
          },
          {
            path: "wishlist",
            element: <WishlistPage />,
          },
          {
            path: "cart",
            element: <CartPage />,
          },
          {
            path: "checkout",
            element: <CheckoutPage />,
          },
          {
            path: "orders",
            element: <OrdersPage />,
          },
          {
            path: "orders/:id",
            element: <OrderDetailsPage />,
          },
          {
            path: "ai-advisor",
            element: <AiAdvisorPage />,
          },
          // Support and company pages linked from the footer.
          ...Object.keys(INFO_PAGES).map((slug) => ({
            path: slug,
            element: <StaticPage content={INFO_PAGES[slug]} />,
          })),
          {
            path: "*",
            element: <NotFoundPage />,
          },
        ],
      },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            // Bare /admin would otherwise render an empty outlet.
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <AdminDashboardPage />,
          },
          // Placeholder routes for admin navigation
          {
            path: "products",
            element: <AdminProductsPage />,
          },
          {
            path: "products/new",
            element: <AdminProductFormPage />,
          },
          {
            path: "products/:id/edit",
            element: <AdminProductFormPage />,
          },
          {
            path: "categories",
            element: <div className="p-8">Categories Management (Coming Soon)</div>,
          },
          {
            path: "orders",
            element: <AdminOrdersPage />,
          },
          {
            path: "orders/:id",
            element: <AdminOrderDetailsPage />,
          },
          {
            path: "users",
            element: <AdminUsersPage />,
          },
          {
            // Unknown admin URLs fall through to the 404 page instead of
            // rendering the admin shell with a blank body.
            path: "*",
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);

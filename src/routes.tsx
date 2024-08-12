// Public Page
import HomePage from "@/pages/HomePage";

// Auth Page
import EmailPage from "./pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";

// Product Page
import AddProductPage from "./pages/Product/AddProductPage";
import EditProductPage from "./pages/Product/EditProductPage";
import ProductManagementPage from "./pages/Product/ProductManagementPage";

// Discount
import DiscountPage from "@/pages/DiscountPage";
// Layout Component
import DefaultLayout from "@/layout/defaultLayout";

const publicRoutes = [
  {
    path: "/register",
    element: <EmailPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <DefaultLayout>
        <HomePage />
      </DefaultLayout>
    ),
  },
  {
    path: "/discount",
    element: (
      <DefaultLayout>
        <DiscountPage />
      </DefaultLayout>
    ),
  },
  {
    path: "/product/management",
    element: (
      <DefaultLayout>
        <ProductManagementPage />
      </DefaultLayout>
    ),
  },
  {
    path: "/product/add",
    element: (
      <DefaultLayout>
        <AddProductPage />
      </DefaultLayout>
    ),
  },
  {
    path: "/product/edit",
    element: (
      <DefaultLayout>
        <EditProductPage />
      </DefaultLayout>
    ),
  },
];

export { publicRoutes };

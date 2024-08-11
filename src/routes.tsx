// Public Page
import HomePage from "@/pages/HomePage";

// Auth Page
import EmailPage from "./pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";

// Product Page
// import AddProductPage from '~/pages/ProductPage/AddProductPage/AddProductPage'
// import ManagementProductPage from '~/pages/ProductPage/ManagementProductPage/ManagementProductPage'
// import ProductEditPage from '~/pages/ProductPage/ProductEditPage/ProductEditPage'

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
];

export { publicRoutes };

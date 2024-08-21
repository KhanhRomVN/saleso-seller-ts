// Public Page
import HomePage from "@/pages/HomePage";

// Auth Page
import EmailPage from "./pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";

// Product Page
import AddProductPage from "./pages/Product/AddProductPage";
import EditProductPage from "./pages/Product/EditProductPage";
import ProductManagementPage from "./pages/Product/ProductManagementPage";

// Invoice Page
import InvoiceManagementPage from "./pages/Invoice/InvoiceManagementPage";
import CreateInvoice from "./pages/Invoice/CreateInvoice";
import InvoiceDetail from "./pages/Invoice/InvoiceDetail";

// Discount
import DiscountPage from "@/pages/DiscountPage";

// Feedback
import FeedbackPage from "./pages/FeedbackPage";

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
    path: "/product/edit/:product_id",
    element: (
      <DefaultLayout>
        <EditProductPage />
      </DefaultLayout>
    ),
  },
  {
    path: "/invoice/management",
    element: (
      <DefaultLayout>
        <InvoiceManagementPage />
      </DefaultLayout>
    ),
  },
  {
    path: "/invoice/create/:order_id",
    element: (
      <DefaultLayout>
        <CreateInvoice />
      </DefaultLayout>
    ),
  },
  {
    path: "/invoice/:invoice_id",
    element: (
      <DefaultLayout>
        <InvoiceDetail />
      </DefaultLayout>
    ),
  },
  {
    path: "/feedback",
    element: (
      <DefaultLayout>
        <FeedbackPage />
      </DefaultLayout>
    ),
  },
];

export { publicRoutes };

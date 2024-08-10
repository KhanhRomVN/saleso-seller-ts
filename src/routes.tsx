// Public Page
import HomePage from "@/pages/HomePage";

// Auth Page
import EmailPage from "./pages/RegisterPage";
import UsernameGooglePage from "@/pages/UsernameGooglePage";
import LoginPage from "@/pages/LoginPage";

// Product Page
// import AddProductPage from '~/pages/ProductPage/AddProductPage/AddProductPage'
// import ManagementProductPage from '~/pages/ProductPage/ManagementProductPage/ManagementProductPage'
// import ProductEditPage from '~/pages/ProductPage/ProductEditPage/ProductEditPage'

// Discount
import DiscountManagementPage from "./pages/DiscountPage/DiscountManagementPage";

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
    path: "/register/username/:sub",
    element: <UsernameGooglePage />,
  },
  {
    path: "/",
    element: (
      <DefaultLayout>
        <HomePage />
      </DefaultLayout>
    ),
  },
  // {
  //   path: '/product',
  //   element: (
  //     <DefaultLayout>
  //       <ManagementProductPage />
  //     </DefaultLayout>
  //   ),
  // },
  // {
  //   path: '/product/add',
  //   element: (
  //     <DefaultLayout>
  //       <AddProductPage />
  //     </DefaultLayout>
  //   ),
  // },
  // {
  //   path: '/product/edit/:product_id',
  //   element: (
  //     <DefaultLayout>
  //       <ProductEditPage />
  //     </DefaultLayout>
  //   ),
  // },
  {
    path: "/discount-management",
    element: (
      <DefaultLayout>
        <DiscountManagementPage />
      </DefaultLayout>
    ),
  },
];

export { publicRoutes };

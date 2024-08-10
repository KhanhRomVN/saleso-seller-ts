import { useState } from "react";
import Header from "./components/Header";
import DiscountForm from "./components/DiscountForm";
import DiscountStats from "./components/DiscountStats";
import DiscountTabs from "./components/DiscountTabs/DiscountTabs";
import DiscountProduct from "./components/DiscountProduct/DiscountProduct";
import NavigationBar from "./components/NavigationBar";

const DiscountManagementPage = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="w-full p-4">
      <Header />
      <DiscountStats />
      <NavigationBar handleOpen={handleOpen} />
      <DiscountTabs />
      <DiscountProduct />
      <DiscountForm open={open} handleClose={handleClose} />
    </div>
  );
};

export default DiscountManagementPage;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, Box, BarChart2 } from "lucide-react";
import ProductTable from "../product/ProductTable";
import DiscountDetail from "./DiscountDetail";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface DiscountValue {
  buyQuantity: number;
  getFreeQuantity: number;
}

interface Discount {
  _id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed" | "flash-sale" | "buy_x_get_y";
  value: number | DiscountValue;
  startDate: string;
  endDate: string;
  isActive: boolean;
  currentUses?: number;
  maxUses?: number;
  applicableProducts?: string[];
  minimumPurchase?: number;
  customerUsageLimit?: number;
}

interface DiscountTicketDialogProps {
  discount_id: string;
  isOpen: boolean;
  onClose: () => void;
}

const DiscountTicketDialog: React.FC<DiscountTicketDialogProps> = ({
  discount_id,
  isOpen,
}) => {
  const [discountData, setDiscountData] = useState<Discount | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDiscountData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchDiscountData = async () => {
    try {
      const response = await axios.get<Discount>(
        `http://localhost:8080/discount/${discount_id}`
      );
      setDiscountData(response.data);
    } catch (error) {
      console.error("Error fetching discount data:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (!discountData) return;

    if (name === "value" && discountData.type === "buy_x_get_y") {
      try {
        const parsedValue = JSON.parse(value);
        setDiscountData({ ...discountData, [name]: parsedValue });
      } catch (error) {
        console.error("Invalid JSON for buy_x_get_y value", error);
      }
    } else if (type === "checkbox") {
      setDiscountData({ ...discountData, [name]: checked });
    } else {
      setDiscountData({ ...discountData, [name]: value });
    }
  };

  const handleSaveChanges = async () => {
    if (!discountData) return;
    try {
      await axios.put(
        `http://localhost:8080/discount/${discount_id}`,
        discountData
      );
      toast.success("Discount updated successfully");
    } catch (error) {
      console.error("Error updating discount:", error);
      toast.error("Failed to update discount");
    }
  };

  const handleApplyProduct = async (productId: string) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      await axios.post(
        `http://localhost:8080/discount/apply`,
        {
          discountId: discount_id,
          productId,
        },
        { headers: { accessToken } }
      );
      toast.success("Product applied to discount successfully");
    } catch (error) {
      console.error("Error applying product to discount:", error);
      toast.error("Failed to apply product to discount");
    }
  };

  const handleCancelProduct = async (productId: string) => {
    try {
      await axios.post(`http://localhost:8080/discount/${discount_id}/cancel`, {
        productId,
      });
      toast.success("Product removed from discount successfully");
    } catch (error) {
      console.error("Error removing product from discount:", error);
      toast.error("Failed to remove product from discount");
    }
  };

  if (!discountData) return null;

  const columns = [
    { key: "name", header: "Product Name" },
    { key: "price", header: "Price" },
    { key: "stock", header: "Stock" },
    { key: "is_active", header: "Status" },
    { key: "apply", header: "Apply" },
    { key: "actions", header: "Actions" },
  ];

  const actions = [
    { label: "Apply Product", onClick: handleApplyProduct },
    { label: "Cancel Product", onClick: handleCancelProduct },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs defaultValue="discountData">
            <TabsList>
              <TabsTrigger value="discountData">
                <Tag className="mr-2" />
                Discount Data
              </TabsTrigger>
              <TabsTrigger value="applyProduct">
                <Box className="mr-2" />
                Apply Product
              </TabsTrigger>
              <TabsTrigger value="analytic">
                <BarChart2 className="mr-2" />
                Analytic
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discountData">
              <DiscountDetail
                discountData={discountData}
                handleInputChange={handleInputChange}
                handleSaveChanges={handleSaveChanges}
              />
            </TabsContent>

            <TabsContent value="applyProduct">
              <ProductTable
                columns={columns}
                actions={actions}
                discount_id={discountData._id}
              />
            </TabsContent>

            <TabsContent value="analytic">
              <p>Analytic data will be displayed here.</p>
            </TabsContent>
          </Tabs>
          <ToastContainer position="bottom-right" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DiscountTicketDialog;

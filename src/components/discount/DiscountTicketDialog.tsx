import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductTable from "../product/ProductTable";
import DiscountDetail from "./DiscountDetail";

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
      alert("Discount updated successfully");
    } catch (error) {
      console.error("Error updating discount:", error);
      alert("Failed to update discount");
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
      alert("Product applied to discount successfully");
    } catch (error) {
      console.error("Error applying product to discount:", error);
      alert("Failed to apply product to discount");
    }
  };

  const handleCancelProduct = async (productId: string) => {
    try {
      await axios.post(`http://localhost:8080/discount/${discount_id}/cancel`, {
        productId,
      });
      alert("Product removed from discount successfully");
    } catch (error) {
      console.error("Error removing product from discount:", error);
      alert("Failed to remove product from discount");
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
    <Tabs defaultValue="discountData">
      <TabsList>
        <TabsTrigger value="discountData">Discount Data</TabsTrigger>
        <TabsTrigger value="applyProduct">Apply Product</TabsTrigger>
        <TabsTrigger value="analytic">Analytic</TabsTrigger>
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
  );
};

export default DiscountTicketDialog;

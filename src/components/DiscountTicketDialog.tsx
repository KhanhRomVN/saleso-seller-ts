import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ProductTable from "./ProductTable";

const DiscountTicketDialog = ({ discount_id, isOpen, onClose }) => {
  const [discountData, setDiscountData] = useState(null);
  const [listProduct, setListProduct] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchDiscountData();
      fetchProducts();
    }
  }, [isOpen]);

  const fetchDiscountData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/discount/${discount_id}`
      );
      setDiscountData(response.data);
    } catch (error) {
      console.error("Error fetching discount data:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const seller_id = localStorage.getItem("seller_id");
      const response = await axios.get(
        `http://localhost:8080/product/by-seller/${seller_id}`
      );
      setListProduct(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDiscountData({ ...discountData, [name]: value });
  };

  const handleSaveChanges = async () => {
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

  const handleApplyProduct = async (productId) => {
    try {
      await axios.post(`http://localhost:8080/discount/${discount_id}/apply`, {
        productId,
      });
      alert("Product applied to discount successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error applying product to discount:", error);
      alert("Failed to apply product to discount");
    }
  };

  const handleCancelProduct = async (productId) => {
    try {
      await axios.post(`http://localhost:8080/discount/${discount_id}/cancel`, {
        productId,
      });
      alert("Product removed from discount successfully");
      fetchProducts();
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
        {Object.entries(discountData).map(([key, value]) => {
          if (key !== "_id" && key !== "seller_id") {
            return (
              <div key={key} className="mb-4">
                <Label htmlFor={key}>{key}</Label>
                <Input
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleInputChange}
                />
              </div>
            );
          }
          return null;
        })}
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </TabsContent>

      <TabsContent value="applyProduct">
        <ProductTable
          columns={columns}
          apiEndpoint={`http://localhost:8080/product/by-seller/${localStorage.getItem(
            "seller_id"
          )}`}
          actions={actions}
        />
      </TabsContent>

      <TabsContent value="analytic">
        {/* Analytic content will be added here in the future */}
        <p>Analytic data will be displayed here.</p>
      </TabsContent>
    </Tabs>
  );
};

export default DiscountTicketDialog;

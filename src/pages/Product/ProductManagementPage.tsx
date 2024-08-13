import React from "react";
import { useNavigate } from "react-router-dom";
import ProductTable from "@/components/ProductTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const ProductManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const columns = [
    { key: "name", header: "Name" },
    { key: "price", header: "Price" },
    { key: "countryOfOrigin", header: "Country" },
    { key: "stock", header: "Stock" },
    { key: "units_sold", header: "Sold" },
    { key: "is_active", header: "Status" },
    { key: "actions", header: "Action" },
  ];

  const handleEdit = (productId: string) => {
    navigate(`/product/edit/${productId}`);
  };

  const handleChangeStatus = async (productId: string) => {
    console.log(`Changing status for product ${productId}`);
    // Implement status change logic here
  };

  const handleDelete = async (productId: string) => {
    console.log(`Deleting product ${productId}`);
    // Implement delete logic here
  };

  const actions = [
    { label: "Edit Product", onClick: handleEdit },
    { label: "Change Status", onClick: handleChangeStatus },
    { label: "Delete Product", onClick: handleDelete },
  ];

  const handleAddProduct = () => {
    navigate("/product/add");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button onClick={handleAddProduct}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>
      <ProductTable columns={columns} actions={actions} />
    </div>
  );
};

export default ProductManagementPage;

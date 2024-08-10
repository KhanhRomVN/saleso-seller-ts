import React, { useState } from "react";
import { Space } from "@/components/ui/space";
import ProductTable from "./components/ProductTable";
import DiscountModal from "./components/DiscountModal";
import useProducts from "./hooks/useProducts";

interface Product {
  id: string;
  name: string;
  price: number;
  // Add other product properties as needed
}

const DiscountProduct: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products, loading } = useProducts();

  const showModal = (record: Product) => {
    setSelectedProduct(record);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="p-4">
      <div className="w-full space-y-4">
        <h4 className="text-2xl font-semibold">Product Discounts</h4>
        <ProductTable
          products={products}
          loading={loading}
          showModal={showModal}
        />
      </div>
      <DiscountModal
        open={isModalVisible}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </div>
  );
};

export default DiscountProduct;

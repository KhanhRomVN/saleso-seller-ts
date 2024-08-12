// AddProductPage.tsx

import React, { useState, useCallback } from "react";
// ... other imports

interface Category {
  _id: string;
  name: string;
}

interface ProductData {
  name: string;
  description: string;
  countryOfOrigin: string;
  brand: string;
  attributes_name?: string;
  attributes?: Attribute[];
  price?: number;
  stock?: number;
  details: Detail[];
  categories: Category[];
  tags: string[];
  images: string[];
}

// ... rest of the imports and interfaces

const AddProductPage: React.FC = () => {
  // ... other state declarations

  const [categories, setCategories] = useState<Category[]>([]);

  // ... other functions

  const handleSelectCategories = (selectedCategories: Category[]) => {
    setCategories(selectedCategories);
    toast({
      description: "Categories updated successfully",
    });
  };

  const handleDeleteCategory = (categoryToDelete: Category) => {
    setCategories((prevCategories) =>
      prevCategories.filter((category) => category._id !== categoryToDelete._id)
    );
    toast({
      description: "Category removed successfully",
    });
  };

  // ... rest of the component

  return (
    // ... other JSX
    <div className="w-[60%]">
      <ProductDetail
        productData={productData}
        setProductData={setProductData}
      />
    </div>
    // ... rest of the JSX

    <CategoriesSelectedDialog
      isOpen={isCategoryModalOpen}
      onClose={() => setIsCategoryModalOpen(false)}
      onSelectCategories={handleSelectCategories}
    />
  );
};

// CategoriesSelectedDialog.tsx

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategories: (categories: Category[]) => void;
}

const CategoriesSelectedDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectCategories,
}) => {
  // ... rest of the component
};

// ProductDetail.tsx

interface ProductDetailProps {
  productData: ProductData;
  setProductData: React.Dispatch<React.SetStateAction<ProductData>>;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  productData,
  setProductData,
}) => {
  // ... rest of the component
};

export default ProductDetail;
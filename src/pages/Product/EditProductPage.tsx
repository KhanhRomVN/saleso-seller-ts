import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Attribute {
  attributes_value: string;
  attributes_quantity: number;
  attributes_price: number;
}

interface ProductData {
  _id: string;
  name: string;
  description: string;
  countryOfOrigin: string;
  brand: string;
  details: string[];
  categories: string[];
  tags: string[];
  images: string[];
  attributes_name?: string;
  attributes?: Attribute[];
  price?: number;
  stock?: number;
  units_sold: number;
}

const EditProductPage: React.FC = () => {
  const { product_id } = useParams<{ product_id: string }>();
  const [productData, setProductData] = useState<ProductData | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/product/${product_id}`
        );
        setProductData(response.data);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [product_id]);

  if (!productData) {
    return <div>Loading...</div>;
  }

  const renderPriceAndStock = () => {
    if (productData.price !== undefined && productData.stock !== undefined) {
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Price</label>
            <Input type="number" value={productData.price} readOnly />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Stock</label>
            <Input type="number" value={productData.stock} readOnly />
          </div>
        </>
      );
    } else if (productData.attributes) {
      const minPrice = Math.min(
        ...productData.attributes.map((attr) => attr.attributes_price)
      );
      const maxPrice = Math.max(
        ...productData.attributes.map((attr) => attr.attributes_price)
      );
      const totalStock = productData.attributes.reduce(
        (sum, attr) => sum + attr.attributes_quantity,
        0
      );

      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Price Range
            </label>
            <Input type="text" value={`${minPrice} - ${maxPrice}`} readOnly />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Total Stock
            </label>
            <Input type="number" value={totalStock} readOnly />
          </div>
        </>
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <Card>
        <CardContent className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input type="text" value={productData.name} readOnly />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea value={productData.description} readOnly />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Country of Origin
            </label>
            <Input type="text" value={productData.countryOfOrigin} readOnly />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Brand</label>
            <Input type="text" value={productData.brand} readOnly />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Categories</label>
            <Input
              type="text"
              value={productData.categories.join(", ")}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tags</label>
            <Input type="text" value={productData.tags.join(", ")} readOnly />
          </div>
          {renderPriceAndStock()}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Units Sold</label>
            <Input type="number" value={productData.units_sold} readOnly />
          </div>
          {productData.attributes_name && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Attributes Name
              </label>
              <Input type="text" value={productData.attributes_name} readOnly />
            </div>
          )}
          {productData.attributes && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Attributes
              </label>
              {productData.attributes.map((attr, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <Input
                    type="text"
                    value={attr.attributes_value}
                    readOnly
                    className="w-1/3"
                  />
                  <Input
                    type="number"
                    value={attr.attributes_quantity}
                    readOnly
                    className="w-1/3"
                  />
                  <Input
                    type="number"
                    value={attr.attributes_price}
                    readOnly
                    className="w-1/3"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Images</label>
            <div className="grid grid-cols-2 gap-2">
              {productData.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-auto"
                />
              ))}
            </div>
          </div>
          <Button className="mt-4">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProductPage;

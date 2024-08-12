import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Attribute {
  attributes_value: string;
  attributes_quantity: number;
  attributes_price: number;
}

interface Detail {
  details_name: string;
  details_info: string;
}

interface ProductData {
  name: string;
  description: string;
  countryOfOrigin: string;
  brand: string;
  isHandmade: boolean;
  attributes_name?: string;
  attributes?: Attribute[];
  price?: number;
  stock?: number;
  details: Detail[];
}

interface ProductDetailProps {
  productData: ProductData;
  setProductData: React.Dispatch<React.SetStateAction<ProductData>>;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  productData,
  setProductData,
}) => {
  const [newAttribute, setNewAttribute] = useState<Attribute>({
    attributes_value: "",
    attributes_quantity: 0,
    attributes_price: 0,
  });
  const [newDetail, setNewDetail] = useState<Detail>({
    details_name: "",
    details_info: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPriceStockMode, setIsPriceStockMode] = useState(false);

  useEffect(() => {
    if (productData.price || productData.stock) {
      setIsPriceStockMode(true);
    } else if (productData.attributes && productData.attributes.length > 0) {
      setIsPriceStockMode(false);
    }
  }, [productData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (
      (name === "price" || name === "stock") &&
      !isPriceStockMode &&
      productData.attributes &&
      productData.attributes.length > 0
    ) {
      setIsModalOpen(true);
    } else {
      setProductData((prev) => ({
        ...prev,
        [name]: name === "price" || name === "stock" ? Number(value) : value,
      }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setProductData((prev) => ({ ...prev, isHandmade: checked }));
  };

  const handleAttributeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    if (isPriceStockMode) {
      setIsModalOpen(true);
    } else {
      setProductData((prev) => ({
        ...prev,
        attributes: prev.attributes?.map((attr, i) =>
          i === index
            ? {
                ...attr,
                [name]: name === "attributes_value" ? value : Number(value),
              }
            : attr
        ),
      }));
    }
  };

  const addAttribute = () => {
    if (isPriceStockMode) {
      setIsModalOpen(true);
    } else {
      setProductData((prev) => ({
        ...prev,
        attributes: [...(prev.attributes || []), newAttribute],
      }));
      setNewAttribute({
        attributes_value: "",
        attributes_quantity: 0,
        attributes_price: 0,
      });
    }
  };

  const deleteAttribute = (index: number) => {
    setProductData((prev) => ({
      ...prev,
      attributes: prev.attributes?.filter((_, i) => i !== index),
    }));
  };

  const handleDetailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      details: prev.details.map((detail, i) =>
        i === index ? { ...detail, [name]: value } : detail
      ),
    }));
  };

  const addDetail = () => {
    setProductData((prev) => ({
      ...prev,
      details: [...prev.details, newDetail],
    }));
    setNewDetail({ details_name: "", details_info: "" });
  };

  const handleConfirmModal = () => {
    setProductData((prev) => ({
      ...prev,
      price: undefined,
      stock: undefined,
      attributes: [],
    }));
    setIsPriceStockMode(false);
    setIsModalOpen(false);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-background_secondary w-full p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Product Detail</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={productData.name}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={productData.description}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="countryOfOrigin">Country of Origin</Label>
          <Input
            id="countryOfOrigin"
            name="countryOfOrigin"
            value={productData.countryOfOrigin}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            name="brand"
            value={productData.brand}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isHandmade"
            checked={productData.isHandmade}
            onCheckedChange={handleCheckboxChange}
          />
          <Label htmlFor="isHandmade">Handmade</Label>
        </div>

        <div>
          <Label htmlFor="attributes_name">Attributes Name</Label>
          <Input
            id="attributes_name"
            name="attributes_name"
            value={productData.attributes_name}
            onChange={handleInputChange}
            disabled={isPriceStockMode}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Attributes</h3>
          {productData.attributes?.map((attr, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <Input
                placeholder="Value"
                name="attributes_value"
                value={attr.attributes_value}
                onChange={(e) => handleAttributeChange(e, index)}
                disabled={isPriceStockMode}
              />
              <Input
                type="number"
                placeholder="Quantity"
                name="attributes_quantity"
                value={attr.attributes_quantity}
                onChange={(e) => handleAttributeChange(e, index)}
                disabled={isPriceStockMode}
              />
              <Input
                type="number"
                placeholder="Price"
                name="attributes_price"
                value={attr.attributes_price}
                onChange={(e) => handleAttributeChange(e, index)}
                disabled={isPriceStockMode}
              />
              <Button
                onClick={() => deleteAttribute(index)}
                disabled={isPriceStockMode}
              >
                Delete Attribute
              </Button>
            </div>
          ))}
          <div className="flex space-x-2 mb-2">
            <Input
              placeholder="Value"
              value={newAttribute.attributes_value}
              onChange={(e) =>
                setNewAttribute({
                  ...newAttribute,
                  attributes_value: e.target.value,
                })
              }
              disabled={isPriceStockMode}
            />
            <Input
              type="number"
              placeholder="Quantity"
              value={newAttribute.attributes_quantity}
              onChange={(e) =>
                setNewAttribute({
                  ...newAttribute,
                  attributes_quantity: Number(e.target.value),
                })
              }
              disabled={isPriceStockMode}
            />
            <Input
              type="number"
              placeholder="Price"
              value={newAttribute.attributes_price}
              onChange={(e) =>
                setNewAttribute({
                  ...newAttribute,
                  attributes_price: Number(e.target.value),
                })
              }
              disabled={isPriceStockMode}
            />
            <Button onClick={addAttribute} disabled={isPriceStockMode}>
              Add Attribute
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={productData.price}
            onChange={handleInputChange}
            disabled={
              !isPriceStockMode &&
              productData.attributes &&
              productData.attributes.length > 0
            }
          />
        </div>

        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            value={productData.stock}
            onChange={handleInputChange}
            disabled={
              !isPriceStockMode &&
              productData.attributes &&
              productData.attributes.length > 0
            }
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Details</h3>
          {productData.details.map((detail, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <Input
                placeholder="Name"
                name="details_name"
                value={detail.details_name}
                onChange={(e) => handleDetailChange(e, index)}
              />
              <Input
                placeholder="Info"
                name="details_info"
                value={detail.details_info}
                onChange={(e) => handleDetailChange(e, index)}
              />
            </div>
          ))}
          <div className="flex space-x-2 mb-2">
            <Input
              placeholder="Name"
              value={newDetail.details_name}
              onChange={(e) =>
                setNewDetail({ ...newDetail, details_name: e.target.value })
              }
            />
            <Input
              placeholder="Info"
              value={newDetail.details_info}
              onChange={(e) =>
                setNewDetail({ ...newDetail, details_info: e.target.value })
              }
            />
            <Button onClick={addDetail}>Add Detail</Button>
          </div>
        </div>
      </div>
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {isPriceStockMode
                ? "Adding attributes will remove the price and stock values. Do you want to proceed?"
                : "Adding price or stock will remove all attributes. Do you want to proceed?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelModal}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmModal}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductDetail;

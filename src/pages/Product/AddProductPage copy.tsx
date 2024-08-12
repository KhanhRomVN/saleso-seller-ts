import React, { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  handleImageSelect,
  cropImageFile,
  handleUploadCroppedImage,
} from "@/utils/imageUtils";
import CategoriesSelectedDialog from "@/components/CategoriesSelectedDialog";
import { X } from "lucide-react";
import ProductDetail from "./ProductDetail";

interface Category {
  _id: string;
  name: string;
}

import TagInput from "@/components/TagInput";

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
  categories: Category[];
  tags: string[];
  images: string[];
}

interface Attribute {
  attributes_value: string;
  attributes_quantity: number;
  attributes_price: number;
}

interface Detail {
  details_name: string;
  details_info: string;
}

const AddProductPage: React.FC = () => {
  const [productData, setProductData] = useState<ProductData>({
    name: "",
    description: "",
    countryOfOrigin: "",
    brand: "",
    isHandmade: false,
    details: [],
    categories: [],
    tags: [],
    images: [],
  });
  const [images, setImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelect(event, setSelectedImages, setIsModalOpen);
  };

  const handleCropImage = async () => {
    if (croppedAreaPixels && selectedImages[currentImageIndex]) {
      const croppedImage = await cropImageFile(
        croppedAreaPixels,
        URL.createObjectURL(selectedImages[currentImageIndex])
      );
      if (croppedImage) {
        const imageUrl = await handleUploadCroppedImage(croppedImage);
        if (imageUrl) {
          setImages((prevImages) => [...prevImages, imageUrl]);
          setProductData((prevData) => ({
            ...prevData,
            images: [...prevData.images, imageUrl],
          }));
        }
      }
    }

    if (currentImageIndex < selectedImages.length - 1) {
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
    } else {
      setIsModalOpen(false);
      setSelectedImages([]);
      setCurrentImageIndex(0);
    }
  };

  const handleSkipImage = () => {
    if (currentImageIndex < selectedImages.length - 1) {
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
    } else {
      setIsModalOpen(false);
      setSelectedImages([]);
      setCurrentImageIndex(0);
    }
  };

  const handleDeleteImage = (indexToDelete: number) => {
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToDelete)
    );
    setProductData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, index) => index !== indexToDelete),
    }));
  };

  const handleSelectCategories = (selectedCategories: Category[]) => {
    setProductData((prevData) => ({
      ...prevData,
      categories: selectedCategories,
    }));
  };

  const handleSubmit = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("Access token not found");
      return;
    }

    try {
      const response = await fetch("/product/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      const result = await response.json();
      console.log("Product created:", result);
      // Handle success (e.g., show a success message, redirect, etc.)
    } catch (error) {
      console.error("Error creating product:", error);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <div className="flex justify-between gap-2">
      <div className="w-[40%] flex flex-col gap-2">
        {/* Image upload section */}
        <div className="w-full bg-background_secondary p-2">
          <p className="mb-2">Product Images</p>
          <div className="w-full">
            <div className="bg-background w-full h-[140px] rounded-lg flex flex-col items-center justify-center mb-2">
              <p>Upload Images</p>
              <div className="flex gap-1 items-center">
                <p>Drag photos here or</p>
                <label
                  htmlFor="file-upload"
                  className="text-red-500 cursor-pointer"
                >
                  upload here
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
            {images.length > 0 && (
              <div className="bg-background w-full flex flex-wrap gap-2 p-2 items-center justify-center">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Uploaded ${index}`}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <button
                      onClick={() => handleDeleteImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-red-600 focus:outline-none"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Categories section */}
        <div className="w-full bg-background_secondary p-2">
          <div className="w-full flex justify-between items-center">
            <p>Categories</p>
            <div
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-red-500 p-1.5 cursor-pointer text-sm rounded-lg"
            >
              Add Categories
            </div>
          </div>
          {productData.categories.length > 0 && (
            <div className="mt-2 bg-background p-2">
              <div className="flex flex-wrap gap-1.5 rounded-lg">
                {productData.categories.map((category, index) => (
                  <div key={index}>{category.name}</div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Tags section */}
        <div className="w-full bg-background_secondary p-2">
          <p className="mb-2">Tags</p>
          <TagInput
            tags={productData.tags}
            setTags={(newTags) =>
              setProductData((prevData) => ({ ...prevData, tags: newTags }))
            }
          />
        </div>
      </div>
      <div className="w-[60%]">
        <ProductDetail
          productData={productData}
          setProductData={setProductData}
        />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="relative w-full h-64">
            {selectedImages.length > 0 && (
              <Cropper
                image={URL.createObjectURL(selectedImages[currentImageIndex])}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="flex justify-between mt-4">
            <Button onClick={handleSkipImage}>Skip</Button>
            <Button onClick={handleCropImage}>Crop and Upload</Button>
          </div>
          <p className="text-center mt-2">
            Image {currentImageIndex + 1} of {selectedImages.length}
          </p>
        </DialogContent>
      </Dialog>

      <CategoriesSelectedDialog
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelectCategories={handleSelectCategories}
      />

      <Button onClick={handleSubmit}>Create Product</Button>
    </div>
  );
};

export default AddProductPage;
import React, { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  handleImageSelect,
  cropImageFile,
  handleUploadCroppedImage,
} from "@/utils/imageUtils";
import CategoriesSelectedDialog from "@/components/CategoriesSelectedDialog";
import { X } from "lucide-react";
import ProductDetail from "./ProductDetail";
import { BACKEND_URI } from "@/api";
import TagInput from "@/components/TagInput";
import { useToast } from "@/components/ui/use-toast";

// ... (interfaces remain the same)

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ... (state declarations remain the same)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelect(event, setSelectedImages, setIsModalOpen);
    toast({
      description: "Images selected successfully",
    });
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
          toast({
            description: "Image cropped and uploaded successfully",
          });
        }
      }
    }

    // ... (rest of the function remains the same)
  };

  const handleDeleteImage = (indexToDelete: number) => {
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToDelete)
    );
    toast({
      description: "Image deleted successfully",
    });
  };

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

  const handleSubmit = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast({
        variant: "destructive",
        description: "Access token not found",
      });
      return;
    }

    toast({
      description: "Creating product...",
    });

    try {
      const product = {
        ...productData,
        categories,
        images,
        tags,
      };

      console.log(product);

      const response = await axios.post(
        `${BACKEND_URI}/product/create`,
        product,
        {
          headers: {
            accessToken,
          },
        }
      );

      console.log(response.data);

      toast({
        description: "Product created successfully",
      });
      console.log("Product created:", response.data);

      setTimeout(() => {
        navigate("/product/management");
      }, 3000);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Error creating product",
      });
      console.error("Error creating product:", error);
    }
  };

  // ... (rest of the component remains the same)

  return (
    <div className="flex justify-between gap-2">
      {/* ... (JSX remains largely the same) */}
      <div
        className="cursor-pointer w-full py-1 bg-red-500 text-black text-center rounded-lg"
        onClick={() => {
          toast({
            description: "Action cancelled",
          });
          navigate(-1);
        }}
      >
        Cancel
      </div>
      <div
        className="cursor-pointer w-full py-1 bg-blue-500 text-black text-center rounded-lg"
        onClick={() => {
          toast({
            description: "Draft saved",
          });
          // Add logic to save draft
        }}
      >
        Save Draft
      </div>
      {/* ... (rest of the JSX remains the same) */}
    </div>
  );
};

export default AddProductPage;

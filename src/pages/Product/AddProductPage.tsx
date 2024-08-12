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
import ProductDetail from "../../components/ProductDetail";
import { BACKEND_URI } from "@/api";
import TagInput from "@/components/TagInput";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  _id: string;
  name: string;
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

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [productData, setProductData] = useState<ProductData>({
    name: "",
    description: "",
    countryOfOrigin: "",
    brand: "",
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
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    width: number;
    height: number;
    x: number;
    y: number;
  } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
      console.log(croppedArea);
    },
    []
  );

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

      const response = await axios.post(
        `${BACKEND_URI}/product/create`,
        product,
        {
          headers: {
            accessToken,
          },
        }
      );

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

  return (
    <div className="flex justify-between gap-2">
      <div className="w-[40%] flex flex-col  gap-2">
        {/* Image */}
        <div className="w-full bg-background_secondary p-2">
          <p className="mb-2">Product Images</p>
          <div className="w-full">
            {/* Image Upload */}
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
            {/* Image Preview Slider*/}
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
        {/* Categories */}
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
          {categories.length > 0 && (
            <div className="mt-2 bg-background p-2">
              <div className="flex flex-wrap gap-1.5 rounded-lg">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="bg-blue-600 px-2 rounded-lg flex gap-1 items-center"
                  >
                    <p>{category.name}</p>
                    <X
                      size={14}
                      className="cursor-pointer"
                      onClick={() => handleDeleteCategory(category)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Tags */}
        <div className="w-full bg-background_secondary p-2">
          <p className="mb-2">Tags</p>
          <TagInput tags={tags} setTags={setTags} />
        </div>
        {/* Product Action */}
        <div className="flex justify-around w-full gap-2.5">
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
          <div
            onClick={handleSubmit}
            className="cursor-pointer w-full py-1 bg-white text-black text-center rounded-lg"
          >
            Create Product
          </div>
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
    </div>
  );
};

export default AddProductPage;

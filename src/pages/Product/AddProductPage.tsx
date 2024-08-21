import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  X,
  Upload,
  Image,
  Tag,
  Crop,
  SkipForward,
  Check,
  Save,
  Hash,
  Plus,
} from "lucide-react";
import ProductDetail from "../../components/product/ProductDetail";
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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

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
    <motion.div
      className="flex justify-between gap-4 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div className="w-[40%] flex flex-col gap-4" {...fadeInUp}>
        {/* Image Upload */}
        <motion.div
          className="bg-background_secondary p-4 rounded-lg shadow-md"
          {...fadeInUp}
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Image className="mr-2" size={24} />
            Product Images
          </h2>
          <motion.div
            className="bg-background w-full h-[140px] rounded-lg flex flex-col items-center justify-center mb-4 border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload size={32} className="mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">Drag photos here or</p>
            <label
              htmlFor="file-upload"
              className="text-blue-500 cursor-pointer hover:underline"
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
          </motion.div>
          <AnimatePresence>
            {images.length > 0 && (
              <motion.div
                className="bg-background w-full flex flex-wrap gap-2 p-2 items-center justify-start rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={image}
                      alt={`Uploaded ${index}`}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-red-600 focus:outline-none"
                    >
                      <X size={16} />
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Categories */}
        <motion.div
          className="bg-background_secondary p-4 rounded-lg shadow-md"
          {...fadeInUp}
        >
          <div className="w-full flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Tag className="mr-2" size={24} />
              Categories
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-blue-500 text-white p-2 rounded-lg text-sm flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Add Categories
            </motion.button>
          </div>
          <AnimatePresence>
            {categories.length > 0 && (
              <motion.div
                className="bg-background p-2 rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex flex-wrap gap-2">
                  {categories.map((category, index) => (
                    <motion.div
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="mr-1">{category.name}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteCategory(category)}
                        className="text-blue-800 focus:outline-none"
                      >
                        <X size={14} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tags */}
        <motion.div
          className="bg-background_secondary p-4 rounded-lg shadow-md"
          {...fadeInUp}
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Hash className="mr-2" size={24} />
            Tags
          </h2>
          <TagInput tags={tags} setTags={setTags} />
        </motion.div>

        {/* Product Actions */}
        <motion.div
          className="flex justify-around w-full gap-4 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-2 bg-red-500 text-white text-center rounded-lg flex items-center justify-center"
            onClick={() => {
              toast({ description: "Action cancelled" });
              navigate(-1);
            }}
          >
            <X size={18} className="mr-2" />
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-2 bg-blue-500 text-white text-center rounded-lg flex items-center justify-center"
            onClick={() => {
              toast({ description: "Draft saved" });
              // Add logic to save draft
            }}
          >
            <Save size={18} className="mr-2" />
            Save Draft
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-2 bg-green-500 text-white text-center rounded-lg flex items-center justify-center"
            onClick={handleSubmit}
          >
            <Check size={18} className="mr-2" />
            Create Product
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        className="w-[60%]"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ProductDetail
          productData={productData}
          setProductData={setProductData}
        />
      </motion.div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <motion.div
            className="relative w-full h-64"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
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
          </motion.div>
          <motion.div
            className="flex justify-between mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button onClick={handleSkipImage} className="flex items-center">
              <SkipForward size={18} className="mr-2" />
              Skip
            </Button>
            <Button onClick={handleCropImage} className="flex items-center">
              <Crop size={18} className="mr-2" />
              Crop and Upload
            </Button>
          </motion.div>
          <motion.p
            className="text-center mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Image {currentImageIndex + 1} of {selectedImages.length}
          </motion.p>
        </DialogContent>
      </Dialog>

      <CategoriesSelectedDialog
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelectCategories={handleSelectCategories}
      />
    </motion.div>
  );
};

export default AddProductPage;

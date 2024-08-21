import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Loader2, Camera, Edit2, Save, ArrowLeft } from "lucide-react";
import Cropper, { Area } from "react-easy-crop";
import { cropImageFile, handleUploadCroppedImage } from "@/utils/imageUtils";
import TagInput from "@/components/TagInput";
import CategoriesSelectedDialog from "@/components/CategoriesSelectedDialog";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Attribute {
  attributes_value: string;
  attributes_quantity: number;
  attributes_price: number;
}

interface ProductData {
  name: string;
  description: string;
  countryOfOrigin: string;
  brand: string;
  categories: string[];
  tags: string[];
  price: number;
  stock: number;
  units_sold: number;
  images: string[];
  attributes_name?: string;
  attributes?: Attribute[];
}

const MotionCard = motion(Card);
const MotionButton = motion(Button);

const EditProductPage: React.FC = () => {
  const { product_id } = useParams<{ product_id: string }>();
  const navigate = useNavigate();
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axios.get<ProductData>(
          `http://localhost:8080/product/${product_id}`
        );
        setProductData(response.data);
      } catch (error) {
        console.error("Error fetching product data:", error);
        toast.error("Failed to fetch product data");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [product_id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!productData) {
    return <div>Product not found</div>;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProductData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleAttributeChange = (
    index: number,
    field: keyof Attribute,
    value: string | number
  ) => {
    setProductData((prev) => {
      if (!prev || !prev.attributes) return prev;
      const newAttributes = [...prev.attributes];
      newAttributes[index] = { ...newAttributes[index], [field]: value };
      return { ...prev, attributes: newAttributes };
    });
  };

  const handleDeleteAttribute = (index: number) => {
    setProductData((prev) => {
      if (!prev || !prev.attributes) return prev;
      return {
        ...prev,
        attributes: prev.attributes.filter((_, i) => i !== index),
      };
    });
    toast.success("Attribute deleted successfully");
  };

  const handleTagsChange: React.Dispatch<React.SetStateAction<string[]>> = (
    newTagsOrFunction
  ) => {
    setProductData((prev) => {
      if (!prev) return prev;
      const updatedTags =
        typeof newTagsOrFunction === "function"
          ? newTagsOrFunction(prev.tags)
          : newTagsOrFunction;
      return { ...prev, tags: updatedTags };
    });
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setImageDialogOpen(true);
  };

  const handleCropComplete = (croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCroppedImage = async () => {
    if (croppedAreaPixels && selectedImageIndex !== null && productData) {
      try {
        const croppedImage = await cropImageFile(
          croppedAreaPixels,
          productData.images[selectedImageIndex]
        );
        if (croppedImage) {
          const uploadedImageUrl = await handleUploadCroppedImage(croppedImage);
          if (uploadedImageUrl) {
            setProductData((prev) => {
              if (!prev) return prev;
              const newImages = [...prev.images];
              newImages[selectedImageIndex] = uploadedImageUrl;
              return { ...prev, images: newImages };
            });
            toast.success("Image cropped and saved successfully");
          }
        }
      } catch (error) {
        console.error("Error saving cropped image:", error);
        toast.error("Failed to save cropped image");
      }
    }
    setImageDialogOpen(false);
  };

  const handleDeleteImage = (index: number) => {
    setProductData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      };
    });
    toast.success("Image deleted successfully");
  };

  const handleSaveChanges = async () => {
    try {
      if (!productData) return;
      const accessToken = localStorage.getItem("accessToken");
      await axios.put(
        `http://localhost:8080/product/update/${product_id}`,
        productData,
        { headers: { accessToken } }
      );
      toast.success("Product updated successfully");
      navigate("/product/management");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const renderPriceAndStock = () => {
    if (productData.attributes && productData.attributes.length > 0) {
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
    } else {
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Price</label>
            <Input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Stock</label>
            <Input
              type="number"
              name="stock"
              value={productData.stock}
              onChange={handleInputChange}
              readOnly
            />
          </div>
        </>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex gap-2 flex-col p-4"
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <div className="flex gap-2">
          <MotionButton
            variant="outline"
            onClick={() => navigate("/product/management")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </MotionButton>
          <MotionButton
            onClick={handleSaveChanges}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </MotionButton>
        </div>
      </div>
      <div className="w-full flex gap-4">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-2/5 bg-background_secondary p-4 rounded-lg"
        >
          <h2 className="text-lg font-semibold mb-2">Images</h2>
          <div className="grid grid-cols-2 gap-2">
            <AnimatePresence>
              {productData.images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative"
                >
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-auto cursor-pointer rounded-lg hover:shadow-lg transition-shadow duration-300"
                    onClick={() => handleImageClick(index)}
                  />
                  <motion.button
                    className="absolute top-1 right-1 bg-background rounded-full p-1"
                    onClick={() => handleDeleteImage(index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <MotionButton
            className="w-full mt-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Camera className="mr-2 h-4 w-4" /> Add Image
          </MotionButton>
        </motion.div>
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-3/5"
        >
          <MotionCard
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <CardContent className="p-4 bg-background_secondary">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={productData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={productData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Country of Origin
                </label>
                <Input
                  type="text"
                  name="countryOfOrigin"
                  value={productData.countryOfOrigin}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Brand</label>
                <Input
                  type="text"
                  name="brand"
                  value={productData.brand}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Categories
                </label>
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={productData.categories.join(", ")}
                    readOnly
                    className="mr-2"
                  />
                  <MotionButton
                    onClick={() => setIsCategoriesDialogOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                  </MotionButton>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tags</label>
                <TagInput tags={productData.tags} setTags={handleTagsChange} />
              </div>
              {renderPriceAndStock()}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Units Sold
                </label>
                <Input type="number" value={productData.units_sold} readOnly />
              </div>
              {productData.attributes_name && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Attributes Name
                  </label>
                  <Input
                    type="text"
                    name="attributes_name"
                    value={productData.attributes_name}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              {productData.attributes && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Attributes
                  </label>
                  <AnimatePresence>
                    {productData.attributes.map((attr, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex space-x-2 mb-2"
                      >
                        <Input
                          type="text"
                          value={attr.attributes_value}
                          onChange={(e) =>
                            handleAttributeChange(
                              index,
                              "attributes_value",
                              e.target.value
                            )
                          }
                          className="w-1/3"
                        />
                        <Input
                          type="number"
                          value={attr.attributes_quantity}
                          onChange={(e) =>
                            handleAttributeChange(
                              index,
                              "attributes_quantity",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-1/3"
                        />
                        <Input
                          type="number"
                          value={attr.attributes_price}
                          onChange={(e) =>
                            handleAttributeChange(
                              index,
                              "attributes_price",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-1/3"
                        />
                        <MotionButton
                          variant="destructive"
                          onClick={() => handleDeleteAttribute(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X className="h-4 w-4" />
                        </MotionButton>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <MotionButton
                    onClick={() =>
                      setProductData((prev) => {
                        if (!prev || !prev.attributes) return prev;
                        return {
                          ...prev,
                          attributes: [
                            ...prev.attributes,
                            {
                              attributes_value: "",
                              attributes_quantity: 0,
                              attributes_price: 0,
                            },
                          ],
                        };
                      })
                    }
                    className="mt-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add Attribute
                  </MotionButton>
                </div>
              )}
            </CardContent>
          </MotionCard>
        </motion.div>
      </div>
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="relative w-full h-[300px]">
            {selectedImageIndex !== null && productData && (
              <Cropper
                image={productData.images[selectedImageIndex]}
                crop={crop}
                zoom={zoom}
                aspect={1.5}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            )}
          </div>
          <div className="flex justify-between mt-4">
            <MotionButton
              onClick={() => setImageDialogOpen(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </MotionButton>
            <MotionButton
              onClick={handleSaveCroppedImage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save
            </MotionButton>
          </div>
        </DialogContent>
      </Dialog>
      <CategoriesSelectedDialog
        isOpen={isCategoriesDialogOpen}
        onClose={() => setIsCategoriesDialogOpen(false)}
        onSelectCategories={(categories) => {
          setProductData((prev) =>
            prev
              ? {
                  ...prev,
                  categories: categories.map((cat) => cat.name),
                }
              : null
          );
          setIsCategoriesDialogOpen(false);
          toast.success("Categories updated successfully");
        }}
      />
    </motion.div>
  );
};

export default EditProductPage;

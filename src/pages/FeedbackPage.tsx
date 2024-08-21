import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Calendar,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Feedback {
  is_owner: boolean;
  owner_id: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  reply?: {
    comment: string;
    createdAt: string;
    updatedAt: string;
  };
  username: string;
  productName: string;
  productImage: string;
}

interface Product {
  _id: string;
  name: string;
  images: string[];
}

const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [start, setStart] = useState<number>(1);
  const [end, setEnd] = useState<number>(10);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.post<Feedback[]>(
          "http://localhost:8080/feedback/seller/filtered-feedbacks",
          {},
          {
            headers: {
              accessToken,
            },
          }
        );
        setFeedbacks(response.data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.post<Product[]>(
          "http://localhost:8080/product/by-seller",
          {},
          {
            headers: {
              accessToken,
            },
          }
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchFeedbacks();
    fetchProducts();
  }, []);

  const handleFilter = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.post<Feedback[]>(
        "http://localhost:8080/feedback/seller/filtered-feedbacks",
        {
          start,
          end,
          product_id: selectedProductId,
          rating: selectedRating,
        },
        {
          headers: {
            accessToken,
          },
        }
      );
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Error filtering feedbacks:", error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        {feedbacks.map((feedback) => (
          <Card key={feedback._id}>
            <CardHeader>
              <Avatar>
                <AvatarFallback>{feedback.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{feedback.productName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {feedback.username}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {Array.from({ length: feedback.rating }).map((_, index) => (
                  <Star key={index} className="text-yellow-500" />
                ))}
              </div>
              <p>{feedback.comment}</p>
              {feedback.images.length > 0 && (
                <div className="mt-4">
                  {feedback.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Feedback Image ${index}`}
                      className="w-full h-auto"
                    />
                  ))}
                </div>
              )}
              {feedback.reply && (
                <div className="mt-4 border-t pt-4">
                  <p className="font-bold">Seller's Reply:</p>
                  <p>{feedback.reply.comment}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                {format(new Date(feedback.createdAt), "MMM d, yyyy")}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Filter Feedbacks</h2>
        <div className="mb-4">
          <label htmlFor="product" className="block font-medium mb-2">
            Product
          </label>
          <select
            id="product"
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={selectedProductId || ""}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="rating" className="block font-medium mb-2">
            Rating
          </label>
          <select
            id="rating"
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={selectedRating || ""}
            onChange={(e) =>
              setSelectedRating(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} Stars
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleFilter}>Filter</Button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default FeedbackPage;

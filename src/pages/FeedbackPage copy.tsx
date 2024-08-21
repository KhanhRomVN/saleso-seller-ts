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
import { toast } from "@/components/ui/use-toast";

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
  id: null | undefined;
  name: string;
  images: string[];
  _id: string;
}

const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [replyComment, setReplyComment] = useState<string>("");
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null
  );

  const fetchFeedbacks = async (
    page: number,
    rating?: number,
    productId?: string
  ) => {
    setLoading(true);
    setError(null);
    const start = (page - 1) * 10 + 1;
    const end = page * 10;

    try {
      const accessToken = localStorage.getItem("accessToken");
      console.log(productId);
      console.log(rating);

      const { data } = await axios.post(
        "http://localhost:8080/feedback/seller/filtered-feedbacks",
        { start, end, rating, product_id: productId },
        { headers: { accessToken } }
      );

      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      setError("Failed to fetch feedbacks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const { data } = await axios.post(
        "http://localhost:8080/product/by-seller",
        {},
        {
          headers: { accessToken },
        }
      );
      console.log(data);

      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchFeedbacks(currentPage);
    // fetchProducts();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilter = () => {
    fetchFeedbacks(
      1,
      selectedRating || undefined,
      selectedProduct || undefined
    );
    setCurrentPage(1);
  };

  const handleFilterClick = () => {
    if (!selectedRating && !selectedProduct) {
      toast({
        title: "Filter Error",
        description:
          "Please select at least a rating or a product before filtering.",
        variant: "destructive",
      });
      return;
    }

    setCurrentPage(1);
  };

  const handleReply = async (feedbackId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `http://localhost:8080/feedback/reply/${feedbackId}`,
        { comment: replyComment },
        { headers: { accessToken } }
      );
      setReplyComment("");
      setSelectedFeedbackId(null);
      toast({
        title: "Reply Successful",
        description: "Your reply has been posted.",
        variant: "success",
      });
      fetchFeedbacks(currentPage);
    } catch (error) {
      console.error("Error replying to feedback:", error);
      toast({
        title: "Reply Error",
        description: "Failed to reply to the feedback. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const FilterBox = () => {
    return (
      <div className="w-[30%] p-4 bg-background_secondary rounded-lg shadow-md">
        <h2
          className="text-xl font-semibold mb-4 cursor-pointer hover:text-primary"
          onClick={handleFilterClick}
        >
          Filter Feedbacks
        </h2>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Rating</h3>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={selectedRating === rating ? "default" : "outline"}
                onClick={() =>
                  setSelectedRating(rating === selectedRating ? null : rating)
                }
                className="flex items-center"
              >
                {rating} <Star className="ml-1" size={16} />
              </Button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Products</h3>
          <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
            {products.map((product) => (
              <Button
                key={product.id}
                variant={
                  selectedProduct === product._id ? "default" : "outline"
                }
                onClick={() =>
                  setSelectedProduct(
                    product.id === selectedProduct ? null : product._id
                  )
                }
                className="w-full justify-start flex items-center truncate"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-8 h-8 object-cover rounded mr-2"
                />
                <span className="truncate">{product.name}</span>
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={handleFilter} className="w-full">
          Filter Feedback
        </Button>
      </div>
    );
  };

  const FeedbackCard: React.FC<{ feedback: Feedback }> = ({ feedback }) => (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 10 * 0.1 }}
    >
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-background_secondary">
        <CardHeader className="bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {feedback.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{feedback.username}</CardTitle>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < feedback.rating ? "text-yellow-400" : "text-gray-300"
                  }
                  size={20}
                  fill={i < feedback.rating ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-white flex items-center">
            <MessageCircle className="inline mr-2" size={18} />
            {feedback.comment}
          </p>
          {feedback.images.length > 0 && (
            <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
              {feedback.images.map((image, imgIndex) => (
                <img
                  key={imgIndex}
                  src={image}
                  alt={`Feedback image ${imgIndex + 1}`}
                  className="w-24 h-24 object-cover rounded-lg shadow-md"
                />
              ))}
            </div>
          )}
          {feedback.reply && (
            <div className="mt-4 p-4 rounded-lg bg-background">
              <p className="font-semibold text-blue-700">Your reply:</p>
              <p className="text-gray-700 mt-1">{feedback.reply.comment}</p>
              <p className="text-sm text-gray-500 mt-2">
                <Calendar className="inline mr-1" size={14} />
                {format(new Date(feedback.reply.createdAt), "PPp")}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-background">
          <div className="flex justify-between items-center w-full pt-5">
            <div className="">
              <p className="text-sm text-gray-600 flex items-center">
                <Package className="inline mr-1" size={16} />
                Product: {feedback.productName}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="inline mr-1" size={14} />
                {format(new Date(feedback.createdAt), "PPp")}
              </p>
            </div>
            <img
              src={feedback.productImage}
              alt={feedback.productName}
              className="w-16 h-16 object-cover rounded-lg shadow-md"
            />
          </div>
        </CardFooter>

        {!feedback.reply && (
          <CardFooter className="bg-background">
            <div className="flex justify-between items-center w-full pt-5">
              <div className="flex justify-between items-center w-full">
                <div className="">{/* Existing content */}</div>
                <Button
                  onClick={() => {
                    setReplyComment("");
                    setSelectedFeedbackId(feedback._id);
                  }}
                  className="flex items-center"
                >
                  <MessageCircle className="mr-2" size={16} /> Reply
                </Button>
              </div>
            </div>
          </CardFooter>
        )}

        {selectedFeedbackId === feedback._id && (
          <div className="mt-4 p-4 rounded-lg bg-background">
            <textarea
              value={replyComment}
              onChange={(e) => setReplyComment(e.target.value)}
              placeholder="Enter your reply..."
              className="w-full p-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-2">
              <Button onClick={() => handleReply(feedback._id)}>
                Submit Reply
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Feedbacks</h1>
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {!loading && !error && (
        <>
          <AnimatePresence>
            <div className="flex w-full space-x-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 w-[70%]"
              >
                {feedbacks.map((feedback, index) => (
                  <FeedbackCard key={index} feedback={feedback} />
                ))}
              </motion.div>
              <FilterBox />
            </div>
          </AnimatePresence>
          <div className="mt-8 flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <span className="flex items-center px-4 py-2 bg-gray-100 rounded-md">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default FeedbackPage;

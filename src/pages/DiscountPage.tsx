import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import DiscountTicket from "@/components/discount/DiscountTicket";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import DiscountCreatedDialog from "@/components/discount/DiscountCreatedDialog";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Discount {
  _id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed" | "flash-sale" | "buy_x_get_y";
  value: number | { buyQuantity: number; getFreeQuantity: number };
  startDate: string;
  endDate: string;
  minimumPurchase: number;
  maxUses: number;
  applicableProducts?: string[];
  customerUsageLimit: number;
  seller_id: string;
  status: "upcoming" | "ongoing" | "expired";
  isActive: boolean;
  currentUses?: number;
}

interface DiscountData {
  name: string;
  code: string;
  type: "percentage" | "fixed" | "buy_x_get_y" | "flash-sale";
  value: number | { buyQuantity: number; getFreeQuantity: number };
  startDate: Date;
  endDate: Date;
  minimumPurchase: number;
  maxUses: number;
  applicableProducts: string[];
  customerUsageLimit: number;
}

const DiscountPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get("http://localhost:8080/discount/all", {
          headers: { accessToken },
        });
        setDiscounts(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching discounts:", error);
        setError("Failed to fetch discounts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  const filterDiscounts = (filter: string) => {
    return discounts.filter((discount) => {
      switch (filter) {
        case "Upcoming":
        case "Ongoing":
        case "Expired":
          return discount.status.toLowerCase() === filter.toLowerCase();
        case "Active":
          return discount.isActive;
        case "Non-active":
          return !discount.isActive;
        case "Percentage":
        case "Fixed":
          return discount.type.toLowerCase() === filter.toLowerCase();
        case "Buy X Get Y":
          return discount.type === "buy_x_get_y";
        case "Flash Sale":
          return discount.type === "flash-sale";
        default:
          return true;
      }
    });
  };

  const handleCreateDiscount = (discountData: DiscountData) => {
    console.log("Creating discount:", discountData);
    setIsDialogOpen(false);
    toast.success("Discount created successfully!");
  };

  const renderDiscountSlider = (filteredDiscounts: Discount[]) => (
    <Carousel className="w-full">
      <CarouselContent>
        {filteredDiscounts.map((discount, index) => (
          <CarouselItem
            key={discount._id}
            className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-1"
            >
              <DiscountTicket discount={discount} onSelect={() => {}} />
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );

  const tabItems = [
    "All",
    "Upcoming",
    "Ongoing",
    "Expired",
    "Active",
    "Non-active",
    "Percentage",
    "Fixed",
    "Buy X Get Y",
    "Flash Sale",
  ];

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-bold">Discount Management</h1>
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsDialogOpen(true)}
        >
          <PlusCircle size={20} />
          Create New Discount
        </Button>
      </motion.div>
      {loading && <p className="text-center">Loading discounts...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && (
        <Tabs defaultValue="All" className="w-full">
          <TabsList className="flex flex-wrap justify-start mb-4">
            {tabItems.map((item) => (
              <TabsTrigger key={item} value={item} className="px-4 py-2 m-1">
                {item}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabItems.map((item) => (
            <TabsContent key={item} value={item}>
              <Card>
                <CardContent className="pt-6 bg-background_secondary">
                  {renderDiscountSlider(filterDiscounts(item))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
      <DiscountCreatedDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateDiscount}
      />
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default DiscountPage;

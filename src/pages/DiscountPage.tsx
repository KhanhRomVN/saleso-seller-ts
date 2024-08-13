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
import DiscountTicket from "@/components/DiscountTicket";

interface Discount {
  _id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed" | "flash-sale" | "buy_x_get_y";
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: "upcoming" | "ongoing" | "expired";
  applicableProducts: string[];
}

const DiscountPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get("http://localhost:8080/discount/all", {
          headers: { accessToken },
        });
        console.log(response.data);
        setDiscounts(response.data);
      } catch (error) {
        console.error("Error fetching discounts:", error);
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
        case "Buy X Get Y":
        case "Flashsale":
          return (
            discount.type.toLowerCase().replace("-", " ") ===
            filter.toLowerCase()
          );
        default:
          return true;
      }
    });
  };

  const renderDiscountSlider = (filteredDiscounts: Discount[]) => (
    <Carousel className="w-full">
      <CarouselContent>
        {filteredDiscounts.map((discount, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
            <div className="p-1">
              <DiscountTicket discount={discount} onSelect={() => {}} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );

  const tabItems = [
    "Upcoming",
    "Ongoing",
    "Expired",
    "Active",
    "Non-active",
    "Percentage",
    "Fixed",
    "Buy X Get Y",
    "Flashsale",
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Discount Management</h1>
      <Tabs defaultValue="Ongoing" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
          {tabItems.map((item) => (
            <TabsTrigger key={item} value={item} className="px-4 py-2">
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabItems.map((item) => (
          <TabsContent key={item} value={item}>
            <Card>
              <CardContent className="pt-4 bg-background">
                {renderDiscountSlider(filterDiscounts(item))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default DiscountPage;

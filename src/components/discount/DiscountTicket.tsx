import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tag, Calendar, Clock } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import DiscountTicketDialog from "./DiscountTicketDialog";

interface DiscountValue {
  buyQuantity: number;
  getFreeQuantity: number;
}

interface Discount {
  _id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed" | "flash-sale" | "buy_x_get_y";
  value: number | DiscountValue;
  startDate: string;
  endDate: string;
  isActive: boolean;
  currentUses?: number;
  maxUses?: number;
  applicableProducts?: string[];
}

interface DiscountTicketProps {
  discount: Discount;
  onSelect: (discount: Discount) => void;
}

const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const StatusTag: React.FC<{ status: string }> = ({ status }) => {
  const colorMap: Record<string, string> = {
    upcoming: "bg-blue-500",
    ongoing: "bg-green-500",
    expired: "bg-red-500",
  };

  return (
    <Badge className={`${colorMap[status]} text-white`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const DiscountTicket: React.FC<DiscountTicketProps> = ({ discount }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const renderValue = () => {
    if (discount.type === "percentage" || discount.type === "fixed") {
      return `Discount ${discount.value}${
        discount.type === "percentage" ? "%" : "$"
      }`;
    } else if (
      discount.type === "buy_x_get_y" &&
      typeof discount.value === "object"
    ) {
      return `Buy ${discount.value.buyQuantity} get ${discount.value.getFreeQuantity}`;
    } else if (discount.type === "flash-sale") {
      return `Flashsale ${discount.value}%`;
    }
    return "";
  };

  const getStatus = () => {
    const now = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = new Date(discount.endDate);

    if (now < startDate) return "upcoming";
    if (now > endDate) return "expired";
    return "ongoing";
  };

  const status = getStatus();
  const usagePercentage =
    ((discount.currentUses || 0) / (discount.maxUses || 1)) * 100;
  const applicableProductsCount = discount.applicableProducts
    ? discount.applicableProducts.length
    : 0;

  const getBgColor = () => {
    if (!discount.isActive) return "bg-gray-700";
    switch (status) {
      case "upcoming":
        return "bg-blue-900";
      case "ongoing":
        return "bg-green-900";
      case "expired":
        return "bg-red-900";
      default:
        return "bg-slate-800";
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card
          className={`hover:cursor-pointer ${getBgColor()} text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg`}
          onClick={() => setIsDialogOpen(true)}
        >
          <CardHeader className="p-4">
            <div className="flex justify-between items-center mb-2">
              <StatusTag status={status} />
              <Badge variant="secondary" className="bg-gray-200 text-gray-800">
                {discount.code}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold">{discount.name}</h3>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xl font-bold mb-2">{renderValue()}</p>
            <p className="text-sm text-gray-300 mb-2">
              {discount.isActive ? "Active" : "Inactive"}
            </p>
            <Separator className="my-3 bg-gray-600" />
            <div className="space-y-2">
              <div className="flex items-center text-xs text-gray-400">
                <Calendar className="w-4 h-4 mr-1" />
                <span>
                  {formatDate(discount.startDate)} -{" "}
                  {formatDate(discount.endDate)}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                <span>
                  {formatTime(discount.startDate)} -{" "}
                  {formatTime(discount.endDate)}
                </span>
              </div>
              <Progress value={Math.round(usagePercentage)} className="h-2" />
              <p className="text-xs text-gray-400">
                {Math.round(usagePercentage)}% used
              </p>
              <p className="text-xs text-gray-400 flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                {applicableProductsCount} product
                {applicableProductsCount !== 1 ? "s" : ""} applicable
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DiscountTicketDialog
          discount_id={discount._id}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DiscountTicket;

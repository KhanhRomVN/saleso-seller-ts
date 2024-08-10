import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlusIcon, TagIcon } from "lucide-react";
import axios from "axios";
import { BACKEND_URI } from "@/api";

type DiscountType = "percentage" | "fixed" | "flash-sale" | "buy_x_get_y";

interface DiscountValue {
  buyQuantity?: number;
  getFreeQuantity?: number;
}

interface Discount {
  _id: string;
  name: string;
  code: string;
  type: DiscountType;
  value: number | DiscountValue;
  startDate: string;
  endDate: string;
  isActive: boolean;
  currentUses: number;
  maxUses: number;
  applicableProducts?: string[];
}

interface Product {
  _id: string;
  upcoming_discounts: Discount[];
  ongoing_discounts: Discount[];
  expired_discounts: Discount[];
}

interface StatusTagProps {
  status: "upcoming" | "ongoing" | "expired";
}

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const colorMap = {
    upcoming: "bg-blue-500",
    ongoing: "bg-green-500",
    expired: "bg-red-500",
  };

  return (
    <Badge className={`${colorMap[status]} absolute top-2 right-2`}>
      {status}
    </Badge>
  );
};

interface DiscountTicketProps {
  discount: Discount;
  onSelect: (discount: Discount) => void;
  onApply: (discount: Discount) => void;
}

const DiscountTicket: React.FC<DiscountTicketProps> = ({
  discount,
  onSelect,
  onApply,
}) => {
  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderValue = () => {
    if (
      discount.type === "percentage" ||
      discount.type === "fixed" ||
      discount.type === "flash-sale"
    ) {
      return `Discount ${discount.value}${
        discount.type === "percentage" ? "%" : "$"
      }`;
    } else if (
      discount.type === "buy_x_get_y" &&
      typeof discount.value === "object"
    ) {
      return `Buy ${discount.value.buyQuantity} get ${discount.value.getFreeQuantity}`;
    }
    return "";
  };

  const getStatus = (): "upcoming" | "ongoing" | "expired" => {
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

  return (
    <Card
      className={`hover:bg-gray-800 cursor-pointer ${
        discount.isActive ? "bg-gray-700" : "bg-gray-800"
      } text-white relative`}
      onClick={() => onSelect(discount)}
    >
      <StatusTag status={status} />
      <CardHeader>
        <CardTitle className="text-lg">{discount.name}</CardTitle>
        <Badge variant="secondary">{discount.code}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-300">{renderValue()}</p>
        <p className="text-sm text-gray-300">
          {discount.isActive ? "Active" : "Inactive"}
        </p>
        <div className="space-y-1">
          <p className="text-xs text-gray-400">
            {formatDate(discount.startDate)} - {formatDate(discount.endDate)}
            {discount.type === "flash-sale" && (
              <>
                {formatTime(discount.startDate)} -{" "}
                {formatTime(discount.endDate)}
              </>
            )}
          </p>
          <Progress value={usagePercentage} className="w-full" />
          <p className="text-xs text-gray-400">
            {Math.round(usagePercentage)}% used
          </p>
          <p className="text-xs text-gray-400 flex items-center">
            <TagIcon className="w-4 h-4 mr-1" /> {applicableProductsCount}{" "}
            product{applicableProductsCount !== 1 ? "s" : ""} applicable
          </p>
        </div>
      </CardContent>
      <Button
        size="icon"
        className="absolute bottom-2 right-2"
        onClick={(e) => {
          e.stopPropagation();
          onApply(discount);
        }}
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
    </Card>
  );
};

interface AvailableDiscountsProps {
  product: Product;
}

const AvailableDiscounts: React.FC<AvailableDiscountsProps> = ({ product }) => {
  const [availableDiscounts, setAvailableDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await axios.get<Discount[]>(
          `${BACKEND_URI}/discount/upcoming`,
          {
            headers: { accessToken },
          }
        );
        const allDiscounts = response.data;
        const existingDiscountIds = [
          ...product.upcoming_discounts,
          ...product.ongoing_discounts,
          ...product.expired_discounts,
        ].map((d) => d._id);

        const filteredDiscounts = allDiscounts.filter(
          (d) => !existingDiscountIds.includes(d._id)
        );
        setAvailableDiscounts(filteredDiscounts);
      } catch (err) {
        setError("Failed to fetch discounts");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, [product, accessToken]);

  const handleApplyDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsModalVisible(true);
  };

  const handleConfirmApply = async () => {
    if (!selectedDiscount) return;

    try {
      await axios.post(
        `${BACKEND_URI}/discount/apply`,
        {
          productId: product._id,
          discountId: selectedDiscount._id,
        },
        {
          headers: { accessToken },
        }
      );
      setIsModalVisible(false);
    } catch (err) {
      setError("Failed to apply discount");
    }
  };

  if (loading) return <div>Loading available discounts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Available Discounts</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableDiscounts.map((discount) => (
          <DiscountTicket
            key={discount._id}
            discount={discount}
            onSelect={() => {}} // Implement if needed
            onApply={handleApplyDiscount}
          />
        ))}
      </div>
      <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>
              You want to apply this discount for product?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalVisible(false)}>
              No
            </Button>
            <Button onClick={handleConfirmApply}>Yes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvailableDiscounts;

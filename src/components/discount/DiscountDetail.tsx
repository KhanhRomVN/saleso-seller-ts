import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  minimumPurchase?: number;
  customerUsageLimit?: number;
}

interface DiscountDetailProps {
  discountData: Discount;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveChanges: () => void;
}

const DiscountDetail: React.FC<DiscountDetailProps> = ({
  discountData,
  handleInputChange,
  handleSaveChanges,
}) => {
  const formatDiscountValue = (value: number | DiscountValue): string => {
    if (typeof value === "object") {
      return `Buy ${value.buyQuantity} Get ${value.getFreeQuantity}`;
    }
    return value.toString();
  };

  const toggleActive = () => {
    handleInputChange({
      target: {
        name: "isActive",
        type: "checkbox",
        checked: !discountData.isActive,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <Card className="w-full mx-auto bg-background_secondary">
      <CardHeader>
        <CardTitle>Discount Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Name & Code */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={discountData.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              value={discountData.code}
              onChange={handleInputChange}
              readOnly
            />
          </div>
        </div>
        {/* Type & Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              name="type"
              value={discountData.type}
              onChange={handleInputChange}
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              name="value"
              value={formatDiscountValue(discountData.value)}
              onChange={handleInputChange}
              readOnly
            />
          </div>
        </div>
        {/* startDate & endDate */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="datetime-local"
              value={discountData.startDate.slice(0, 16)}
              onChange={handleInputChange}
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="datetime-local"
              value={discountData.endDate.slice(0, 16)}
              onChange={handleInputChange}
              readOnly
            />
          </div>
        </div>
        {/* minimumPurchase & customerUsageLimit*/}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minimumPurchase">Minimum Purchase</Label>
            <Input
              id="minimumPurchase"
              name="minimumPurchase"
              value={discountData.minimumPurchase}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="customerUsageLimit">Customer Usage Limit</Label>
            <Input
              id="customerUsageLimit"
              name="customerUsageLimit"
              value={discountData.customerUsageLimit}
              onChange={handleInputChange}
              readOnly
            />
          </div>
        </div>
        {/* maxUses & currentUses & Active Button */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="maxUses">Max Uses</Label>
            <Input
              id="maxUses"
              name="maxUses"
              value={discountData.maxUses}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="currentUses">Current Uses</Label>
            <Input
              id="currentUses"
              name="currentUses"
              value={discountData.currentUses}
              onChange={handleInputChange}
              readOnly
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={toggleActive}
              variant={discountData.isActive ? "default" : "outline"}
              className="w-full"
            >
              {discountData.isActive ? "Active" : "Inactive"}
            </Button>
          </div>
        </div>

        <Button onClick={handleSaveChanges} className="w-full">
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default DiscountDetail;

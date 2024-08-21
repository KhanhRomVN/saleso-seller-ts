import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Bookmark, ToggleLeft } from "lucide-react";

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

  const inputVariants = {
    focus: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <Card className="w-full mx-auto bg-background_secondary">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Tag className="mr-2" />
          Discount Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name & Code */}
        <motion.div className="grid grid-cols-2 gap-4" layout>
          <div>
            <Label htmlFor="name">Name</Label>
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              whileTap="tap"
            >
              <Input
                id="name"
                name="name"
                value={discountData.name}
                onChange={handleInputChange}
              />
            </motion.div>
          </div>
          <div>
            <Label htmlFor="code">Code</Label>
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              whileTap="tap"
            >
              <Input
                id="code"
                name="code"
                value={discountData.code}
                onChange={handleInputChange}
                readOnly
              />
            </motion.div>
          </div>
        </motion.div>
        {/* Type & Value */}
        <motion.div className="grid grid-cols-2 gap-4" layout>
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
        </motion.div>
        {/* startDate & endDate */}
        <motion.div className="grid grid-cols-2 gap-4" layout>
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
        </motion.div>
        {/* minimumPurchase & customerUsageLimit*/}
        <motion.div className="grid grid-cols-2 gap-4" layout>
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
        </motion.div>

        <motion.div className="grid grid-cols-3 gap-4" layout>
          <div>
            <Label htmlFor="maxUses">Max Uses</Label>
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              whileTap="tap"
            >
              <Input
                id="maxUses"
                name="maxUses"
                value={discountData.maxUses}
                onChange={handleInputChange}
              />
            </motion.div>
          </div>
          <div>
            <Label htmlFor="currentUses">Current Uses</Label>
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              whileTap="tap"
            >
              <Input
                id="currentUses"
                name="currentUses"
                value={discountData.currentUses}
                onChange={handleInputChange}
                readOnly
              />
            </motion.div>
          </div>
          <div className="flex items-end">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <Button
                onClick={toggleActive}
                variant={discountData.isActive ? "default" : "outline"}
                className="w-full"
              >
                <ToggleLeft className="mr-2" />
                {discountData.isActive ? "Active" : "Inactive"}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full"
        >
          <Button onClick={handleSaveChanges} className="w-full">
            <Bookmark className="mr-2" />
            Save Changes
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default DiscountDetail;

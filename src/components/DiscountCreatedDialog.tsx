import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface DiscountData {
  name: string;
  code: string;
  type: "percentage" | "fixed" | "buy_x_get_y" | "flash-sale";
  value: number | { buyQuantity: number; getFreeQuantity: number };
  startDate: Date;
  endDate: Date;
  minimumPurchase: number;
  maxUses: number;
  customerUsageLimit: number;
}

interface DiscountCreatedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DiscountData) => void;
}

const DiscountCreatedDialog: React.FC<DiscountCreatedDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [discountData, setDiscountData] = useState<DiscountData>({
    name: "",
    code: "",
    type: "percentage",
    value: 0,
    startDate: new Date(),
    endDate: new Date(),
    minimumPurchase: 0,
    maxUses: 0,
    customerUsageLimit: 1,
  });

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (discountData.type === "flash-sale") {
      const endDate = new Date(discountData.startDate);
      endDate.setHours(endDate.getHours() + 1);
      setDiscountData((prev) => ({ ...prev, endDate }));
    }
  }, [discountData.type, discountData.startDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDiscountData((prev) => ({
      ...prev,
      [name]: name === "name" || name === "code" ? value : Number(value),
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setDiscountData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | null) => {
    if (date) {
      const now = new Date();
      if (date < now) {
        setErrors((prev) => [...prev, "Cannot select a date in the past"]);
        return;
      }
      setDiscountData((prev) => ({ ...prev, [name]: date }));
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    if (!discountData.name) newErrors.push("Discount name is required");
    if (!discountData.code) newErrors.push("Discount code is required");
    if (discountData.type === "flash-sale") {
      if (
        typeof discountData.value === "number" &&
        (discountData.value <= 40 || discountData.value >= 100)
      ) {
        newErrors.push("Flash sale discount must be between 40 and 100");
      }
    }
    // Add more validations as needed
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      console.log(discountData);

      const response = await axios.post(
        "http://localhost:8080/discount/create",
        discountData,
        {
          headers: {
            accessToken: accessToken,
          },
        }
      );

      console.log("Discount created successfully:", response.data);
      onSubmit(discountData);
      onClose();
    } catch (error) {
      console.error("Error creating discount:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create New Discount
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence>
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive">
                  <AlertDescription>
                    <ul>
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="limitations">Limitations</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Discount Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={discountData.name}
                    onChange={handleInputChange}
                    placeholder="Enter discount name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Discount Code</Label>
                  <Input
                    id="code"
                    name="code"
                    value={discountData.code}
                    onChange={handleInputChange}
                    placeholder="Enter discount code"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Discount Type</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="buy_x_get_y">
                      Buy X Get Y Free
                    </SelectItem>
                    <SelectItem value="flash-sale">Flash Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {discountData.type === "buy_x_get_y" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyQuantity">Buy Quantity</Label>
                    <Input
                      id="buyQuantity"
                      name="buyQuantity"
                      type="number"
                      value={
                        (
                          discountData.value as {
                            buyQuantity: number;
                            getFreeQuantity: number;
                          }
                        ).buyQuantity
                      }
                      onChange={(e) =>
                        setDiscountData((prev) => ({
                          ...prev,
                          value: {
                            ...(prev.value as {
                              buyQuantity: number;
                              getFreeQuantity: number;
                            }),
                            buyQuantity: Number(e.target.value),
                          },
                        }))
                      }
                      placeholder="Enter buy quantity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="getFreeQuantity">Get Free Quantity</Label>
                    <Input
                      id="getFreeQuantity"
                      name="getFreeQuantity"
                      type="number"
                      value={
                        (
                          discountData.value as {
                            buyQuantity: number;
                            getFreeQuantity: number;
                          }
                        ).getFreeQuantity
                      }
                      onChange={(e) =>
                        setDiscountData((prev) => ({
                          ...prev,
                          value: {
                            ...(prev.value as {
                              buyQuantity: number;
                              getFreeQuantity: number;
                            }),
                            getFreeQuantity: Number(e.target.value),
                          },
                        }))
                      }
                      placeholder="Enter free quantity"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="value">Discount Value</Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    value={discountData.value as number}
                    onChange={handleInputChange}
                    placeholder={`Enter discount ${
                      discountData.type === "percentage"
                        ? "percentage"
                        : "amount"
                    }`}
                    min={discountData.type === "flash-sale" ? 41 : 0}
                    max={discountData.type === "flash-sale" ? 99 : undefined}
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="conditions" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <DatePicker
                    id="startDate"
                    selected={discountData.startDate}
                    onChange={(date) => handleDateChange("startDate", date)}
                    showTimeSelect
                    timeFormat="HH:00"
                    timeIntervals={60}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:00 aa"
                    className="w-full bg-background_secondary p-2 rounded-md"
                    minDate={new Date()}
                  />
                </div>
                {discountData.type !== "flash-sale" && (
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <DatePicker
                      id="endDate"
                      selected={discountData.endDate}
                      onChange={(date) => handleDateChange("endDate", date)}
                      showTimeSelect
                      timeFormat="HH:00"
                      timeIntervals={60}
                      timeCaption="Time"
                      dateFormat="MMMM d, yyyy h:00 aa"
                      className="w-full bg-background_secondary p-2 rounded-md"
                      minDate={discountData.startDate}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumPurchase">Minimum Purchase</Label>
                <Input
                  id="minimumPurchase"
                  name="minimumPurchase"
                  type="number"
                  value={discountData.minimumPurchase}
                  onChange={handleInputChange}
                  placeholder="Enter minimum purchase amount"
                />
              </div>
            </TabsContent>
            <TabsContent value="limitations" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="maxUses">Maximum Uses</Label>
                <Input
                  id="maxUses"
                  name="maxUses"
                  type="number"
                  value={discountData.maxUses}
                  onChange={handleInputChange}
                  placeholder="Enter maximum uses"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerUsageLimit">Customer Usage Limit</Label>
                <Input
                  id="customerUsageLimit"
                  name="customerUsageLimit"
                  type="number"
                  value={discountData.customerUsageLimit}
                  onChange={handleInputChange}
                  placeholder="Enter customer usage limit"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="submit" className="w-full">
              Create Discount
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountCreatedDialog;

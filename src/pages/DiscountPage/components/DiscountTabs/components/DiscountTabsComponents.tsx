import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Tag,
  Edit,
  Calendar,
  DollarSign,
  User,
  Percent,
} from "lucide-react";
import { BACKEND_URI } from "@/api";

interface Discount {
  _id: string;
  name: string;
  code: string;
  type: string;
  value: number | { buyQuantity: number; getFreeQuantity: number };
  startDate: string;
  endDate: string;
  isActive: boolean;
  currentUses: number;
  maxUses: number;
  applicableProducts: string[];
  minimumPurchase: number;
}

interface Product {
  _id: string;
  name: string;
  images?: string[];
  price?: number;
  attributes?: Record<string, { price: string }[]>;
  upcoming_discounts?: string[];
  ongoing_discounts?: string[];
  expired_discounts?: string[];
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colorMap: Record<string, string> = {
    upcoming: "bg-yellow-500",
    ongoing: "bg-green-500",
    expired: "bg-red-500",
  };

  return (
    <Badge className={`absolute top-2 right-2 ${colorMap[status]}`}>
      {status.toUpperCase()}
    </Badge>
  );
};

const DiscountTicket: React.FC<{
  discount: Discount;
  onSelect: (discount: Discount) => void;
}> = ({ discount, onSelect }) => {
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

  return (
    <Card
      className={`hover:cursor-pointer ${
        discount.isActive ? "bg-blue-900" : "bg-gray-800"
      } text-white p-4`}
      onClick={() => onSelect(discount)}
    >
      <StatusBadge status={status} />
      <CardHeader className="p-0">
        <h5 className="text-lg font-bold mb-2">{discount.name}</h5>
        <Badge variant="secondary" className="mb-2">
          {discount.code}
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-sm text-gray-300 mb-1">{renderValue()}</p>
        <p className="text-sm text-gray-300 mb-1">
          {discount.isActive ? "Active" : "Inactive"}
        </p>
        <Separator className="my-2" />
        <div className="space-y-2">
          <p className="text-sm text-gray-300">
            {formatDate(discount.startDate)} - {formatDate(discount.endDate)}
            {discount.type === "flash-sale" && (
              <>
                {formatTime(discount.startDate)} -{" "}
                {formatTime(discount.endDate)}
              </>
            )}
          </p>
          <Progress value={Math.round(usagePercentage)} className="h-2" />
          <p className="text-sm text-gray-300">
            <Tag className="mr-1" size={16} />
            {applicableProductsCount} product
            {applicableProductsCount !== 1 ? "s" : ""} applicable
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const DiscountGrid: React.FC<{
  discounts: Discount[];
  onSelectDiscount: (discount: Discount) => void;
}> = ({ discounts, onSelectDiscount }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const pageCount = Math.ceil(discounts.length / itemsPerPage);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, pageCount - 1));

  const currentDiscounts = discounts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentDiscounts.map((discount, idx) => (
          <DiscountTicket
            key={idx}
            discount={discount}
            onSelect={onSelectDiscount}
          />
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <Button onClick={handlePrevPage} disabled={currentPage === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === pageCount - 1}
          className="ml-2"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const DiscountDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  discount: Discount | null;
  onUpdateDiscount: (id: string, field: string, value: any) => void;
}> = ({ isOpen, onClose, discount, onUpdateDiscount }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && discount) {
      fetchProducts();
    }
  }, [isOpen, discount]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      const seller_id = currentUser.user_id;
      const { data } = await axios.get<Product[]>(
        `${BACKEND_URI}/product/by-seller/${seller_id}`
      );
      const filteredProducts = data.filter(
        (product) =>
          (product.price ||
            Math.max(
              ...Object.values(product.attributes || {}).flatMap((attr) =>
                attr.map((a) => parseFloat(a.price))
              )
            ) ||
            0) > (discount?.minimumPurchase || 0)
      );
      setProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDiscount = async (productId: string, checked: boolean) => {
    if (!discount) return;
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${BACKEND_URI}/discount/apply`,
        { productId, discountId: discount._id },
        { headers: { accessToken } }
      );

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? {
                ...product,
                ongoing_discounts: [
                  ...(product.ongoing_discounts || []),
                  discount._id,
                ],
              }
            : product
        )
      );

      toast({
        title: "Success",
        description: "Discount applied to product",
      });
    } catch (error) {
      console.error("Error applying discount:", error);
      toast({
        title: "Error",
        description: "Failed to apply discount",
        variant: "destructive",
      });
    }
  };

  const handleCancelDiscount = async (productId: string) => {
    if (!discount) return;
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${BACKEND_URI}/discount/cancel`,
        { productId, discountId: discount._id },
        { headers: { accessToken } }
      );

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? {
                ...product,
                ongoing_discounts: (product.ongoing_discounts || []).filter(
                  (id) => id !== discount._id
                ),
              }
            : product
        )
      );

      toast({
        title: "Success",
        description: "Discount removed from product",
      });
    } catch (error) {
      console.error("Error canceling discount:", error);
      toast({
        title: "Error",
        description: "Failed to remove discount",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async () => {
    if (!discount) return;
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${BACKEND_URI}/discount/${discount._id}/toggle-active`,
        {},
        { headers: { accessToken } }
      );
      onUpdateDiscount(discount._id, "isActive", !discount.isActive);
      toast({
        title: "Success",
        description: `Discount ${
          discount.isActive ? "deactivated" : "activated"
        } successfully`,
      });
    } catch (error) {
      console.error("Error toggling discount active status:", error);
      toast({
        title: "Error",
        description: "Failed to update discount active status",
        variant: "destructive",
      });
    }
  };

  if (!discount) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Discount Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1">
            <CardContent>
              <Input
                className="mb-4"
                value={discount.name}
                onChange={(e) =>
                  onUpdateDiscount(discount._id, "name", e.target.value)
                }
                placeholder="Discount Name"
              />
              <Button onClick={handleToggleActive}>
                {discount.isActive ? "Deactivate" : "Activate"} Discount
              </Button>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-semibold">Applicable Products</h3>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Apply Discount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>{product._id}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md mr-2"
                            />
                          )}
                          <span>{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        $
                        {(
                          product.price ||
                          Math.max(
                            ...Object.values(product.attributes || {}).flatMap(
                              (attr) => attr.map((a) => parseFloat(a.price))
                            )
                          ) ||
                          0
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={
                            product.upcoming_discounts?.includes(
                              discount._id
                            ) ||
                            product.ongoing_discounts?.includes(discount._id) ||
                            product.expired_discounts?.includes(discount._id)
                          }
                          onCheckedChange={(checked) =>
                            checked
                              ? handleApplyDiscount(product._id, checked)
                              : handleCancelDiscount(product._id)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { DiscountGrid, DiscountDetailModal };

import React, { useState, useEffect } from "react";
import axios from "axios";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Discount {
  _id: string;
  name: string;
  code: string;
  type: string;
  value: number;
  startDate: string;
  endDate: string;
  minimumPurchase: number;
  maxUses: number;
  customerUsageLimit: number;
  isActive: boolean;
  status: string;
}

interface Product {
  _id: string;
  name: string;
  images: string[];
  price?: number;
  attributes?: {
    [key: string]: Array<{ value: string; quantity: string; price: string }>;
  };
  units_sold: number;
  expired_discounts: string[];
  ongoing_discounts: string[];
  upcoming_discounts: string[];
}

const DiscountTicketDialog: React.FC<{
  discount_id: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ discount_id, isOpen, onClose }) => {
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      try {
        setLoading(true);
        const [discountResponse, productsResponse] = await Promise.all([
          axios.get(`http://localhost:8080/discount/${discount_id}`),
          axios.get(
            `http://localhost:8080/product/by-seller/${
              JSON.parse(localStorage.getItem("currentUser") || "{}").user_id
            }`
          ),
        ]);

        setDiscount(discountResponse.data);
        setProducts(productsResponse.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data: " + err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [discount_id, isOpen]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getMinPrice = (product: Product) => {
    if (product.price) return product.price;
    if (product.attributes) {
      const prices = Object.values(product.attributes).flatMap((attr) =>
        attr.map((item) => parseFloat(item.price))
      );
      return Math.min(...prices);
    }
    return 0;
  };

  const getDiscountStatus = (product: Product) => {
    if (product.ongoing_discounts.includes(discount_id)) return "Ongoing";
    if (product.upcoming_discounts.includes(discount_id)) return "Upcoming";
    if (product.expired_discounts.includes(discount_id)) return "Expired";
    return "Not Applied";
  };

  const filteredProducts = products.filter(
    (product) => getMinPrice(product) > (discount?.minimumPurchase || 0)
  );

  return (
    <div className="flex flex-col max-w-4xl mx-auto">
      <DialogHeader>
        <DialogTitle>Discount Details</DialogTitle>
      </DialogHeader>
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {discount && (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold">Name:</span>
            <span>{discount.name}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold">Code:</span>
            <span>{discount.code}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold">Type:</span>
            <span>{discount.type}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold">Value:</span>
            <span>{discount.value}%</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold">Start Date:</span>
            <span>{formatDate(discount.startDate)}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold">End Date:</span>
            <span>{formatDate(discount.endDate)}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold">Minimum Purchase:</span>
            <span>${discount.minimumPurchase}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold">Max Uses:</span>
            <span>{discount.maxUses}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold">Usage Limit per Customer:</span>
            <span>{discount.customerUsageLimit}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold">Active:</span>
            <Badge variant={discount.isActive ? "success" : "destructive"}>
              {discount.isActive ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold">Status:</span>
            <Badge
              variant={
                discount.status === "expired" ? "destructive" : "success"
              }
            >
              {discount.status}
            </Badge>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Eligible Products</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Units Sold</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product, index) => (
              <TableRow key={product._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <span>{product.name}</span>
                  </div>
                </TableCell>
                <TableCell>${getMinPrice(product).toFixed(2)}</TableCell>
                <TableCell>{product.units_sold}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      getDiscountStatus(product) === "Not Applied"
                        ? "secondary"
                        : "primary"
                    }
                  >
                    {getDiscountStatus(product)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Apply Discount</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DiscountTicketDialog;

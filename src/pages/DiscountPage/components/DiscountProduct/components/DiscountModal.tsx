import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPrice } from "../utils/helpers";
import AvailableDiscounts from "./AvailableDiscounts";

interface Product {
  _id: string;
  name: string;
  price: number;
  brand: string;
  countryOfOrigin: string;
  upcoming_discounts: Discount[];
  ongoing_discounts: Discount[];
  expired_discounts: Discount[];
}

interface Discount {
  _id: string;
  name: string;
  code: string;
  type: "fixed" | "percentage";
  value: number;
  startDate: string;
  endDate: string;
}

interface ProductInfoProps {
  product: Product;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-2">Product Information</h3>
    <p className="mb-1">
      <strong>Name:</strong> {product.name}
    </p>
    <p className="mb-1">
      <strong>Price:</strong> ${getPrice(product)}
    </p>
    <p className="mb-1">
      <strong>Brand:</strong> {product.brand}
    </p>
    <p className="mb-1">
      <strong>Country of Origin:</strong> {product.countryOfOrigin}
    </p>
  </div>
);

interface DiscountTableProps {
  title: string;
  discounts: Discount[];
}

const DiscountTable: React.FC<DiscountTableProps> = ({ title, discounts }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discounts.map((discount, index) => (
            <TableRow key={discount._id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{discount.name}</TableCell>
              <TableCell>{discount.code}</TableCell>
              <TableCell>{discount.type}</TableCell>
              <TableCell>
                {discount.type === "fixed"
                  ? `$${discount.value}`
                  : `${discount.value}%`}
              </TableCell>
              <TableCell>
                {new Date(discount.startDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(discount.endDate).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

interface DiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const DiscountModal: React.FC<DiscountModalProps> = ({
  open,
  onOpenChange,
  product,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Discount</DialogTitle>
        </DialogHeader>
        {product && (
          <>
            <ProductInfo product={product} />
            <DiscountTable
              title="Upcoming Discounts"
              discounts={product.upcoming_discounts}
            />
            <DiscountTable
              title="Ongoing Discounts"
              discounts={product.ongoing_discounts}
            />
            <DiscountTable
              title="Expired Discounts"
              discounts={product.expired_discounts}
            />
            <AvailableDiscounts product={product} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DiscountModal;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Package,
  Truck,
  CreditCard,
  Tag,
  File,
  User,
  Mail,
  ShoppingCart,
  DollarSign,
} from "lucide-react";

interface InvoiceData {
  invoice_id: string;
  issue_date: string;
  due_date: string;
  invoice_status: string;
  logs: string[];
  seller_id: string;
  customer_id: string;
  customer_username: string;
  customer_email: string;
  product_id: string;
  product_name: string;
  product_image: string;
  product_price: number;
  quantity: number;
  shipping_fee: number;
  shipping_address: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  product_attributes_value?: string;
  discount_id?: string;
  discount_type?: string;
  discount_value?: number;
}

const InvoiceDetail: React.FC = () => {
  const { invoice_id } = useParams<{ invoice_id: string }>();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/invoice/${invoice_id}`
        );
        setInvoiceData(response.data);
      } catch (error) {
        console.error("Error fetching invoice data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [invoice_id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getDiscountValue = (
    type: string | undefined,
    value: number | undefined
  ) => {
    if (!type || !value) return null;
    if (type === "flash-sale" || type === "percentage") {
      return `- ${value}%`;
    } else if (type === "fixed") {
      return `- $${value}`;
    } else if (type === "buy_x_get_y") {
      return `${value}`;
    }
  };

  const InfoItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
  }> = ({ icon, label, value }) => (
    <motion.div
      className="flex items-center space-x-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {icon}
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-500">{value}</p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-2">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="container mx-auto p-2">Failed to load invoice data.</div>
    );
  }

  return (
    <motion.div
      className="container mx-auto p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.p
            className="text-sm text-gray-500 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/invoice/management")}
          >
            Invoice Management / Invoice Detail
          </motion.p>
          <motion.h1
            className="text-3xl font-bold mt-2 flex items-center"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <File className="mr-2" />
            Invoice ID: #{invoiceData.invoice_id}
          </motion.h1>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Badge
              className={`${getStatusColor(
                invoiceData.payment_status
              )} text-white mt-2`}
            >
              {invoiceData.payment_status}
            </Badge>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="md:col-span-2 bg-background_secondary transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <File className="mr-2" /> Invoice Detail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              <InfoItem
                icon={<Mail className="h-5 w-5 text-gray-500" />}
                label="Bill to:"
                value={invoiceData.customer_email}
              />
              <InfoItem
                icon={<User className="h-5 w-5 text-gray-500" />}
                label="Bill detail:"
                value={invoiceData.customer_username}
              />
              <InfoItem
                icon={<File className="h-5 w-5 text-gray-500" />}
                label="Invoice number:"
                value={invoiceData.invoice_id}
              />
              <InfoItem
                icon={<Calendar className="h-5 w-5 text-gray-500" />}
                label="Issue date:"
                value={formatDate(invoiceData.issue_date)}
              />
              <InfoItem
                icon={<Calendar className="h-5 w-5 text-gray-500" />}
                label="Due date:"
                value={formatDate(invoiceData.due_date)}
              />
            </motion.div>

            <Separator className="my-6" />

            <motion.h2
              className="text-xl font-semibold mb-4 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ShoppingCart className="mr-2" /> Product Detail
            </motion.h2>
            <motion.div
              className="flex items-center space-x-4 mb-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <img
                src={invoiceData.product_image}
                alt={invoiceData.product_name}
                className="w-16 h-16 object-cover rounded transition-transform duration-300 hover:scale-110"
              />
              <div>
                <p className="font-medium">{invoiceData.product_name}</p>
                <p className="text-sm text-gray-500">
                  Quantity: {invoiceData.quantity}
                </p>
                {invoiceData.product_attributes_value && (
                  <p className="text-sm text-gray-500">
                    Attributes: {invoiceData.product_attributes_value}
                  </p>
                )}
              </div>
            </motion.div>

            <Separator className="my-6" />

            <motion.div
              className="space-y-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span>${invoiceData.product_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>x {invoiceData.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping fee:</span>
                  <span>+ ${invoiceData.shipping_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    $
                    {(
                      invoiceData.product_price * invoiceData.quantity +
                      invoiceData.shipping_fee
                    ).toFixed(2)}
                  </span>
                </div>
                {invoiceData.discount_value && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount ({invoiceData.discount_type}):</span>
                    <span>
                      {getDiscountValue(
                        invoiceData.discount_type,
                        invoiceData.discount_value
                      )}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${invoiceData.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        <Card className="bg-background_secondary transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2" /> Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              <div className="space-y-4">
                <InfoItem
                  icon={<File className="h-5 w-5 text-gray-500" />}
                  label="Invoice Status"
                  value={invoiceData.invoice_status}
                />
                <InfoItem
                  icon={<Package className="h-5 w-5 text-gray-500" />}
                  label="Product ID"
                  value={invoiceData.product_id}
                />
                <InfoItem
                  icon={<Truck className="h-5 w-5 text-gray-500" />}
                  label="Shipping Address"
                  value={invoiceData.shipping_address}
                />
                <InfoItem
                  icon={<CreditCard className="h-5 w-5 text-gray-500" />}
                  label="Payment Method"
                  value={invoiceData.payment_method}
                />
                {invoiceData.discount_id && (
                  <InfoItem
                    icon={<Tag className="h-5 w-5 text-gray-500" />}
                    label="Discount"
                    value={invoiceData.discount_type || ""}
                  />
                )}
              </div>
            </motion.div>

            <Separator className="my-6" />

            <motion.h3
              className="font-semibold mb-2 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <DollarSign className="mr-2" /> Logs
            </motion.h3>
            <motion.ul
              className="list-disc list-inside space-y-1"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {invoiceData.logs.map((log, index) => (
                <motion.li
                  key={index}
                  className="text-sm text-gray-600"
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  {log}
                </motion.li>
              ))}
            </motion.ul>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default InvoiceDetail;

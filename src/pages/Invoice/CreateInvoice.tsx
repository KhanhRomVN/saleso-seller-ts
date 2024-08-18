import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfToday, addDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  DollarSign,
  Package,
  Truck,
  CreditCard,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface OrderData {
  order_id: string;
  customer_id: string;
  username: string;
  email: string;
  product_id: string;
  name: string;
  image: string;
  shipping_address: string;
  price: number;
  quantity: number;
  total: number;
  payment_method: string;
  payment_status: string;
  selected_attributes_value?: string;
  discount_type?: string;
  discount_value?: number;
}

const CreateInvoice = () => {
  const { order_id } = useParams<{ order_id: string }>();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [invoiceName, setInvoiceName] = useState("");
  const [issueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 30));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(
          `http://localhost:8080/invoice/by-order/${order_id}`,
          { headers: { accessToken } }
        );
        setOrderData(response.data);
      } catch (error) {
        console.error("Error fetching order data:", error);
        toast.error("Failed to fetch order data");
      }
    };

    fetchOrderData();
  }, [order_id]);

  const handleCreateInvoice = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const requestBody = {
        order_id,
        due_date: dueDate,
      };

      await axios.post("http://localhost:8080/invoice/accept", requestBody, {
        headers: { accessToken },
      });
      toast.success("Invoice created successfully!");
      navigate("/invoice/management");
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleRefuseOrder = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:8080/invoice/refuse",
        { order_id },
        { headers: { accessToken } }
      );
      toast.success("Order refused successfully!");
      navigate("/invoice/management");
    } catch (error) {
      console.error("Error refusing order:", error);
      toast.error("Failed to refuse order");
    } finally {
      setLoading(false);
    }
  };

  if (!orderData)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-4 space-y-6"
      >
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700">Order & Invoice</h1>
          <Button
            onClick={() => navigate("/invoice/management")}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Cancel</span>
          </Button>
        </div>

        <Card className="bg-background_secondary">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-700">
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={orderData.username}
                disabled
                placeholder="Username"
              />
              <Input value={orderData.email} placeholder="Email" readOnly />
              <Input
                value={invoiceName}
                onChange={(e) => setInvoiceName(e.target.value)}
                placeholder="Invoice Name (Optional)"
              />
              <Input
                value={format(issueDate, "PPP")}
                disabled
                placeholder="Issue Date"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Due Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                    disabled={(date) => date < startOfToday()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input value="USD" disabled placeholder="Currency" className="" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background_secondary">
          <CardHeader>
            <CardTitle className="text-2xl text-green-700">
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={orderData.image}
                  alt={orderData.name}
                  className="w-20 h-20 object-cover rounded-lg shadow-md"
                />
                <div>
                  <h3 className="font-bold text-lg">{orderData.name}</h3>
                  <p className="text-sm text-gray-600">
                    {orderData.selected_attributes_value}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Truck className="mr-2 text-blue-500" />
                  <p>
                    <strong>Shipping Address:</strong>{" "}
                    {orderData.shipping_address}
                  </p>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-2 text-green-500" />
                  <p>
                    <strong>Price:</strong> ${orderData.price}
                  </p>
                </div>
                <div className="flex items-center">
                  <Package className="mr-2 text-purple-500" />
                  <p>
                    <strong>Quantity:</strong> {orderData.quantity}
                  </p>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-2 text-yellow-500" />
                  <p>
                    <strong>Total:</strong> ${orderData.total}
                  </p>
                </div>
                <div className="flex items-center">
                  <CreditCard className="mr-2 text-indigo-500" />
                  <p>
                    <strong>Payment Method:</strong> {orderData.payment_method}
                  </p>
                </div>
                <div className="flex items-center">
                  <AlertCircle className="mr-2 text-red-500" />
                  <p>
                    <strong>Payment Status:</strong> {orderData.payment_status}
                  </p>
                </div>
              </div>
              {orderData.discount_type && (
                <div className="flex items-center bg-yellow-100 p-2 rounded-md">
                  <DollarSign className="mr-2 text-yellow-600" />
                  <p>
                    <strong>Discount:</strong> {orderData.discount_type} -{" "}
                    {orderData.discount_value}%
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button
            onClick={handleRefuseOrder}
            className="flex-1 bg-red-500 hover:bg-red-600 transition-colors duration-300"
            disabled={loading}
          >
            Refuse Order
          </Button>
          <Button
            onClick={handleCreateInvoice}
            className="flex-1 bg-green-500 hover:bg-green-600 transition-colors duration-300"
            disabled={loading}
          >
            Create Invoice
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateInvoice;

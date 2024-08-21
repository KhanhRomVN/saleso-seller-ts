import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreVertical, Eye, FileText, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Order {
  _id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  total_amount: number;
  order_status: string;
}

const PendingOrder: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(
          "http://localhost:8080/order/pending",
          {
            headers: { accessToken },
          }
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const handleViewProduct = (orderId: string) => {
    navigate(`/invoice/create/${orderId}`);
  };

  const handleCreateInvoice = async (orderId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:8080/invoice/accept",
        { order_id: orderId },
        { headers: { accessToken } }
      );
      // Refresh orders after creating invoice
      const response = await axios.get("http://localhost:8080/order/pending", {
        headers: { accessToken },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleRefuseOrder = async (orderId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:8080/invoice/refuse",
        { order_id: orderId },
        { headers: { accessToken } }
      );
      // Refresh orders after refusing order
      const response = await axios.get("http://localhost:8080/order/pending", {
        headers: { accessToken },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error refusing order:", error);
    }
  };

  return (
    <div className=" selection:rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-background_secondary">
          {orders.map((order, index) => (
            <TableRow key={order._id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <img
                    src={order.product_image}
                    alt={order.product_name}
                    className="h-8 w-8 mr-2"
                  />
                  <span>{order.product_name}</span>
                </div>
              </TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>${order.total_amount.toFixed(2)}</TableCell>
              <TableCell>{order.order_status}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-5 w-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleViewProduct(order._id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      <span>View Product</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleCreateInvoice(order._id)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Create Invoice</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRefuseOrder(order._id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      <span>Refuse Order</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingOrder;

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
import { DollarSign, ShoppingCart } from "lucide-react";

interface Invoice {
  _id: string;
  image: string;
  name: string;
  username: string;
  price: number;
  quantity: number;
  discount_type?: string;
  discount_value?: number;
  total: number;
  payment_method: string;
  payment_status: string;
}

const PendingOrder: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get("http://localhost:8080/invoice", {
          headers: { accessToken },
        });
        setInvoices(response.data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };
    fetchInvoices();
  }, []);

  const handleCreateInvoice = (orderId: string) => {
    navigate(`/invoice/create/${orderId}`);
  };

  return (
    <div className="bg-background_secondary p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Pending Orders</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice._id}>
              <TableCell>
                <img
                  src={invoice.image}
                  alt={invoice.name}
                  className="h-8 w-8"
                />
              </TableCell>
              <TableCell className="font-medium">{invoice.name}</TableCell>
              <TableCell>{invoice.username}</TableCell>
              <TableCell>${invoice.price.toFixed(2)}</TableCell>
              <TableCell>{invoice.quantity}</TableCell>
              <TableCell>
                {invoice.discount_type && invoice.discount_value
                  ? `${invoice.discount_type}: ${invoice.discount_value}%`
                  : "N/A"}
              </TableCell>
              <TableCell>${invoice.total.toFixed(2)}</TableCell>
              <TableCell>{invoice.payment_method}</TableCell>
              <TableCell>{invoice.payment_status}</TableCell>
              <TableCell>
                <button
                  onClick={() => handleCreateInvoice(invoice._id)}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  <ShoppingCart size={16} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingOrder;

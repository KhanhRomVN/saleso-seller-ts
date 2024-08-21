import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Eye, MoreHorizontal, Loader2, AlertCircle } from "lucide-react";
import { BACKEND_URI } from "@/api";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Invoice {
  _id: string;
  seller_id: string;
  customer_id: string;
  order_id: string;
  issue_date: string;
  due_date: string;
  logs: string[];
  invoice_status: string;
}

interface InvoiceListProps {
  status: "progress" | "success" | "failure";
}

const InvoiceList: React.FC<InvoiceListProps> = ({ status }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(
          `${BACKEND_URI}/invoice/list-invoice/${status}`,
          {
            headers: { accessToken },
          }
        );
        setInvoices(response.data);
      } catch (err) {
        setError("Failed to fetch invoices");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, [status]);

  const statusColor = useMemo(() => {
    switch (status) {
      case "progress":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "failure":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span>Error: {error}</span>
      </div>
    );
  }

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/invoice/${invoiceId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg shadow-lg overflow-x-auto"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No.</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Order ID</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-background_secondary">
          {invoices.map((invoice, index) => (
            <TableRow key={invoice._id} className="hover:bg-background">
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{invoice.customer_id}</TableCell>
              <TableCell>{invoice.order_id}</TableCell>
              <TableCell>
                {new Date(invoice.issue_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(invoice.due_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                >
                  {invoice.invoice_status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 ">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background">
                    <DropdownMenuItem
                      onClick={() => handleViewInvoice(invoice._id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      <span>View Invoice</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default InvoiceList;

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingOrder from "./PendingOrder";
import ProgressInvoice from "./ProgressInvoice";
import SuccessInvoice from "./SuccessInvoice";
import FailureInvoice from "./FailureInvoice";

const InvoiceManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Invoice Management</h1>
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending Order</TabsTrigger>
          <TabsTrigger value="progress">Progress Invoice</TabsTrigger>
          <TabsTrigger value="success">Success Invoice</TabsTrigger>
          <TabsTrigger value="failure">Failure Invoice</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <PendingOrder />
        </TabsContent>
        <TabsContent value="progress">
          <ProgressInvoice />
        </TabsContent>
        <TabsContent value="success">
          <SuccessInvoice />
        </TabsContent>
        <TabsContent value="failure">
          <FailureInvoice />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceManagementPage;

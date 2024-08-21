import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingOrder from "./PendingOrder";
import InvoiceList from "./InvoiceList";

const InvoiceManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto p-2">
      <p className="text-gray-500 mb-6">Invoice Management</p>
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
          <InvoiceList status="progress" />
        </TabsContent>
        <TabsContent value="success">
          <InvoiceList status="success" />
        </TabsContent>
        <TabsContent value="failure">
          <InvoiceList status="failure" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceManagementPage;

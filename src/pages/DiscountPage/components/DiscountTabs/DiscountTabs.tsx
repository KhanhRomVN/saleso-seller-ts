import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { BACKEND_URI } from "@/api";
import {
  DiscountGrid,
  DiscountDetailModal,
} from "./components/DiscountTabsComponents";

interface Discount {
  _id: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  [key: string]: any;
}

const DiscountTabs: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
    null
  );

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const { data } = await axios.get<Discount[]>(
          `${BACKEND_URI}/discount/all`,
          {
            headers: { accessToken },
          }
        );
        setDiscounts(data);
      } catch (error) {
        console.error("Error fetching discounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  const filterDiscounts = (filter: string): Discount[] => {
    const now = new Date();
    switch (filter) {
      case "upcoming":
        return discounts.filter((d) => new Date(d.startDate) > now);
      case "ongoing":
        return discounts.filter(
          (d) => new Date(d.startDate) <= now && new Date(d.endDate) >= now
        );
      case "expired":
        return discounts.filter((d) => new Date(d.endDate) < now);
      case "active":
        return discounts.filter((d) => d.isActive);
      case "non-active":
        return discounts.filter((d) => !d.isActive);
      default:
        return discounts;
    }
  };

  const handleSelectDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);
    setModalVisible(true);
  };

  const handleUpdateDiscount = async (
    discountId: string,
    field: string,
    value: any
  ) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.patch(
        `${BACKEND_URI}/discount/${discountId}/${field}`,
        { [field]: value },
        {
          headers: { accessToken },
        }
      );
      toast({
        title: "Success",
        description: `Discount ${field} updated successfully`,
      });
      // Update the local state
      setDiscounts(
        discounts.map((d) =>
          d._id === discountId ? { ...d, [field]: value } : d
        )
      );
    } catch (error) {
      console.error(`Error updating discount ${field}:`, error);
      toast({
        title: "Error",
        description: `Failed to update discount ${field}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Up Coming</TabsTrigger>
          <TabsTrigger value="ongoing">On Going</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="non-active">Non-Active</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DiscountGrid
            discounts={discounts}
            onSelectDiscount={handleSelectDiscount}
          />
        </TabsContent>
        <TabsContent value="upcoming">
          <DiscountGrid
            discounts={filterDiscounts("upcoming")}
            onSelectDiscount={handleSelectDiscount}
          />
        </TabsContent>
        <TabsContent value="ongoing">
          <DiscountGrid
            discounts={filterDiscounts("ongoing")}
            onSelectDiscount={handleSelectDiscount}
          />
        </TabsContent>
        <TabsContent value="expired">
          <DiscountGrid
            discounts={filterDiscounts("expired")}
            onSelectDiscount={handleSelectDiscount}
          />
        </TabsContent>
        <TabsContent value="active">
          <DiscountGrid
            discounts={filterDiscounts("active")}
            onSelectDiscount={handleSelectDiscount}
          />
        </TabsContent>
        <TabsContent value="non-active">
          <DiscountGrid
            discounts={filterDiscounts("non-active")}
            onSelectDiscount={handleSelectDiscount}
          />
        </TabsContent>
      </Tabs>
      <DiscountDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        discount={selectedDiscount}
        onUpdateDiscount={handleUpdateDiscount}
      />
    </div>
  );
};

export default DiscountTabs;

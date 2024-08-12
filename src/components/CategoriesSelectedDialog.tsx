import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ChevronDown } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  children?: Category[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategories: (categories: Category[]) => void;
}

const CategoriesSelectedDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectCategories,
}) => {
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, Category[] | null>
  >({});

  useEffect(() => {
    fetchRootCategories();
  }, []);

  const fetchRootCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/category/root");
      const data: Category[] = await response.json();
      setRootCategories(data);
    } catch (error) {
      console.error("Error fetching root categories:", error);
    }
  };

  const fetchChildCategories = async (
    categoryName: string
  ): Promise<Category[]> => {
    try {
      const response = await fetch(
        `http://localhost:8080/category/get/children/${categoryName}`
      );
      const data: Category[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching child categories:", error);
      return [];
    }
  };

  const handleCategoryClick = async (category: Category) => {
    if (!expandedCategories[category._id]) {
      const children = await fetchChildCategories(category.name);
      setExpandedCategories((prev) => ({
        ...prev,
        [category._id]: children,
      }));
    } else {
      setExpandedCategories((prev) => ({
        ...prev,
        [category._id]: null,
      }));
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.some((c) => c._id === category._id);
      if (isSelected) {
        return prev.filter((c) => c._id !== category._id);
      } else {
        return [...prev, category];
      }
    });
  };

  const renderCategory = (category: Category, depth = 0) => {
    const isExpanded = expandedCategories[category._id];
    const isSelected = selectedCategories.some((c) => c._id === category._id);

    return (
      <div key={category._id}>
        <div className={`flex items-center p-2 ${depth > 0 ? "ml-4" : ""}`}>
          {category.children && category.children.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => handleCategoryClick(category)}
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </Button>
          )}
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleCategorySelect(category)}
            id={category._id}
          />
          <label
            htmlFor={category._id}
            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {category.name}
          </label>
        </div>
        {isExpanded && (
          <div className="ml-4">
            {isExpanded.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Categories</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full pr-4">
          {rootCategories.map((category) => renderCategory(category))}
        </ScrollArea>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSelectCategories(selectedCategories);
              onClose();
            }}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoriesSelectedDialog;

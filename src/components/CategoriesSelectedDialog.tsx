import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ChevronDown, Loader2 } from "lucide-react";

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    const fetchRootCategories = async () => {
      setLoading(true);
      const data = await fetchCategories("http://localhost:8080/category/root");
      setRootCategories(data);
      setLoading(false);
    };
    fetchRootCategories();
  }, [fetchCategories]);

  const handleCategoryClick = useCallback(
    async (category: Category) => {
      if (expandedCategories.has(category._id)) {
        setExpandedCategories((prev) => {
          const newSet = new Set(prev);
          newSet.delete(category._id);
          return newSet;
        });
      } else {
        setLoading(true);
        const children = await fetchCategories(
          `http://localhost:8080/category/get/children/${category.name}`
        );
        category.children = children;
        setExpandedCategories((prev) => new Set(prev).add(category._id));
        setLoading(false);
      }
    },
    [expandedCategories, fetchCategories]
  );

  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategories((prev) =>
      prev.some((c) => c._id === category._id)
        ? prev.filter((c) => c._id !== category._id)
        : [...prev, category]
    );
  }, []);

  const renderCategory = useCallback(
    (category: Category, depth = 0) => {
      const isExpanded = expandedCategories.has(category._id);
      const isSelected = selectedCategories.some((c) => c._id === category._id);

      return (
        <div key={category._id} className="mb-1">
          <div
            className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${
              depth > 0 ? "ml-4" : ""
            }`}
          >
            {category.children && category.children.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 p-0 h-6 w-6"
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
              className="mr-2"
            />
            <label
              htmlFor={category._id}
              className="text-sm font-medium leading-none cursor-pointer select-none"
            >
              {category.name}
            </label>
          </div>
          {isExpanded && category.children && (
            <div className="ml-4 mt-1">
              {category.children.map((child) =>
                renderCategory(child, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    },
    [
      expandedCategories,
      selectedCategories,
      handleCategoryClick,
      handleCategorySelect,
    ]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Categories</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full pr-4 my-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            rootCategories.map((category) => renderCategory(category))
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSelectCategories(selectedCategories);
              onClose();
            }}
          >
            Confirm ({selectedCategories.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoriesSelectedDialog;

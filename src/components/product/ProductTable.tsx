import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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
import { Ellipsis, ChevronDown, ChevronUp } from "lucide-react";

interface Attribute {
  attributes_value: string;
  attributes_quantity: number;
  attributes_price: number;
}

interface Product {
  _id: string;
  name: string;
  images: string[];
  price?: number;
  attributes?: Attribute[];
  countryOfOrigin: string;
  stock?: number;
  units_sold: number;
  is_active: string;
  upcoming_discounts: string[];
  ongoing_discounts: string[];
  expired_discounts: string[];
}

interface Column {
  key: keyof Product | "actions" | "apply" | string;
  header: string;
  sortable?: boolean;
  render?: (product: Product) => React.ReactNode;
}

interface Action {
  label: string;
  onClick: (productId: string) => void;
}

interface ProductTableProps {
  columns: Column[];
  actions: Action[];
  discount_id?: string; // Make discount_id optional
}

const ProductTable: React.FC<ProductTableProps> = ({
  columns,
  actions,
  discount_id,
}) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const seller_id = currentUser.user_id;
  const [products, setProducts] = useState<Product[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: "asc" | "desc";
  } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(
          `http://localhost:8080/product/by-seller/${seller_id}`
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [seller_id]);

  const isProductAppliedToDiscount = (
    product: Product,
    discount_id?: string
  ): boolean => {
    if (!discount_id) return false; // Return false if discount_id is not provided
    return [
      ...product.upcoming_discounts,
      ...product.ongoing_discounts,
      ...product.expired_discounts,
    ].some((discount) => discount === discount_id);
  };

  const getPrice = (product: Product): string => {
    if (product.price !== undefined) {
      return `$${product.price}`;
    } else if (product.attributes) {
      const prices = product.attributes.map((attr) => attr.attributes_price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return `$${minPrice} - $${maxPrice}`;
    }
    return "N/A";
  };

  const getStock = (product: Product): number | string => {
    if (product.stock !== undefined) {
      return product.stock;
    } else if (product.attributes) {
      return product.attributes.reduce(
        (total, attr) => total + attr.attributes_quantity,
        0
      );
    }
    return "N/A";
  };

  const renderCell = (product: Product, column: Column): React.ReactNode => {
    if (column.render) {
      return column.render(product);
    }

    switch (column.key) {
      case "name":
        return (
          <div className="flex items-center space-x-2">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-10 h-10 object-cover rounded-full shadow-md transition-transform duration-300 hover:scale-110"
            />
            <span className="font-medium">{product.name}</span>
          </div>
        );
      case "price":
        return (
          <span className="font-semibold text-green-600">
            {getPrice(product)}
          </span>
        );
      case "stock":
        return <span className="font-semibold">{getStock(product)}</span>;
      case "is_active":
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              product.is_active === "Y"
                ? "bg-green-200 text-green-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            {product.is_active === "Y" ? "Active" : "Inactive"}
          </span>
        );
      case "apply":
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isProductAppliedToDiscount(product, discount_id)
                ? "bg-green-200 text-green-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            {isProductAppliedToDiscount(product, discount_id) ? "Yes" : "No"}
          </span>
        );
      case "actions":
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Ellipsis className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {actions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => action.onClick(product._id)}
                  className="cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      default:
        return product[column.key as keyof Product]?.toString() || "";
    }
  };

  const handleSort = (key: keyof Product) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = React.useMemo(() => {
    if (!sortConfig) return products;
    return [...products].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortConfig.direction === "asc" ? 1 : -1;
      if (bValue === undefined) return sortConfig.direction === "asc" ? -1 : 1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [products, sortConfig]);

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={column.sortable ? "cursor-pointer select-none" : ""}
                onClick={() =>
                  column.sortable && handleSort(column.key as keyof Product)
                }
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && (
                    <span className="text-gray-400">
                      {sortConfig?.key === column.key ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {sortedProducts.map((product) => (
              <motion.tr
                key={product._id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => setHoveredRow(product._id)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`transition-colors duration-200 ${
                  hoveredRow === product._id ? "bg-background_secondary" : ""
                }`}
              >
                {columns.map((column) => (
                  <TableCell key={`${product._id}-${column.key}`}>
                    {renderCell(product, column)}
                  </TableCell>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;

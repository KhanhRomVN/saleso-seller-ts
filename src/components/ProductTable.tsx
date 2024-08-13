import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { Ellipsis } from "lucide-react";

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
}

interface Column {
  key: keyof Product | "actions";
  header: string;
  render?: (product: Product) => React.ReactNode;
}

interface Action {
  label: string;
  onClick: (productId: string) => void;
}

interface ProductTableProps {
  columns: Column[];
  actions: Action[];
}

const ProductTable: React.FC<ProductTableProps> = ({ columns, actions }) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const seller_id = currentUser.user_id;
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/product/by-seller/${seller_id}`
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const getPrice = (product: Product) => {
    if (product.price) {
      return `$${product.price}`;
    } else if (product.attributes) {
      const prices = product.attributes.map((attr) => attr.attributes_price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return `$${minPrice} - $${maxPrice}`;
    }
    return "N/A";
  };

  const getStock = (product: Product) => {
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

  const renderCell = (product: Product, column: Column) => {
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
              className="w-10 h-10 object-cover rounded"
            />
            <span>{product.name}</span>
          </div>
        );
      case "price":
        return getPrice(product);
      case "stock":
        return getStock(product);
      case "is_active":
        return product.is_active === "Y" ? "Active" : "Inactive";
      case "actions":
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {actions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => action.onClick(product._id)}
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      default:
        return product[column.key as keyof Product];
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product, index) => (
          <TableRow key={product._id}>
            {columns.map((column) => (
              <TableCell key={`${product._id}-${column.key}`}>
                {renderCell(product, column)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductTable;

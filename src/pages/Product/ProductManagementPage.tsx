import React, { useState, useEffect } from "react";
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

const ProductManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      const sellerId = currentUser.user_id;
      try {
        const response = await axios.get(
          `http://localhost:8080/product/by-seller/${sellerId}`
        );
        console.log(response.data);

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

  return (
    <div className="w-full">
      <div></div>
      <div className="w-full bg-background_secondary">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">STT</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={product._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="flex items-center space-x-2">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <span>{product.name}</span>
                </TableCell>
                <TableCell>{getPrice(product)}</TableCell>
                <TableCell>{product.countryOfOrigin}</TableCell>
                <TableCell>{getStock(product)}</TableCell>
                <TableCell>{product.units_sold}</TableCell>
                <TableCell>
                  {product.is_active === "Y" ? "Active" : "Inactive"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Ellipsis className="h-5 w-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => navigate(`/product/edit/${product._id}`)}
                      >
                        Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem>Change Status</DropdownMenuItem>
                      <DropdownMenuItem>Delete Product</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductManagementPage;

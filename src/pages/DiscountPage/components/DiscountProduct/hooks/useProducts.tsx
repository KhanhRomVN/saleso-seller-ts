import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URI } from "@/api";

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const seller_id = JSON.parse(
          localStorage.getItem("currentUser")
        ).user_id;
        const response = await axios.get(
          `${BACKEND_URI}/product/discount/by-seller/${seller_id}`
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading };
};

export default useProducts;

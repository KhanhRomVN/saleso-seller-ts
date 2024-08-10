import { Button } from "@/components/ui/button";

const Header = () => (
  <div className="flex justify-between items-center mb-2">
    <div>
      <h1 className="text-2xl font-semibol">Discount</h1>
      <p>Up your sales with discounts!</p>
    </div>
    <div className="flex items-center">
      <Button className="ml-2">Product Discount</Button>
    </div>
  </div>
);

export default Header;

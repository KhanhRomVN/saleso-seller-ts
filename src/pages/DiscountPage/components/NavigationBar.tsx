import React from "react";
import { Button } from "@/components/ui/button";

interface NavigationBarProps {
  handleOpen: () => void; 
}

const NavigationBar: React.FC<NavigationBarProps> = ({ handleOpen }) => (
  <div className="flex justify-between items-center mb-2">
    <h1 className="text-lg font-semibold">Manage Discount</h1>
    <div className="flex">
      <Button variant="primary" onClick={handleOpen} className="mr-2">
        + New Discount
      </Button>
      <Button variant="secondary">Edit</Button>
    </div>
  </div>
);

export default NavigationBar;

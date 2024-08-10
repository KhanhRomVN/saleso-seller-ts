import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Record {
  price?: number;
  attributes?: {
    [key: string]: any;
  };
}

interface Discount {
  description: string;
}

export const getPrice = (record: Record): string => {
  if (typeof record.price === "number") {
    return record.price.toFixed(2);
  } else if (record.attributes && typeof record.attributes === "object") {
    const prices = Object.values(record.attributes)
      .flat()
      .map((attr) =>
        typeof attr === "object" && attr !== null ? attr.price : undefined
      )
      .filter((price): price is number => typeof price === "number");
    return prices.length > 0 ? Math.min(...prices).toFixed(2) : "N/A";
  }
  return "N/A";
};

export const truncateName = (name: string, maxLength: number = 30): string => {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

export const renderDiscounts = (
  discounts: Discount[],
  color: string
): React.ReactNode => {
  if (!discounts || discounts.length === 0) {
    return <span>N/A</span>;
  }

  return (
    <div className="flex items-center space-x-1">
      <Badge
        variant={
          color === "red"
            ? "destructive"
            : color === "green"
            ? "success"
            : "default"
        }
        className="m-0.5"
      >
        {discounts[0].description}
      </Badge>
      {discounts.length > 1 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={
                  color === "red"
                    ? "destructive"
                    : color === "green"
                    ? "success"
                    : "default"
                }
                className="m-0.5 cursor-help"
              >
                +{discounts.length - 1}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {discounts
                  .slice(1)
                  .map((d) => d.description)
                  .join(", ")}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

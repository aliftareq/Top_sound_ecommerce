import { filterOptions } from "@/config";
import { Fragment, useState } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { ChevronDown } from "lucide-react";

const FilterBody = ({ filters, handleFilter }) => {
  return (
    <div className="p-4 space-y-4">
      {Object.keys(filterOptions).map((keyItem) => (
        <Fragment key={keyItem}>
          <div>
            <h3 className="text-base font-bold">{keyItem}</h3>
            <div className="grid gap-2 mt-2">
              {filterOptions[keyItem].map((option) => (
                <Label
                  key={option.id}
                  className="flex font-medium items-center gap-2"
                >
                  <Checkbox
                    checked={
                      filters &&
                      Object.keys(filters).length > 0 &&
                      filters[keyItem] &&
                      filters[keyItem].indexOf(option.id) > -1
                    }
                    onCheckedChange={() => handleFilter(keyItem, option.id)}
                    className="border border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
                  />
                  {option.label}
                </Label>
              ))}
            </div>
          </div>
          <Separator />
        </Fragment>
      ))}
    </div>
  );
};

const ProductFilter = ({ filters, handleFilter }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop / Large screens (left sidebar as-is) */}
      <div className="hidden md:block bg-background rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-extrabold">Filters</h2>
        </div>

        <FilterBody filters={filters} handleFilter={handleFilter} />
      </div>

      {/* Mobile: button + top slide-down sheet */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-between"
            >
              <span className="font-extrabold">Filters</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </SheetTrigger>

          {/* Slide down from top */}
          <SheetContent side="top" className="p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-lg font-extrabold">
                Filters
              </SheetTitle>
            </SheetHeader>

            {/* Scrollable options */}
            <div className="max-h-[70vh] overflow-auto">
              <FilterBody filters={filters} handleFilter={handleFilter} />
            </div>

            <div className="p-4 border-t">
              <Button
                type="button"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default ProductFilter;

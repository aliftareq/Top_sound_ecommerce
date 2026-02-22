import { Label } from "../ui/label";
import { shoppingViewHeaderMenuItems } from "@/config";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MenuItems = ({ closeSheet }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? { category: [getCurrentMenuItem.id] }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`),
        )
      : navigate(getCurrentMenuItem.path);

    // ✅ close menu sheet after click
    if (closeSheet) closeSheet();
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row pl-6 pt-6 lg:p-0">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className="text-sm font-medium cursor-pointer hover:underline"
          key={menuItem.id}
        >
          {t(menuItem.labelKey)}
        </Label>
      ))}
    </nav>
  );
};

export default MenuItems;

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const ShoppingOrderDetailsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { orderDetails } = useSelector((state) => state.shopOrder);

  const displayName = user?.userName || "Customer";
  const { t } = useTranslation();

  const productPrice = useMemo(() => {
    // show grand total (includes delivery) like your screenshot "Product Price: ..."
    const total = Number(orderDetails?.totalAmount ?? 0);
    return total;
  }, [orderDetails]);

  if (!orderDetails) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center p-4 bg-linear-to-b from-slate-50 via-white to-slate-50">
        <div className="w-full max-w-lg rounded-3xl border bg-white p-6 shadow-[0_18px_60px_-35px_rgba(2,6,23,0.35)]">
          <p className="text-lg font-semibold text-black">
            No order details found
          </p>
          <p className="mt-1 text-sm text-black">
            Please place an order first or open your order details again.
          </p>

          <Button
            className="mt-5 w-full"
            variant="submit"
            onClick={() => navigate("/shop/listing")}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] w-full flex items-center justify-center p-4 bg-linear-to-b from-slate-50 via-white to-slate-50">
      <div className="w-full max-w-2xl">
        <div className="relative overflow-hidden rounded-3xl border bg-white shadow-[0_20px_70px_-40px_rgba(2,6,23,0.45)]">
          <div className="h-2 w-full bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600" />
          <div className="px-6 sm:px-10 py-10">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-emerald-500/10 p-4">
                <CheckCircle2 className="h-14 w-14 text-emerald-600" />
              </div>

              <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-black">
                Order Received!
              </h1>

              <p className="mt-2 text-black">
                Dear{" "}
                <span className="font-semibold text-black">{displayName}</span>,
                <br />
                your order has been successfully placed.
              </p>

              <div className="mt-8 w-full max-w-md space-y-3">
                <div className="flex items-center justify-between rounded-2xl border bg-slate-50 px-4 py-3">
                  <span className="text-sm text-black">Order Number:</span>
                  <span className="text-sm font-bold text-black break-all">
                    {orderDetails?._id || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border bg-slate-50 px-4 py-3">
                  <span className="text-sm text-black">
                    Total Amount to be paid:
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600">
                    ৳{Number(productPrice).toFixed(0)}
                  </span>
                </div>
              </div>

              <p className="mt-8 text-lg font-semibold text-black">
                Thanks For buying from <span className="align-middle">❤️</span>
              </p>

              <p className="mt-1 text-black font-medium">{t("brand.name")}</p>

              <Button
                className="mt-8 w-full sm:w-[320px] rounded-xl py-6 text-base font-bold"
                variant="submit"
                onClick={() => navigate("/shop/listing")}
              >
                CONTINUE SHOPPING
              </Button>

              {/* Optional: small help line */}
              <p className="mt-4 text-xs text-black">
                Need help? Contact support and share your order number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingOrderDetailsPage;

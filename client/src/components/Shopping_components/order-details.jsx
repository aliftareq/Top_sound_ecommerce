/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { DialogContent } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Check, RefreshCcw, Truck, PackageCheck, XCircle } from "lucide-react";

const ShoppingOrderDetailsView = ({ orderDetails }) => {
  const { user } = useSelector((state) => state.auth);

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return String(iso).split("T")[0];
    }
  };

  const money = (n) => `৳ ${Number(n || 0).toFixed(0)}`;

  // Normalize statuses to a small set
  const normalizedStatus = useMemo(() => {
    const s = (orderDetails?.orderStatus || "").toLowerCase();
    if (s.includes("cancel") || s.includes("reject")) return "canceled";
    if (s.includes("deliver")) return "delivered";
    if (s.includes("ship")) return "shipped";
    if (s.includes("confirm")) return "confirmed";
    return "pending";
  }, [orderDetails?.orderStatus]);

  const steps = useMemo(
    () => [
      { key: "pending", label: "PENDING", icon: Check },
      { key: "confirmed", label: "CONFIRM", icon: RefreshCcw },
      { key: "shipped", label: "SHIPPED", icon: Truck },
      { key: "delivered", label: "DELIVERED", icon: PackageCheck },
      { key: "canceled", label: "CANCELED", icon: XCircle },
    ],
    [],
  );

  const currentIndex = useMemo(() => {
    const idx = steps.findIndex((s) => s.key === normalizedStatus);
    return idx === -1 ? 0 : idx;
  }, [normalizedStatus, steps]);

  const invoiceNo =
    orderDetails?.invoiceNo ||
    (orderDetails?._id
      ? `INV-${String(orderDetails._id).slice(-8).toUpperCase()}`
      : "INV-XXXXXXX");

  const items = orderDetails?.cartItems || [];

  const subtotal = useMemo(() => {
    // If item has line total in price already, this still works for qty=1.
    // Better: price * quantity
    return items.reduce(
      (sum, it) => sum + Number(it?.price || 0) * Number(it?.quantity || 0),
      0,
    );
  }, [items]);

  const shipping = Number(orderDetails?.shippingAmount || 0);
  const discount = Number(orderDetails?.discountAmount || 0);
  const grandTotal = Number(
    orderDetails?.totalAmount ?? subtotal + shipping - discount,
  );
  const paid = Number(orderDetails?.paidAmount || 0);

  return (
    <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto p-0">
      {/* Header */}
      <div className="p-6 pb-4 bg-linear-to-r from-slate-50 to-slate-100 border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Order status
            </h2>
            <p className="mt-1 text-sm font-semibold text-rose-600 tracking-wide">
              {normalizedStatus.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Stepper */}
        <div className="mt-6">
          <div className="relative flex items-center justify-between">
            {/* line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-slate-200 rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-slate-900 rounded-full transition-all"
              style={{
                width:
                  normalizedStatus === "canceled"
                    ? "100%"
                    : `${(currentIndex / (steps.length - 1)) * 100}%`,
              }}
            />

            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive =
                normalizedStatus === "canceled"
                  ? s.key === "canceled"
                  : idx <= currentIndex && s.key !== "canceled";
              const isCurrent =
                normalizedStatus === "canceled"
                  ? s.key === "canceled"
                  : idx === currentIndex && s.key !== "canceled";

              return (
                <div
                  key={s.key}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  <div
                    className={[
                      "h-12 w-12 rounded-full flex items-center justify-center border-2",
                      isActive
                        ? "bg-slate-900 border-slate-900"
                        : "bg-white border-slate-300",
                      isCurrent ? "ring-4 ring-slate-200" : "",
                      normalizedStatus === "canceled" && s.key === "canceled"
                        ? "bg-rose-600 border-rose-600"
                        : "",
                    ].join(" ")}
                  >
                    <Icon
                      className={isActive ? "text-white" : "text-slate-500"}
                      size={20}
                    />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Info row (Invoice / Date / Payment method) */}
          <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500">Invoice no</p>
                <p className="text-base font-semibold text-slate-900">
                  {invoiceNo}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Order Date</p>
                <p className="text-base font-semibold text-slate-900">
                  {formatDate(orderDetails?.orderDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Payment method
                </p>
                <p className="text-base font-semibold text-slate-900">
                  {orderDetails?.paymentMethod || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 grid gap-6 bg-white">
        {/* Order Summary */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Order Summary
          </h3>
          <div className="mt-3 grid gap-3">
            {items?.length ? (
              items.map((item, idx) => (
                <div
                  key={item?.productId || idx}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 bg-slate-50"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                      {/* if you have item.image or item.productImage, it will render */}
                      {item?.mainImage ? (
                        <img
                          src={item.mainImage}
                          alt={item?.title || "product"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">product</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {item?.title || "Product"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Qty: {item?.quantity || 0}
                      </p>
                    </div>
                  </div>

                  <div className="text-right min-w-[110px]">
                    <p className="text-sm text-slate-500">Price</p>

                    {/* unit price */}
                    <p className="text-base font-semibold text-slate-900">
                      {money(item?.price)}
                    </p>

                    {/* qty × price */}
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item?.quantity || 0} × {money(item?.price)} ={" "}
                      <span className="font-semibold text-slate-800">
                        {money((item?.quantity || 0) * (item?.price || 0))}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No items found.</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Two columns: Payment Details + Shipping Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Details */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Payment Details
            </h3>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3">
                <Row label="Subtotal" value={money(subtotal)} />
                <Row label="Shipping" value={money(grandTotal - subtotal)} />
                <Row label="Discount" value={money(discount)} />
                <Separator />
                <Row label="Grand Total" value={money(grandTotal)} strong />
                <Row label="Paid" value={money(paid)} />
                <Row
                  label="Payment Status"
                  value={
                    <Badge
                      className={[
                        "text-white rounded-full px-3 py-1",
                        (orderDetails?.paymentStatus || "").toLowerCase() ===
                        "paid"
                          ? "bg-emerald-600"
                          : "bg-slate-900",
                      ].join(" ")}
                    >
                      {orderDetails?.paymentStatus || "unpaid"}
                    </Badge>
                  }
                />
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Shipping Info
            </h3>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="grid gap-2 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-500">Customer</p>
                  <p className="font-semibold text-slate-900">
                    {user?.userName || "-"}
                  </p>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-slate-500">Address</p>
                  <p className="font-medium text-slate-900 text-right">
                    {orderDetails?.addressInfo?.fullAddress || "-"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-500">Phone</p>
                  <p className="font-medium text-slate-900">
                    {orderDetails?.addressInfo?.phone || "-"}
                  </p>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-slate-500">Notes</p>
                  <p className="font-medium text-slate-900 text-right">
                    {orderDetails?.addressInfo?.notes || "-"}
                  </p>
                </div>

                <Separator className="my-2" />

                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-500">Order ID</p>
                  <Label className="text-slate-900">
                    {orderDetails?._id || "-"}
                  </Label>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-500">Order Price</p>
                  <Label className="text-slate-900">
                    {money(orderDetails?.totalAmount)}
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional: keep your original Order Status badge row if you want (already in header) */}
      </div>
    </DialogContent>
  );
};

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p
        className={`text-sm ${strong ? "font-semibold text-slate-900" : "text-slate-600"}`}
      >
        {label}
      </p>
      <div
        className={`text-sm ${strong ? "font-semibold text-slate-900" : "text-slate-900"}`}
      >
        {value}
      </div>
    </div>
  );
}

export default ShoppingOrderDetailsView;

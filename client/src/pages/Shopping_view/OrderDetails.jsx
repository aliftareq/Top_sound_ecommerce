import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";

const ShoppingOrderDetailsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { orderDetails } = useSelector((state) => state.shopOrder);

  if (!orderDetails) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold">No order details found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please place an order first or open your order details again.
          </p>
        </div>
      </div>
    );
  }

  const orderDate = orderDetails?.orderDate
    ? orderDetails.orderDate.split("T")[0]
    : "N/A";

  const statusClass =
    orderDetails?.orderStatus === "confirmed"
      ? "bg-emerald-600"
      : orderDetails?.orderStatus === "delivered"
        ? "bg-emerald-700"
        : orderDetails?.orderStatus === "inShipping"
          ? "bg-amber-500"
          : orderDetails?.orderStatus === "rejected"
            ? "bg-rose-600"
            : "bg-slate-900";

  const subtotal =
    orderDetails?.cartItems?.reduce((sum, item) => {
      const price = Number(item?.price ?? 0);
      const qty = Number(item?.quantity ?? 0);
      return sum + price * qty;
    }, 0) ?? 0;

  // ✅ Delivery charge from backend (supports both shapes)
  const grandTotal = Number(orderDetails?.totalAmount ?? 0);
  const deliveryCharge = grandTotal - subtotal;


  return (
    <div className="min-h-[70vh] w-full flex items-start justify-center p-4 sm:p-8 bg-linear-to-b from-slate-50 via-white to-slate-50">
      <div className="w-full max-w-3xl">
        <div className="relative overflow-hidden rounded-3xl border bg-white shadow-[0_18px_60px_-35px_rgba(2,6,23,0.55)]">
          {/* Header */}
          <div className="relative px-6 sm:px-8 pt-8 pb-6 bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
            <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-xs tracking-widest uppercase text-white/80">
                  Order Memo
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold">
                  Thanks, {user?.userName || "Customer"}!
                </h1>
                <p className="mt-1 text-sm text-white/85">
                  Here’s a summary of your order. Keep this memo for reference.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start">
                <span className="text-xs text-white/80">Status</span>
                <Badge className={`py-1 px-3 text-white ${statusClass}`}>
                  {orderDetails?.orderStatus}
                </Badge>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/12 border border-white/15 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-white/70">
                  Order ID
                </p>
                <p className="mt-1 text-sm font-semibold break-all">
                  {orderDetails?._id}
                </p>
              </div>

              <div className="rounded-2xl bg-white/12 border border-white/15 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-white/70">
                  Order Date
                </p>
                <p className="mt-1 text-sm font-semibold">{orderDate}</p>
              </div>

              <div className="rounded-2xl bg-white/12 border border-white/15 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-white/70">
                  Payment
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {orderDetails?.paymentMethod}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 sm:px-8 py-7">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Items */}
              <div className="rounded-2xl border bg-linear-to-b from-white to-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">Order Items</p>
                  <span className="text-xs text-slate-500">
                    {orderDetails?.cartItems?.length || 0} items
                  </span>
                </div>

                <Separator className="my-4" />

                <ul className="grid gap-3">
                  {orderDetails?.cartItems?.map((item, idx) => (
                    <li
                      key={`${item?.productId || item?.title}-${idx}`}
                      className="rounded-xl border bg-white p-3 shadow-[0_10px_30px_-25px_rgba(15,23,42,0.45)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {item?.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Qty:{" "}
                            <span className="font-semibold text-slate-700">
                              {item?.quantity}
                            </span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            ৳{Number(item?.price ?? 0).toFixed(2)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Line:{" "}
                            <span className="font-semibold text-slate-700">
                              ৳
                              {(
                                Number(item?.price ?? 0) *
                                Number(item?.quantity ?? 0)
                              ).toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right column */}
              <div className="grid gap-6">
                {/* Shipping */}
                <div className="rounded-2xl border bg-linear-to-b from-white to-slate-50 p-5">
                  <p className="font-bold text-slate-900">Shipping Info</p>
                  <Separator className="my-4" />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Name</span>
                      <span className="font-semibold text-slate-900">
                        {user?.userName || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-500">Address</span>
                      <span className="font-semibold text-slate-900 text-right max-w-[70%]">
                        {orderDetails?.addressInfo?.address || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Phone</span>
                      <span className="font-semibold text-slate-900">
                        {orderDetails?.addressInfo?.phone || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-500">Notes</span>
                      <span className="font-semibold text-slate-900 text-right max-w-[70%]">
                        {orderDetails?.addressInfo?.notes || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="rounded-2xl border bg-linear-to-b from-indigo-50 via-white to-purple-50 p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">Payment Summary</p>
                    <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200">
                      {orderDetails?.paymentStatus}
                    </Badge>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-semibold">
                        ৳{Number(subtotal).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Delivery Charge</span>
                      <span className="font-semibold">
                        ৳{Number(deliveryCharge).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-indigo-100 pt-3">
                      <span className="text-slate-600">Grand Total</span>
                      <span className="text-lg font-extrabold text-indigo-700">
                        ৳{Number(grandTotal).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    * Please keep this memo for your records.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer memo */}
            <div className="mt-7 rounded-2xl border bg-slate-50 p-4">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Memo:</span> Your order has been
                received. We’ll contact you shortly to confirm delivery details.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} • Order memo generated for your reference
        </p>
      </div>
    </div>
  );
};

export default ShoppingOrderDetailsPage;

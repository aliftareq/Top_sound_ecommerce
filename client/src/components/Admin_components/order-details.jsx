/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import CommonForm from "../Common_components/Form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  updatePaymentStatus,
  createSteadfastParcelForOrder,
  syncSteadfastStatusForOrder,
} from "@/store/admin/order-slice";
import { toast } from "sonner";

const initialFormData = {
  status: "",
  paymentStatus: "",
  recipient_name: "",
};

const getOrderBadgeClass = (status) => {
  switch (status) {
    case "confirmed":
      return "bg-green-500";
    case "delivered":
      return "bg-green-600";
    case "shipped":
    case "inShipping":
      return "bg-yellow-500";
    case "rejected":
    case "cancelled":
      return "bg-red-600";
    case "hold":
      return "bg-orange-500";
    default:
      return "bg-black";
  }
};

const getCourierBadgeClass = (deliveryStatus) => {
  switch (deliveryStatus) {
    case "delivered":
      return "bg-green-600";
    case "pending":
    case "in_review":
      return "bg-yellow-500";
    case "hold":
      return "bg-orange-500";
    case "cancelled":
      return "bg-red-600";
    default:
      return "bg-slate-700";
  }
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const dispatch = useDispatch();
  const { actionLoading } = useSelector((state) => state.adminOrder);

  const hasSteadfast = useMemo(
    () => !!orderDetails?.steadfast?.trackingCode,
    [orderDetails]
  );

  const courierStatus = orderDetails?.steadfast?.deliveryStatus;
  const trackingCode = orderDetails?.steadfast?.trackingCode;

  // prefill recipient_name from userName (so admin doesn't type every time)
  useEffect(() => {
    if (orderDetails?.userId?.userName) {
      setFormData((prev) => ({
        ...prev,
        recipient_name: prev.recipient_name || orderDetails.userId.userName,
      }));
    }
  }, [orderDetails]);

  if (!orderDetails) return null;

  // Order Status update (your existing select)
  const handleUpdateStatus = (event) => {
    event.preventDefault();
    const { status } = formData;

    dispatch(updateOrderStatus({ id: orderDetails?._id, orderStatus: status })).then(
      (data) => {
        if (data?.payload?.success) {
          dispatch(getOrderDetailsForAdmin(orderDetails?._id));
          dispatch(getAllOrdersForAdmin());
          setFormData((prev) => ({ ...prev, status: "" }));
          toast.success(data?.payload?.message);
        } else if (data?.payload?.message) {
          toast.error(data?.payload?.message);
        }
      }
    );
  };

  // Payment Status update
  const handleUpdatePaymentStatus = (event) => {
    event.preventDefault();
    const { paymentStatus } = formData;

    dispatch(
      updatePaymentStatus({ id: orderDetails?._id, paymentStatus })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData((prev) => ({ ...prev, paymentStatus: "" }));
        toast.success(data?.payload?.message);
      } else if (data?.payload?.message) {
        toast.error(data?.payload?.message);
      }
    });
  };

  // ✅ Quick confirm / reject buttons (user-friendly)
  const handleQuickConfirm = () => {
    dispatch(updateOrderStatus({ id: orderDetails?._id, orderStatus: "confirmed" })).then(
      (data) => {
        if (data?.payload?.success) {
          dispatch(getOrderDetailsForAdmin(orderDetails?._id));
          dispatch(getAllOrdersForAdmin());
          toast.success("Order confirmed!");
        } else {
          toast.error(data?.payload?.message || "Failed to confirm");
        }
      }
    );
  };

  const handleQuickReject = () => {
    dispatch(updateOrderStatus({ id: orderDetails?._id, orderStatus: "rejected" })).then(
      (data) => {
        if (data?.payload?.success) {
          dispatch(getOrderDetailsForAdmin(orderDetails?._id));
          dispatch(getAllOrdersForAdmin());
          toast.success("Order rejected!");
        } else {
          toast.error(data?.payload?.message || "Failed to reject");
        }
      }
    );
  };

  // ✅ Create steadfast parcel
  const handleCreateSteadfast = () => {
    if (!formData.recipient_name?.trim()) {
      toast.error("Recipient name is required to create a Steadfast parcel.");
      return;
    }

    dispatch(
      createSteadfastParcelForOrder({
        id: orderDetails?._id,
        recipient_name: formData.recipient_name.trim(),
        delivery_type: 0,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        toast.success(data?.payload?.message || "Parcel created!");
      } else {
        toast.error(data?.payload?.message || "Failed to create parcel");
      }
    });
  };

  // ✅ Sync steadfast status
  const handleSyncSteadfast = () => {
    dispatch(syncSteadfastStatusForOrder({ id: orderDetails?._id })).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        toast.success(data?.payload?.message || "Status synced!");
      } else {
        toast.error(data?.payload?.message || "Sync failed");
      }
    });
  };

  const handleCopyTracking = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode);
      toast.success("Tracking code copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const canCreateParcel =
    orderDetails?.orderStatus === "confirmed" && !hasSteadfast;

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
      <div className="grid gap-6">
        {/* Header */}
        <div className="grid gap-2">
          <div className="flex mt-2 items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold">Order Details</p>
              <p className="text-xs text-muted-foreground">
                Manage status + courier from one place
              </p>
            </div>

            {/* ✅ Quick actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={actionLoading || orderDetails?.orderStatus === "confirmed"}
                onClick={handleQuickConfirm}
              >
                Confirm
              </Button>
              <Button
                variant="destructive"
                disabled={actionLoading || orderDetails?.orderStatus === "rejected"}
                onClick={handleQuickReject}
              >
                Reject
              </Button>
            </div>
          </div>

          <div className="flex mt-4 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label className="max-w-[380px] truncate">{orderDetails?._id}</Label>
          </div>

          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{orderDetails?.orderDate?.split("T")?.[0]}</Label>
          </div>

          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label>৳{orderDetails?.totalAmount}</Label>
          </div>

          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment method</p>
            <Label>{orderDetails?.paymentMethod}</Label>
          </div>

          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label>
              <span
                className={`font-medium uppercase ${
                  orderDetails?.paymentStatus === "paid"
                    ? "text-green-600"
                    : "text-black"
                }`}
              >
                {orderDetails?.paymentStatus}
              </span>
            </Label>
          </div>

          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 text-white ${getOrderBadgeClass(
                  orderDetails?.orderStatus
                )}`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
        </div>

        <Separator />

        {/* ✅ Steadfast Section */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Courier (Steadfast)</p>
              <p className="text-xs text-muted-foreground">
                Create parcel, view tracking, sync delivery status
              </p>
            </div>

            {hasSteadfast ? (
              <Button
                variant="outline"
                onClick={handleSyncSteadfast}
                disabled={actionLoading}
              >
                {actionLoading ? "Syncing..." : "Refresh Status"}
              </Button>
            ) : null}
          </div>

          {/* If parcel created */}
          {hasSteadfast ? (
            <div className="rounded-lg border p-3 grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tracking Code</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{trackingCode}</span>
                  <Button variant="outline" size="sm" onClick={handleCopyTracking}>
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Delivery Status</span>
                <Badge
                  className={`py-1 px-3 text-white ${getCourierBadgeClass(
                    courierStatus
                  )}`}
                >
                  {courierStatus || "unknown"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Sync</span>
                <span className="text-sm text-muted-foreground">
                  {orderDetails?.steadfast?.lastSyncAt
                    ? new Date(orderDetails.steadfast.lastSyncAt).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>
          ) : (
            // If parcel not created yet
            <div className="rounded-lg border p-3 grid gap-3">
              <div className="grid gap-2">
                <Label className="text-sm">Recipient Name (required)</Label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="Customer name"
                  value={formData.recipient_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recipient_name: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  You can later store this in addressInfo to avoid typing every time.
                </p>
              </div>

              <Button
                variant="submit"
                onClick={handleCreateSteadfast}
                disabled={!canCreateParcel || actionLoading}
                title={
                  orderDetails?.orderStatus !== "confirmed"
                    ? "Confirm the order first"
                    : ""
                }
              >
                {actionLoading ? "Creating..." : "Send to Steadfast"}
              </Button>

              {orderDetails?.orderStatus !== "confirmed" ? (
                <p className="text-xs text-red-600">
                  Confirm the order before sending it to courier.
                </p>
              ) : null}
            </div>
          )}
        </div>

        <Separator />

        {/* Order Items */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Order Items</div>
            <ul className="grid gap-3">
              {orderDetails?.cartItems?.length
                ? orderDetails.cartItems.map((item) => (
                    <li
                      key={item?.productId || item?.title}
                      className="flex items-center justify-between"
                    >
                      <span className="max-w-[260px] truncate">
                        Title: {item.title}
                      </span>
                      <span>Qty: {item.quantity}</span>
                      <span>৳{item.price}</span>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="grid gap-2">
          <div className="font-medium">Shipping Info</div>
          <div className="grid gap-0.5 text-black">
            <span>{orderDetails?.userId?.userName}</span>
            <span>{orderDetails?.addressInfo?.fullAddress}</span>
            <span>{orderDetails?.addressInfo?.phone}</span>
            <span>{orderDetails?.addressInfo?.notes}</span>
          </div>
        </div>

        <Separator />

        {/* Payment Status update */}
        <div>
          <CommonForm
            formControls={[
              {
                label: "Payment Status",
                name: "paymentStatus",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "paid", label: "PAID" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={actionLoading ? "Updating..." : "Update Payment Status"}
            onSubmit={handleUpdatePaymentStatus}
          />
        </div>

        {/* Order Status update */}
        <div>
          <CommonForm
            formControls={[
              {
                label: "Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "confirmed", label: "Confirmed" },
                  { id: "shipped", label: "Shipped" },
                  { id: "delivered", label: "Delivered" },
                  { id: "rejected", label: "Rejected" },
                  { id: "hold", label: "Hold" },
                  { id: "cancelled", label: "Cancelled" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={actionLoading ? "Updating..." : "Update Order Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;

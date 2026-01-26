import { useState } from "react";
import CommonForm from "../Common_components/Form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  updatePaymentStatus, // ✅ added
} from "@/store/admin/order-slice";
import { toast } from "sonner";

const initialFormData = {
  status: "",
  paymentStatus: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const dispatch = useDispatch();

  console.log(orderDetails, "orderDetails");

  // ✅ Order Status update (same behavior as before)
  const handleUpdateStatus = (event) => {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status }),
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());

        // ✅ don't clear paymentStatus when updating order status
        setFormData((prev) => ({ ...prev, status: "" }));

        toast.success(data?.payload?.message);
      }
    });
  };

  // ✅ Payment Status update (new)
  const handleUpdatePaymentStatus = (event) => {
    event.preventDefault();
    const { paymentStatus } = formData;

    dispatch(
      updatePaymentStatus({ id: orderDetails?._id, paymentStatus }),
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());

        // ✅ don't clear status when updating payment status
        setFormData((prev) => ({ ...prev, paymentStatus: "" }));

        toast.success(data?.payload?.message);
      }
    });
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[500px] overflow-y-auto">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{orderDetails?.orderDate.split("T")[0]}</Label>
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
                className={`py-1 px-3 text-white ${
                  orderDetails?.orderStatus === "confirmed"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "delivered"
                      ? "bg-green-600"
                      : orderDetails?.orderStatus === "inShipping"
                        ? "bg-yellow-500"
                        : orderDetails?.orderStatus === "rejected"
                          ? "bg-red-600"
                          : "bg-black"
                }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Order Details</div>
            <ul className="grid gap-3">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                ? orderDetails?.cartItems.map((item) => (
                    <li
                      key={item?.productId || item?.title} // ✅ added key (no UI change)
                      className="flex items-center justify-between"
                    >
                      <span>Title: {item.title}</span>
                      <span>Quantity: {item.quantity}</span>
                      <span>Price: ৳{item.price}</span>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Shipping Info</div>
            <div className="grid gap-0.5 text-black">
              <span>{orderDetails?.userId?.userName}</span>
              <span>{orderDetails?.addressInfo?.fullAddress}</span>
              <span>{orderDetails?.addressInfo?.phone}</span>
              <span>{orderDetails?.addressInfo?.notes}</span>
            </div>
          </div>
        </div>

        {/* ✅ payment-status update */}
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
            buttonText={"Update Payment Status"}
            onSubmit={handleUpdatePaymentStatus} // ✅ fixed
          />
        </div>

        {/* order-status update */}
        <div>
          <CommonForm
            formControls={[
              {
                label: "Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "inProcess", label: "In Process" },
                  { id: "inShipping", label: "In Shipping" },
                  { id: "delivered", label: "Delivered" },
                  { id: "rejected", label: "Rejected" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Update Order Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;

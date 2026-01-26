/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";

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

const AdminOrdersView = () => {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { orderList, orderDetails, isLoading } = useSelector(
    (state) => state.adminOrder
  );
  const dispatch = useDispatch();

  const sortedOrders = useMemo(() => {
    if (!orderList?.length) return [];
    // newest first
    return [...orderList].sort(
      (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
    );
  }, [orderList]);

  const handleOpenDetails = (orderId) => {
    setSelectedOrderId(orderId);
    dispatch(getOrderDetailsForAdmin(orderId));
  };

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Orders</CardTitle>
        <Button variant="outline" onClick={() => dispatch(getAllOrdersForAdmin())}>
          Refresh
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Loading orders...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Order Status</TableHead>

                {/* ✅ New */}
                <TableHead>Courier</TableHead>

                <TableHead>Order Price</TableHead>
                <TableHead>
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedOrders && sortedOrders.length > 0
                ? sortedOrders.map((orderItem) => {
                    const courierStatus = orderItem?.steadfast?.deliveryStatus;
                    const hasTracking = !!orderItem?.steadfast?.trackingCode;

                    return (
                      <TableRow key={orderItem?._id}>
                        <TableCell className="max-w-[260px] truncate">
                          {orderItem?._id}
                        </TableCell>

                        <TableCell>
                          {orderItem?.orderDate?.split("T")?.[0]}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={`py-1 px-3 text-white ${getOrderBadgeClass(
                              orderItem?.orderStatus
                            )}`}
                          >
                            {orderItem?.orderStatus}
                          </Badge>
                        </TableCell>

                        {/* ✅ Courier column */}
                        <TableCell>
                          {hasTracking ? (
                            <div className="flex flex-col gap-1">
                              <Badge
                                className={`w-fit py-1 px-3 text-white ${getCourierBadgeClass(
                                  courierStatus
                                )}`}
                              >
                                {courierStatus || "unknown"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {orderItem?.steadfast?.trackingCode}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Not sent
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-xl font-bold">
                          ৳{orderItem?.totalAmount}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="submit"
                            onClick={() => handleOpenDetails(orderItem?._id)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                : null}
            </TableBody>
          </Table>
        )}

        {/* ✅ single dialog for the whole page (fixes multi-dialog bug) */}
        <Dialog
          open={openDetailsDialog}
          onOpenChange={(open) => {
            setOpenDetailsDialog(open);
            if (!open) {
              setSelectedOrderId(null);
              dispatch(resetOrderDetails());
            }
          }}
        >
          <AdminOrderDetailsView
            orderDetails={orderDetails}
            selectedOrderId={selectedOrderId}
          />
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminOrdersView;

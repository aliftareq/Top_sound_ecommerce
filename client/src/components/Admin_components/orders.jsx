/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
  deleteOrderForAdmin,
  clearAdminOrderMessages,
} from "@/store/admin/order-slice";

// ---------- helpers ----------
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
    case "partial_delivered":
      return "bg-green-600";

    case "pending":
    case "in_review":
    case "delivered_approval_pending":
    case "partial_delivered_approval_pending":
    case "unknown_approval_pending":
      return "bg-yellow-500";

    case "hold":
      return "bg-orange-500";

    case "cancelled":
    case "cancelled_approval_pending":
      return "bg-red-600";

    case "unknown":
      return "bg-slate-500";

    default:
      return "bg-slate-700";
  }
};

const normalizeStatusLabel = (s) => {
  if (!s) return "unknown";
  const map = {
    inShipping: "inShipping",
    shipped: "shipped",
    confirmed: "confirmed",
    delivered: "delivered",
    rejected: "rejected",
    cancelled: "cancelled",
    hold: "hold",
    pending: "pending",
  };
  return map[s] || s;
};

// ---------- component ----------
const AdminOrdersView = () => {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // delete confirm dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // {id, label?}

  // status tabs
  const [activeTab, setActiveTab] = useState("all");

  const { orderList, orderDetails, isLoading, actionLoading } = useSelector(
    (state) => state.adminOrder,
  );
  const dispatch = useDispatch();

  // total queue count (all statuses)
  const totalQueueCount = useMemo(
    () => (orderList?.length ? orderList.length : 0),
    [orderList],
  );

  const sortedOrders = useMemo(() => {
    if (!orderList?.length) return [];
    return [...orderList].sort(
      (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
    );
  }, [orderList]);

  const statusCounts = useMemo(() => {
    const counts = {};
    (sortedOrders || []).forEach((o) => {
      const s = normalizeStatusLabel(o?.orderStatus);
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [sortedOrders]);

  const statusTabs = useMemo(() => {
    const preferred = [
      "all",
      "pending",
      "confirmed",
      "shipped",
      "inShipping",
      "hold",
      "delivered",
      "cancelled",
      "rejected",
      "unknown",
    ];

    const dynamic = Object.keys(statusCounts || {}).filter((s) => s !== "all");
    const uniq = Array.from(new Set([...preferred, ...dynamic]));

    return uniq.filter((t) => t === "all" || (statusCounts?.[t] ?? 0) > 0);
  }, [statusCounts]);

  const visibleOrders = useMemo(() => {
    if (activeTab === "all") return sortedOrders;
    return (sortedOrders || []).filter(
      (o) => normalizeStatusLabel(o?.orderStatus) === activeTab,
    );
  }, [sortedOrders, activeTab]);

  const handleOpenDetails = (orderId) => {
    setSelectedOrderId(orderId);
    dispatch(getOrderDetailsForAdmin(orderId));
  };

  const handleAskDelete = (orderId) => {
    setDeleteTarget({ id: orderId });
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      await dispatch(deleteOrderForAdmin(deleteTarget.id)).unwrap();

      if (selectedOrderId === deleteTarget.id) {
        setOpenDetailsDialog(false);
        setSelectedOrderId(null);
        dispatch(resetOrderDetails());
      }

      setOpenDeleteDialog(false);
      setDeleteTarget(null);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  useEffect(() => {
    return () => {
      dispatch(clearAdminOrderMessages());
    };
  }, [dispatch]);

  return (
    <div className="min-w-0">
      <Card>
        <CardHeader className="flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="flex flex-col">
              <CardTitle>Order Queue: {totalQueueCount}</CardTitle>
              <span className="text-sm text-muted-foreground">
                Total orders across all statuses
              </span>
            </div>

            <Button
              variant="outline"
              onClick={() => dispatch(getAllOrdersForAdmin())}
            >
              Refresh
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => {
              const count =
                tab === "all" ? totalQueueCount : (statusCounts?.[tab] ?? 0);
              const active = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "rounded-full border px-3 py-1 text-sm transition",
                    active
                      ? "bg-black text-white"
                      : "bg-white hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span className="capitalize">{tab}</span>
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading orders...
            </div>
          ) : (
            // ✅ WORKING SHADCN PATTERN: wrapper scroll + inner min-w-max
            <div className="w-full overflow-auto rounded-md border bg-white">
              <div className="w-full max-w-full overflow-x-auto rounded-md border bg-white">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow className="whitespace-nowrap">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead>Courier</TableHead>
                      <TableHead>Order Price</TableHead>
                      <TableHead className="text-right">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {visibleOrders && visibleOrders.length > 0 ? (
                      visibleOrders.map((orderItem) => {
                        const courierStatus =
                          orderItem?.steadfast?.deliveryStatus;
                        const hasTracking =
                          !!orderItem?.steadfast?.trackingCode;

                        return (
                          <TableRow
                            key={orderItem?._id}
                            className="whitespace-nowrap"
                          >
                            <TableCell className="font-mono">
                              {orderItem?._id}
                            </TableCell>

                            <TableCell>
                              {orderItem?.orderDate?.split("T")?.[0]}
                            </TableCell>

                            <TableCell>
                              <Badge
                                className={`py-1 px-3 text-white ${getOrderBadgeClass(
                                  orderItem?.orderStatus,
                                )}`}
                              >
                                {orderItem?.orderStatus}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              {hasTracking ? (
                                <div className="flex flex-col gap-1">
                                  <Badge
                                    className={`w-fit py-1 px-3 text-white ${getCourierBadgeClass(
                                      courierStatus,
                                    )}`}
                                  >
                                    {courierStatus || "unknown"}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground font-mono">
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
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="submit"
                                  onClick={() =>
                                    handleOpenDetails(orderItem?._id)
                                  }
                                >
                                  View Details
                                </Button>

                                <Button
                                  variant="submit"
                                  className="bg-rose-500"
                                  onClick={() =>
                                    handleAskDelete(orderItem?._id)
                                  }
                                  disabled={actionLoading}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center">
                          <span className="text-sm text-muted-foreground">
                            No orders found for this status.
                          </span>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ✅ Details dialog */}
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

          {/* ✅ Delete confirmation dialog */}
          <Dialog
            open={openDeleteDialog}
            onOpenChange={(open) => {
              setOpenDeleteDialog(open);
              if (!open) setDeleteTarget(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete order?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Are you sure you want to delete
                  this order?
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-md bg-slate-50 p-3 text-sm">
                <div className="text-muted-foreground">Order ID</div>
                <div className="font-mono">{deleteTarget?.id}</div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenDeleteDialog(false);
                    setDeleteTarget(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>

                <Button
                  variant="submit"
                  className="bg-red-600"
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Deleting..." : "Yes, Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrdersView;

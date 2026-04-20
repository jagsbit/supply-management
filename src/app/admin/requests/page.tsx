"use client";
import { useEffect, useState } from "react";
import { SupplyRequestData } from "@/types";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ClipboardList, CheckCircle, XCircle } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") return <Badge variant="success">Approved</Badge>;
  if (status === "REJECTED") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="warning">Pending</Badge>;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<SupplyRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; requestId: string }>({ open: false, requestId: "" });
  const [rejectionReason, setRejectionReason] = useState("");

  async function fetchRequests() {
    setLoading(true);
    const res = await apiFetch<SupplyRequestData[]>("/api/requests");
    if (res.success && res.data) setRequests(res.data);
    setLoading(false);
  }

  useEffect(() => { fetchRequests(); }, []);

  async function handleApprove(id: string) {
    setActionLoading(id);
    const res = await apiFetch(`/api/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "approve" }),
    });
    setActionLoading(null);
    if (res.success) {
      toast.success("Request approved successfully");
      fetchRequests();
    } else {
      toast.error(res.error || "Failed to approve request");
    }
  }

  async function handleReject() {
    const id = rejectDialog.requestId;
    setActionLoading(id);
    const res = await apiFetch(`/api/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "reject", rejectionReason }),
    });
    setActionLoading(null);
    setRejectDialog({ open: false, requestId: "" });
    setRejectionReason("");
    if (res.success) {
      toast.success("Request rejected");
      fetchRequests();
    } else {
      toast.error(res.error || "Failed to reject request");
    }
  }

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supply Requests</h1>
          <p className="text-muted-foreground">Review and manage employee supply requests</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning" className="text-sm px-3 py-1">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" />All Requests</CardTitle>
          <CardDescription>Approve or reject pending requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No requests yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{req.requester.name}</p>
                        <p className="text-xs text-muted-foreground">{req.requester.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{req.inventoryItem.name}</TableCell>
                    <TableCell>{req.quantity} {req.inventoryItem.unit}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[150px] truncate">{req.remarks || "—"}</TableCell>
                    <TableCell>
                      <div>
                        <StatusBadge status={req.status} />
                        {req.rejectionReason && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-[120px] truncate" title={req.rejectionReason}>
                            {req.rejectionReason}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {req.status === "PENDING" ? (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="default"
                            disabled={actionLoading === req.id}
                            onClick={() => handleApprove(req.id)}>
                            {actionLoading === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive"
                            disabled={actionLoading === req.id}
                            onClick={() => setRejectDialog({ open: true, requestId: req.id })}>
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {req.reviewedBy ? `by ${req.reviewedBy.name}` : "—"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, requestId: rejectDialog.requestId })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>Optionally provide a reason for rejection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Reason (optional)</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Insufficient budget, out of stock..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setRejectDialog({ open: false, requestId: "" }); setRejectionReason(""); }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={actionLoading === rejectDialog.requestId}>
                {actionLoading === rejectDialog.requestId ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

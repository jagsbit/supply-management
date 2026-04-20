"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createRequestSchema, CreateRequestInput } from "@/lib/validations";
import { InventoryItemData, SupplyRequestData } from "@/types";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle, ClipboardList } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") return <Badge variant="success">Approved</Badge>;
  if (status === "REJECTED") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="warning">Pending</Badge>;
}

export default function EmployeeRequestsPage() {
  const [inventory, setInventory] = useState<InventoryItemData[]>([]);
  const [requests, setRequests] = useState<SupplyRequestData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
  });

  async function fetchData() {
    setLoadingData(true);
    const [invRes, reqRes] = await Promise.all([
      apiFetch<InventoryItemData[]>("/api/inventory"),
      apiFetch<SupplyRequestData[]>("/api/requests"),
    ]);
    if (invRes.success && invRes.data) setInventory(invRes.data);
    if (reqRes.success && reqRes.data) setRequests(reqRes.data);
    setLoadingData(false);
  }

  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (data: CreateRequestInput) => {
    setSubmitting(true);
    const res = await apiFetch<SupplyRequestData>("/api/requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setSubmitting(false);
    if (res.success) {
      toast.success("Request submitted successfully!");
      reset();
      fetchData();
    } else {
      toast.error(res.error || "Failed to submit request");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">My Supply Requests</h1>
        <p className="text-muted-foreground">Submit new requests and track their status</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5" />New Request</CardTitle>
          <CardDescription>Submit a request for office supplies</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item</Label>
                <Controller name="inventoryItemId" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an item..." />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map((item) => (
                        <SelectItem key={item.id} value={item.id} disabled={item.quantity === 0}>
                          {item.name} — {item.quantity > 0 ? "In Stock" : "Out of Stock"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
                {errors.inventoryItemId && <p className="text-sm text-destructive">{errors.inventoryItemId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" min={1} placeholder="1" {...register("quantity", { valueAsNumber: true })} />
                {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (optional)</Label>
              <Textarea id="remarks" placeholder="Any additional notes..." {...register("remarks")} />
            </div>
            <Button type="submit" disabled={submitting || loadingData}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" />Request History</CardTitle>
          <CardDescription>All your supply requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No requests yet. Submit your first request above!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.inventoryItem.name}</TableCell>
                    <TableCell>{req.quantity} {req.inventoryItem.unit}</TableCell>
                    <TableCell className="text-muted-foreground">{req.remarks || "—"}</TableCell>
                    <TableCell><StatusBadge status={req.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{req.rejectionReason || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

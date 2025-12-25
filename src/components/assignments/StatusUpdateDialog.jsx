import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Save, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

const statusOptions = [
  { value: "new_request", label: "New Request" },
  { value: "work_started", label: "Work Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "waiting_for_parts", label: "Waiting for Parts" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

export default function StatusUpdateDialog({ 
  open, 
  onOpenChange, 
  assignment,
  onSave 
}) {
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (assignment) {
      setNewStatus(assignment.status || "new_request");
      setNotes("");
    }
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, [assignment, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newStatus === assignment?.status) {
      onOpenChange(false);
      return;
    }
    setSaving(true);
    await onSave({
      assignmentId: assignment.id,
      newStatus,
      notes,
      previousStatus: assignment.status,
      customerId: assignment.customer_id,
      changedBy: user?.email || 'Unknown'
    });
    setSaving(false);
  };

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-600" />
            Update Status
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Service</p>
            <p className="font-semibold text-slate-800">{assignment.service_name}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-2">Current Status</p>
            <StatusBadge status={assignment.status} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this status change..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
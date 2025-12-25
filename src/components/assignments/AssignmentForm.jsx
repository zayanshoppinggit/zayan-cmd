import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Save, X } from "lucide-react";

export default function AssignmentForm({ 
  open, 
  onOpenChange, 
  assignment,
  customerId,
  customerName,
  services = [],
  customers = [],
  onSave 
}) {
  const [formData, setFormData] = useState({
    customer_id: "",
    service_id: "",
    service_name: "",
    status: "new_request",
    start_date: "",
    expected_completion_date: "",
    assigned_technician: "",
    notes: "",
    priority: "medium"
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (assignment) {
      setFormData({
        customer_id: assignment.customer_id || "",
        service_id: assignment.service_id || "",
        service_name: assignment.service_name || "",
        status: assignment.status || "new_request",
        start_date: assignment.start_date || "",
        expected_completion_date: assignment.expected_completion_date || "",
        assigned_technician: assignment.assigned_technician || "",
        notes: assignment.notes || "",
        priority: assignment.priority || "medium"
      });
    } else {
      setFormData({
        customer_id: customerId || "",
        service_id: "",
        service_name: "",
        status: "new_request",
        start_date: new Date().toISOString().split('T')[0],
        expected_completion_date: "",
        assigned_technician: "",
        notes: "",
        priority: "medium"
      });
    }
  }, [assignment, customerId, open]);

  const handleServiceChange = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    setFormData(prev => ({
      ...prev,
      service_id: serviceId,
      service_name: service?.name || ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  const statusOptions = [
    { value: "new_request", label: "New Request" },
    { value: "work_started", label: "Work Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "waiting_for_parts", label: "Waiting for Parts" },
    { value: "completed", label: "Completed" },
    { value: "on_hold", label: "On Hold" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {assignment ? "Edit Service Assignment" : "New Service Assignment"}
          </DialogTitle>
          {customerName && (
            <p className="text-slate-500 text-sm">For: {customerName}</p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!customerId && customers.length > 0 && (
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Service *</Label>
            <Select
              value={formData.service_id}
              onValueChange={handleServiceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.filter(s => s.is_active !== false).map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Completion</Label>
              <Input
                type="date"
                value={formData.expected_completion_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_completion_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assigned Technician</Label>
            <Input
              value={formData.assigned_technician}
              onChange={(e) => setFormData(prev => ({ ...prev, assigned_technician: e.target.value }))}
              placeholder="Technician name (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Service details, special instructions..."
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
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving || !formData.service_id}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
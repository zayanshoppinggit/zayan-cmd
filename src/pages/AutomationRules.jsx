import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Zap, 
  Plus,
  Pencil,
  Trash2,
  Power,
  Mail,
  MessageSquare,
  Smartphone,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PageHeader from "@/components/shared/PageHeader";

export default function AutomationRules() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deletingRule, setDeletingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    trigger: "status_change",
    status_value: "",
    channel: "whatsapp",
    subject_template: "",
    message_template: "",
    is_enabled: true
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['automationRules'],
    queryFn: () => base44.entities.AutomationRule.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AutomationRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
      setFormOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AutomationRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
      setFormOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AutomationRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
      setDeleteOpen(false);
      setDeletingRule(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_enabled }) => base44.entities.AutomationRule.update(id, { is_enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      trigger: "status_change",
      status_value: "",
      channel: "whatsapp",
      subject_template: "",
      message_template: "",
      is_enabled: true
    });
    setEditingRule(null);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name || "",
      trigger: rule.trigger || "status_change",
      status_value: rule.status_value || "",
      channel: rule.channel || "whatsapp",
      subject_template: rule.subject_template || "",
      message_template: rule.message_template || "",
      is_enabled: rule.is_enabled !== false
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (editingRule) {
      await updateMutation.mutateAsync({ id: editingRule.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const triggerOptions = [
    { value: "status_change", label: "Any Status Change" },
    { value: "service_completed", label: "Service Completed" },
    { value: "service_on_hold", label: "Service On Hold" },
    { value: "new_service", label: "New Service Assignment" },
  ];

  const statusOptions = [
    { value: "new_request", label: "New Request" },
    { value: "work_started", label: "Work Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "waiting_for_parts", label: "Waiting for Parts" },
    { value: "completed", label: "Completed" },
    { value: "on_hold", label: "On Hold" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const channelIcons = {
    email: { icon: Mail, color: "blue" },
    sms: { icon: Smartphone, color: "purple" },
    whatsapp: { icon: MessageSquare, color: "green" }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 min-h-screen">
      <PageHeader
        title="Automation Rules"
        subtitle="Automatically send messages when certain events occur"
        action={() => setFormOpen(true)}
        actionLabel="Create Rule"
        actionIcon={Plus}
      />

      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium mb-1">Integration Required</p>
          <p>Automation rules are configured but require WhatsApp/SMS API setup in Settings to actually send messages. Messages will be logged but not sent until APIs are configured.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No automation rules yet</h3>
            <p className="text-slate-500 mb-4">Create your first rule to automate customer communications</p>
            <Button onClick={() => setFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((rule) => {
            const ChannelIcon = channelIcons[rule.channel]?.icon || MessageSquare;
            const channelColor = channelIcons[rule.channel]?.color || "blue";
            const triggerLabel = triggerOptions.find(t => t.value === rule.trigger)?.label || rule.trigger;

            return (
              <Card key={rule.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-xl bg-${channelColor}-100 flex items-center justify-center flex-shrink-0`}>
                        <ChannelIcon className={`w-5 h-5 text-${channelColor}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{rule.name}</CardTitle>
                        <CardDescription className="text-xs">{triggerLabel}</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={rule.is_enabled}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: rule.id, is_enabled: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Badge variant="outline" className="capitalize mb-2">
                      {rule.channel}
                    </Badge>
                    {rule.status_value && (
                      <p className="text-xs text-slate-500">When status: {rule.status_value}</p>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-3">{rule.message_template}</p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(rule)}
                      className="flex-1"
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeletingRule(rule);
                        setDeleteOpen(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit" : "Create"} Automation Rule</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Notify on completion"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trigger Event *</Label>
                <Select
                  value={formData.trigger}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, trigger: value, status_value: "" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.trigger === "status_change" && (
                <div className="space-y-2">
                  <Label>Specific Status (Optional)</Label>
                  <Select
                    value={formData.status_value}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status_value: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Any Status Change</SelectItem>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Channel *</Label>
              <div className="flex gap-2">
                {[
                  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
                  { value: "sms", label: "SMS", icon: Smartphone },
                  { value: "email", label: "Email", icon: Mail },
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={formData.channel === value ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, channel: value }))}
                    className={formData.channel === value ? "bg-indigo-600" : ""}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {formData.channel === "email" && (
              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input
                  value={formData.subject_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject_template: e.target.value }))}
                  placeholder="Use {{customer_name}}, {{service_name}}, {{status}}"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Message Template *</Label>
              <Textarea
                value={formData.message_template}
                onChange={(e) => setFormData(prev => ({ ...prev, message_template: e.target.value }))}
                placeholder="Use {{customer_name}}, {{service_name}}, {{status}} for dynamic values"
                rows={5}
              />
              <p className="text-xs text-slate-500">
                Available variables: {"{{customer_name}}, {{service_name}}, {{status}}"}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-sm text-slate-800">Enable this rule</p>
                <p className="text-xs text-slate-500">Rule will trigger automatically when enabled</p>
              </div>
              <Switch
                checked={formData.is_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.message_template}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {editingRule ? "Update" : "Create"} Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation Rule?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingRule?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deletingRule.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
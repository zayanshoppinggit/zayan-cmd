import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  Wrench,
  Monitor,
  Camera,
  Sun,
  Battery,
  Printer,
  Bike,
  Settings,
  Power
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const iconMap = {
  Monitor, Camera, Sun, Battery, Printer, Bike, Wrench, Settings, Power
};

const availableIcons = [
  { name: "Wrench", icon: Wrench },
  { name: "Monitor", icon: Monitor },
  { name: "Camera", icon: Camera },
  { name: "Sun", icon: Sun },
  { name: "Battery", icon: Battery },
  { name: "Printer", icon: Printer },
  { name: "Bike", icon: Bike },
  { name: "Settings", icon: Settings },
  { name: "Power", icon: Power },
];

export default function Services() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Wrench",
    is_active: true,
    default_statuses: ["new_request", "work_started", "in_progress", "completed"]
  });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['allAssignments'],
    queryFn: () => base44.entities.ServiceAssignment.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setFormOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setFormOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "Wrench",
      is_active: true,
      default_statuses: ["new_request", "work_started", "in_progress", "completed"]
    });
    setSelectedService(null);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setFormData({
      name: service.name || "",
      description: service.description || "",
      icon: service.icon || "Wrench",
      is_active: service.is_active !== false,
      default_statuses: service.default_statuses || ["new_request", "work_started", "in_progress", "completed"]
    });
    setFormOpen(true);
  };

  const handleDelete = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedService) {
      await updateMutation.mutateAsync({ id: selectedService.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const getServiceStats = (serviceId) => {
    const serviceAssignments = assignments.filter(a => a.service_id === serviceId);
    const active = serviceAssignments.filter(a => !['completed', 'cancelled'].includes(a.status)).length;
    const completed = serviceAssignments.filter(a => a.status === 'completed').length;
    return { total: serviceAssignments.length, active, completed };
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 min-h-screen">
      <PageHeader
        title="Services"
        subtitle="Manage your service offerings"
        action={() => {
          resetForm();
          setFormOpen(true);
        }}
        actionLabel="Add Service"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4" />
                <div className="h-6 w-32 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-full bg-slate-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No services yet</h3>
            <p className="text-slate-500 mb-6">Add your first service to start managing customer work.</p>
            <Button onClick={() => setFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const IconComponent = iconMap[service.icon] || Wrench;
            const stats = getServiceStats(service.id);
            
            return (
              <Card 
                key={service.id} 
                className={`border-0 shadow-sm hover:shadow-md transition-all ${!service.is_active ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(service)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(service)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-semibold text-lg text-slate-800 mb-1">{service.name}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    {service.description || "No description"}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600">
                      <span className="font-semibold text-indigo-600">{stats.active}</span> active
                    </span>
                    <span className="text-slate-600">
                      <span className="font-semibold text-emerald-600">{stats.completed}</span> completed
                    </span>
                  </div>
                  {!service.is_active && (
                    <div className="mt-3 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
                      Inactive
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Service Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Service Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Computer & Laptop Service"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this service..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {availableIcons.map(({ name, icon: Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: name }))}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      formData.icon === name 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Service Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedService ? "Update" : "Create"} Service
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{serviceToDelete?.name}"? This will not delete existing assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate(serviceToDelete?.id)}
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
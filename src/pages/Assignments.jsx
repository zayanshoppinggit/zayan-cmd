import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2,
  Eye,
  RefreshCw,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import DataTable from "@/components/shared/DataTable";
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import AssignmentForm from "@/components/assignments/AssignmentForm";
import StatusUpdateDialog from "@/components/assignments/StatusUpdateDialog";

export default function Assignments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [assignmentForStatus, setAssignmentForStatus] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      setFormOpen(true);
    }
  }, []);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => base44.entities.ServiceAssignment.list('-created_date'),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceAssignment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setFormOpen(false);
      setSelectedAssignment(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceAssignment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setFormOpen(false);
      setSelectedAssignment(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServiceAssignment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ assignmentId, newStatus, notes, previousStatus, customerId, changedBy }) => {
      await base44.entities.ServiceAssignment.update(assignmentId, { 
        status: newStatus,
        ...(newStatus === 'completed' ? { actual_completion_date: new Date().toISOString().split('T')[0] } : {})
      });
      await base44.entities.StatusHistory.create({
        assignment_id: assignmentId,
        customer_id: customerId,
        previous_status: previousStatus,
        new_status: newStatus,
        changed_by: changedBy,
        notes: notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setStatusDialogOpen(false);
      setAssignmentForStatus(null);
    },
  });

  const handleSave = async (data) => {
    if (selectedAssignment) {
      await updateMutation.mutateAsync({ id: selectedAssignment.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setFormOpen(true);
  };

  const handleStatusUpdate = (assignment) => {
    setAssignmentForStatus(assignment);
    setStatusDialogOpen(true);
  };

  const handleDelete = (assignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const customerMap = React.useMemo(() => {
    const map = {};
    customers.forEach(c => { map[c.id] = c; });
    return map;
  }, [customers]);

  const filteredAssignments = assignments.filter(assignment => {
    const customer = customerMap[assignment.customer_id];
    const matchesSearch = 
      assignment.service_name?.toLowerCase().includes(search.toLowerCase()) ||
      customer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      assignment.assigned_technician?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
    const matchesService = serviceFilter === "all" || assignment.service_id === serviceFilter;
    const matchesPriority = priorityFilter === "all" || assignment.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesService && matchesPriority;
  });

  const columns = [
    {
      header: "Customer",
      cell: (row) => {
        const customer = customerMap[row.customer_id];
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              {customer?.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <Link 
                to={createPageUrl("CustomerDetail") + `?id=${row.customer_id}`}
                className="font-medium text-slate-800 hover:text-indigo-600"
              >
                {customer?.full_name || 'Unknown'}
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      header: "Service",
      cell: (row) => (
        <span className="font-medium text-slate-700">{row.service_name}</span>
      ),
    },
    {
      header: "Priority",
      cell: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Technician",
      cell: (row) => (
        <span className="text-sm text-slate-600">
          {row.assigned_technician || '-'}
        </span>
      ),
    },
    {
      header: "Due Date",
      cell: (row) => (
        <span className="text-sm text-slate-500">
          {row.expected_completion_date 
            ? format(new Date(row.expected_completion_date), "MMM d, yyyy")
            : '-'
          }
        </span>
      ),
    },
    {
      header: "",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusUpdate(row)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDelete(row)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "new_request", label: "New Request" },
    { value: "work_started", label: "Work Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "waiting_for_parts", label: "Waiting for Parts" },
    { value: "completed", label: "Completed" },
    { value: "on_hold", label: "On Hold" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 min-h-screen">
      <PageHeader
        title="Service Assignments"
        subtitle={`${assignments.length} total assignments`}
        action={() => {
          setSelectedAssignment(null);
          setFormOpen(true);
        }}
        actionLabel="New Assignment"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="pl-10 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-44 bg-white">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {services.map(service => (
              <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36 bg-white">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredAssignments}
        loading={isLoading}
        emptyMessage="No assignments found. Create your first service assignment."
      />

      <AssignmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        assignment={selectedAssignment}
        customers={customers}
        services={services}
        onSave={handleSave}
      />

      <StatusUpdateDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        assignment={assignmentForStatus}
        onSave={statusMutation.mutateAsync}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service assignment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate(assignmentToDelete?.id)}
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
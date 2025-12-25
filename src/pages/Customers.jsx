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
  Mail, 
  Phone, 
  Edit, 
  Trash2,
  Eye,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { CustomerStatusBadge } from "@/components/shared/StatusBadge";
import CustomerForm from "@/components/customers/CustomerForm";

export default function Customers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Check URL for action=new
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      setFormOpen(true);
    }
  }, []);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date'),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.CustomerGroup.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setFormOpen(false);
      setSelectedCustomer(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setFormOpen(false);
      setSelectedCustomer(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Customer.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    },
  });

  const handleSave = async (data) => {
    if (selectedCustomer) {
      await updateMutation.mutateAsync({ id: selectedCustomer.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormOpen(true);
  };

  const handleDelete = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteMutation.mutate(customerToDelete.id);
    }
  };

  const groupMap = React.useMemo(() => {
    const map = {};
    groups.forEach(g => { map[g.id] = g; });
    return map;
  }, [groups]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.email?.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone_number?.includes(search);
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    const matchesGroup = groupFilter === "all" || customer.groups?.includes(groupFilter);

    return matchesSearch && matchesStatus && matchesGroup;
  });

  const columns = [
    {
      header: "Customer",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            {row.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-800">{row.full_name}</p>
            <p className="text-sm text-slate-500">{row.email || 'No email'}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-3.5 h-3.5" />
            {row.phone_number}
          </div>
          {row.whatsapp_number && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MessageSquare className="w-3.5 h-3.5" />
              {row.whatsapp_number}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Groups",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.groups?.slice(0, 2).map(groupId => {
            const group = groupMap[groupId];
            return group ? (
              <Badge 
                key={groupId} 
                variant="outline" 
                className="text-xs"
                style={{ borderColor: group.color, color: group.color }}
              >
                {group.name}
              </Badge>
            ) : null;
          })}
          {row.groups?.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{row.groups.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => <CustomerStatusBadge status={row.status} />,
    },
    {
      header: "Created",
      cell: (row) => (
        <span className="text-sm text-slate-500">
          {format(new Date(row.created_date), "MMM d, yyyy")}
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
            <DropdownMenuItem asChild>
              <Link to={createPageUrl("CustomerDetail") + `?id=${row.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
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

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 min-h-screen">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} total customers`}
        action={() => {
          setSelectedCustomer(null);
          setFormOpen(true);
        }}
        actionLabel="Add Customer"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="pl-10 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue placeholder="Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {groups.map(group => (
              <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredCustomers}
        loading={isLoading}
        emptyMessage="No customers found. Add your first customer to get started."
      />

      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={selectedCustomer}
        groups={groups}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{customerToDelete?.full_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
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
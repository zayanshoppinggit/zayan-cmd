import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MessageSquare, 
  MapPin,
  Calendar,
  Edit,
  Plus,
  Clock,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, PriorityBadge, CustomerStatusBadge } from "@/components/shared/StatusBadge";
import CustomerForm from "@/components/customers/CustomerForm";
import AssignmentForm from "@/components/assignments/AssignmentForm";

export default function CustomerDetail() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const customerId = urlParams.get('id');

  const [editFormOpen, setEditFormOpen] = useState(false);
  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => base44.entities.Customer.filter({ id: customerId }),
    enabled: !!customerId,
    select: (data) => data[0],
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.CustomerGroup.list(),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', customerId],
    queryFn: () => base44.entities.ServiceAssignment.filter({ customer_id: customerId }, '-created_date'),
    enabled: !!customerId,
  });

  const { data: statusHistory = [] } = useQuery({
    queryKey: ['statusHistory', customerId],
    queryFn: () => base44.entities.StatusHistory.filter({ customer_id: customerId }, '-created_date'),
    enabled: !!customerId,
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['communications', customerId],
    queryFn: () => base44.entities.Communication.filter({ customer_id: customerId }, '-created_date'),
    enabled: !!customerId,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.update(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      setEditFormOpen(false);
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceAssignment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', customerId] });
      setAssignmentFormOpen(false);
    },
  });

  const groupMap = React.useMemo(() => {
    const map = {};
    groups.forEach(g => { map[g.id] = g; });
    return map;
  }, [groups]);

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="text-center py-16">
          <p className="text-slate-500">Customer not found</p>
          <Link to={createPageUrl("Customers")}>
            <Button className="mt-4">Back to Customers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Customers")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{customer.full_name}</h1>
              <CustomerStatusBadge status={customer.status} />
            </div>
            <p className="text-slate-500 mt-1">Customer since {format(new Date(customer.created_date), "MMMM yyyy")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setAssignmentFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
          <Button onClick={() => setEditFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Edit className="w-4 h-4 mr-2" />
            Edit Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Phone className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-medium">{customer.phone_number}</p>
              </div>
            </div>
            {customer.email && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              </div>
            )}
            {customer.whatsapp_number && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">WhatsApp</p>
                  <p className="font-medium">{customer.whatsapp_number}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="font-medium">{customer.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Groups & Notes */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Groups & Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-2">Groups</p>
              <div className="flex flex-wrap gap-2">
                {customer.groups?.length > 0 ? (
                  customer.groups.map(groupId => {
                    const group = groupMap[groupId];
                    return group ? (
                      <Badge 
                        key={groupId}
                        variant="outline"
                        style={{ borderColor: group.color, color: group.color, backgroundColor: `${group.color}10` }}
                      >
                        {group.name}
                      </Badge>
                    ) : null;
                  })
                ) : (
                  <span className="text-slate-400 text-sm">No groups assigned</span>
                )}
              </div>
            </div>
            {customer.notes && (
              <div>
                <p className="text-sm text-slate-500 mb-2">Notes</p>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="services" className="mt-8">
        <TabsList className="bg-white border">
          <TabsTrigger value="services">Assigned Services ({assignments.length})</TabsTrigger>
          <TabsTrigger value="history">Status Timeline</TabsTrigger>
          <TabsTrigger value="communications">Communications ({communications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-4">
          {assignments.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <p className="text-slate-500 mb-4">No services assigned to this customer</p>
                <Button onClick={() => setAssignmentFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-800">{assignment.service_name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Started: {assignment.start_date ? format(new Date(assignment.start_date), "MMM d, yyyy") : 'Not set'}
                          </span>
                          {assignment.expected_completion_date && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Due: {format(new Date(assignment.expected_completion_date), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                        {assignment.notes && (
                          <p className="mt-3 text-slate-600">{assignment.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={assignment.priority} />
                        <StatusBadge status={assignment.status} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              {statusHistory.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No status changes recorded</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                  <div className="space-y-6">
                    {statusHistory.map((history, index) => (
                      <div key={history.id} className="relative pl-10">
                        <div className="absolute left-2.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white" />
                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <StatusBadge status={history.new_status} />
                            {history.previous_status && (
                              <>
                                <span className="text-slate-400">from</span>
                                <StatusBadge status={history.previous_status} />
                              </>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">
                            {format(new Date(history.created_date), "MMM d, yyyy 'at' h:mm a")}
                            {history.changed_by && ` by ${history.changed_by}`}
                          </p>
                          {history.notes && (
                            <p className="mt-2 text-slate-600">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              {communications.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No communications sent yet</p>
              ) : (
                <div className="space-y-4">
                  {communications.map((comm) => (
                    <div key={comm.id} className="border-b border-slate-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {comm.channel}
                          </Badge>
                          {comm.subject && (
                            <span className="font-medium text-slate-800">{comm.subject}</span>
                          )}
                        </div>
                        <span className="text-sm text-slate-500">
                          {format(new Date(comm.created_date), "MMM d, yyyy h:mm a")}
                        </span>
                      </div>
                      <p className="text-slate-600">{comm.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CustomerForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        customer={customer}
        groups={groups}
        onSave={(data) => updateMutation.mutateAsync(data)}
      />

      <AssignmentForm
        open={assignmentFormOpen}
        onOpenChange={setAssignmentFormOpen}
        customerId={customerId}
        customerName={customer.full_name}
        services={services}
        onSave={(data) => createAssignmentMutation.mutateAsync(data)}
      />
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { 
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Wrench,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";

const statusSteps = [
  { key: "new_request", label: "Request Received", order: 1 },
  { key: "work_started", label: "Work Started", order: 2 },
  { key: "in_progress", label: "In Progress", order: 3 },
  { key: "waiting_for_parts", label: "Waiting", order: 3.5 },
  { key: "completed", label: "Completed", order: 4 },
];

function getStatusOrder(status) {
  const step = statusSteps.find(s => s.key === status);
  return step ? step.order : 0;
}

export default function CustomerPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        // Redirect to login if not authenticated
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Find customer record linked to this user
  const { data: customers = [] } = useQuery({
    queryKey: ['customerByEmail', user?.email],
    queryFn: () => base44.entities.Customer.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const customer = customers[0];

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['customerAssignments', customer?.id],
    queryFn: () => base44.entities.ServiceAssignment.filter({ customer_id: customer?.id }, '-created_date'),
    enabled: !!customer?.id,
  });

  const { data: statusHistory = [] } = useQuery({
    queryKey: ['customerStatusHistory', customer?.id],
    queryFn: () => base44.entities.StatusHistory.filter({ customer_id: customer?.id }, '-created_date'),
    enabled: !!customer?.id,
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['customerCommunications', customer?.id],
    queryFn: () => base44.entities.Communication.filter({ customer_id: customer?.id }, '-created_date'),
    enabled: !!customer?.id,
  });

  const activeAssignments = assignments.filter(a => !['completed', 'cancelled'].includes(a.status));
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">Z</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Zayan CMD</h1>
                <p className="text-sm text-slate-500">Customer Portal</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => base44.auth.logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Account Not Linked</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                Your login email ({user?.email}) is not linked to any customer profile. 
                Please contact Zayan Services to link your account.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Zayan Services</h1>
              <p className="text-sm text-slate-500">Customer Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium text-slate-800">{customer.full_name}</p>
              <p className="text-sm text-slate-500">{customer.email || customer.phone_number}</p>
            </div>
            <Button variant="outline" onClick={() => base44.auth.logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100">Active Services</p>
                  <p className="text-3xl font-bold mt-1">{activeAssignments.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Completed</p>
                  <p className="text-3xl font-bold mt-1">{completedAssignments.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-500 to-violet-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-100">Total Services</p>
                  <p className="text-3xl font-bold mt-1">{assignments.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Wrench className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="services">My Services</TabsTrigger>
            <TabsTrigger value="history">Status History</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            {loadingAssignments ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-24 bg-slate-100 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : assignments.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No Services Yet</h3>
                  <p className="text-slate-500">You don't have any services assigned.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const currentOrder = getStatusOrder(assignment.status);
                  const isCancelled = assignment.status === 'cancelled';
                  const isOnHold = assignment.status === 'on_hold';
                  
                  return (
                    <Card key={assignment.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-slate-800">{assignment.service_name}</h3>
                              <PriorityBadge priority={assignment.priority} />
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                              {assignment.start_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Started: {format(new Date(assignment.start_date), "MMM d, yyyy")}
                                </span>
                              )}
                              {assignment.expected_completion_date && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Due: {format(new Date(assignment.expected_completion_date), "MMM d, yyyy")}
                                </span>
                              )}
                            </div>
                          </div>
                          <StatusBadge status={assignment.status} />
                        </div>

                        {/* Status Progress */}
                        {!isCancelled && !isOnHold && (
                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                              {statusSteps.filter(s => s.key !== 'waiting_for_parts').map((step, index) => {
                                const isActive = currentOrder >= step.order;
                                const isCurrent = assignment.status === step.key;
                                
                                return (
                                  <React.Fragment key={step.key}>
                                    <div className="flex flex-col items-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                        isActive 
                                          ? 'bg-indigo-600 text-white' 
                                          : 'bg-slate-200 text-slate-400'
                                      } ${isCurrent ? 'ring-4 ring-indigo-200' : ''}`}>
                                        {isActive ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <span className="text-xs font-medium">{index + 1}</span>
                                        )}
                                      </div>
                                      <span className={`text-xs mt-2 ${isActive ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                                        {step.label}
                                      </span>
                                    </div>
                                    {index < statusSteps.filter(s => s.key !== 'waiting_for_parts').length - 1 && (
                                      <div className={`flex-1 h-1 mx-2 rounded ${
                                        currentOrder > step.order ? 'bg-indigo-600' : 'bg-slate-200'
                                      }`} />
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {assignment.status === 'waiting_for_parts' && (
                          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-amber-800 text-sm">
                              <AlertCircle className="w-4 h-4 inline mr-2" />
                              Waiting for parts - we'll update you once parts arrive
                            </p>
                          </div>
                        )}

                        {assignment.notes && (
                          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">{assignment.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {statusHistory.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No status updates yet</p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                    <div className="space-y-6">
                      {statusHistory.map((history) => (
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

          <TabsContent value="profile">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  My Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Full Name</p>
                        <p className="font-medium text-slate-800">{customer.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Phone</p>
                        <p className="font-medium text-slate-800">{customer.phone_number}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {customer.email && (
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Email</p>
                          <p className="font-medium text-slate-800">{customer.email}</p>
                        </div>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Address</p>
                          <p className="font-medium text-slate-800">{customer.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Need to update your details? Contact Zayan Services support.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Wrench
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/StatsCard";
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";

export default function Dashboard() {
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => base44.entities.ServiceAssignment.list('-created_date', 100),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
  });

  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const pendingAssignments = assignments.filter(a => 
    !['completed', 'cancelled'].includes(a.status)
  ).length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const urgentAssignments = assignments.filter(a => 
    a.priority === 'urgent' && !['completed', 'cancelled'].includes(a.status)
  ).length;

  const recentAssignments = assignments.slice(0, 5);

  const customerMap = React.useMemo(() => {
    const map = {};
    customers.forEach(c => { map[c.id] = c; });
    return map;
  }, [customers]);

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Customers"
          value={customers.length}
          subtitle={`${activeCustomers} active`}
          icon={Users}
          color="indigo"
        />
        <StatsCard
          title="Active Services"
          value={pendingAssignments}
          subtitle="In progress"
          icon={ClipboardList}
          color="amber"
        />
        <StatsCard
          title="Completed"
          value={completedAssignments}
          subtitle="This period"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Urgent"
          value={urgentAssignments}
          subtitle="Needs attention"
          icon={AlertCircle}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assignments */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Recent Service Assignments</CardTitle>
            <Link to={createPageUrl("Assignments")}>
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingAssignments ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentAssignments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No service assignments yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentAssignments.map((assignment) => {
                  const customer = customerMap[assignment.customer_id];
                  return (
                    <div 
                      key={assignment.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{assignment.service_name}</p>
                          <p className="text-sm text-slate-500">
                            {customer?.full_name || 'Unknown Customer'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <PriorityBadge priority={assignment.priority} />
                        <StatusBadge status={assignment.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services Overview */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Services Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">No services configured</p>
                <Link to={createPageUrl("Services")}>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Add Services
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {services.slice(0, 6).map((service) => {
                  const count = assignments.filter(a => a.service_id === service.id).length;
                  return (
                    <div 
                      key={service.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-700">{service.name}</span>
                      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {count} jobs
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to={createPageUrl("Customers") + "?action=new"}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition-colors">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="font-medium text-slate-700">Add Customer</p>
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl("Assignments") + "?action=new"}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-200 transition-colors">
                  <ClipboardList className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="font-medium text-slate-700">New Assignment</p>
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl("Communications")}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-200 transition-colors">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <p className="font-medium text-slate-700">Send Message</p>
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl("Services")}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                  <Wrench className="w-6 h-6 text-purple-600" />
                </div>
                <p className="font-medium text-slate-700">Manage Services</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
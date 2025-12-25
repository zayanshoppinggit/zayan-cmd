import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Building2, 
  Bell, 
  Shield, 
  Palette,
  Save,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const handleInvite = async () => {
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      setInviteSuccess(true);
      setInviteEmail("");
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setTimeout(() => {
        setInviteOpen(false);
        setInviteSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to invite user:", error);
    }
    setInviting(false);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your application settings</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="users">Users & Access</TabsTrigger>
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Team Members</CardTitle>
                <CardDescription>Manage who has access to the dashboard</CardDescription>
              </div>
              <Button onClick={() => setInviteOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{user.full_name || 'Unnamed User'}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Business Information
              </CardTitle>
              <CardDescription>Your business details displayed across the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input defaultValue="Zayan Services India" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input type="email" placeholder="contact@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input placeholder="https://example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="Full business address" />
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-slate-800">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive updates via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-slate-800">New Service Alerts</p>
                    <p className="text-sm text-slate-500">Get notified when new service is assigned</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-slate-800">Status Change Alerts</p>
                    <p className="text-sm text-slate-500">Notify when service status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-800">Customer Portal Access</p>
                    <p className="text-sm text-slate-500">Allow customers to view their services</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>

          {inviteSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-medium text-slate-800">Invitation Sent!</p>
              <p className="text-slate-500">The user will receive an email to join.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin (Full Access)</SelectItem>
                    <SelectItem value="user">Customer (View Only)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {inviteRole === "admin" 
                    ? "Admins can manage all customers, services, and settings."
                    : "Customers can only view their own profile and services."}
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {inviting ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
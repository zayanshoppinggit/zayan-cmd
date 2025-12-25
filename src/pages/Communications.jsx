import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { 
  Send, 
  Mail, 
  MessageSquare,
  Smartphone,
  Users,
  User,
  FileText,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import PageHeader from "@/components/shared/PageHeader";

export default function Communications() {
  const queryClient = useQueryClient();
  const [composeOpen, setComposeOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [recipientType, setRecipientType] = useState("individual");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [channel, setChannel] = useState("email");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [sending, setSending] = useState(false);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.CustomerGroup.list(),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.MessageTemplate.list(),
  });

  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['communications'],
    queryFn: () => base44.entities.Communication.list('-created_date', 100),
  });

  const sendMutation = useMutation({
    mutationFn: async (data) => {
      // Create communication records
      if (data.recipientType === "individual") {
        for (const customerId of data.customerIds) {
          await base44.entities.Communication.create({
            customer_id: customerId,
            channel: data.channel,
            subject: data.subject,
            message: data.message,
            status: "sent"
          });
        }
      } else if (data.recipientType === "group") {
        const groupCustomers = customers.filter(c => c.groups?.includes(data.groupId));
        await base44.entities.Communication.create({
          customer_ids: groupCustomers.map(c => c.id),
          channel: data.channel,
          subject: data.subject,
          message: data.message,
          status: "sent",
          sent_to_group: data.groupId,
          is_bulk: true
        });
      } else {
        await base44.entities.Communication.create({
          customer_ids: customers.map(c => c.id),
          channel: data.channel,
          subject: data.subject,
          message: data.message,
          status: "sent",
          is_bulk: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      setComposeOpen(false);
      resetForm();
    },
  });

  const templateMutation = useMutation({
    mutationFn: (data) => base44.entities.MessageTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setTemplateOpen(false);
      setTemplateName("");
    },
  });

  const resetForm = () => {
    setRecipientType("individual");
    setSelectedCustomers([]);
    setSelectedGroup("");
    setChannel("email");
    setSubject("");
    setMessage("");
  };

  const handleSend = async () => {
    setSending(true);
    await sendMutation.mutateAsync({
      recipientType,
      customerIds: selectedCustomers,
      groupId: selectedGroup,
      channel,
      subject,
      message
    });
    setSending(false);
  };

  const applyTemplate = (template) => {
    setSubject(template.subject || "");
    setMessage(template.message || "");
    if (template.channel !== "all") {
      setChannel(template.channel);
    }
  };

  const customerMap = React.useMemo(() => {
    const map = {};
    customers.forEach(c => { map[c.id] = c; });
    return map;
  }, [customers]);

  const groupMap = React.useMemo(() => {
    const map = {};
    groups.forEach(g => { map[g.id] = g; });
    return map;
  }, [groups]);

  const channelIcons = {
    email: Mail,
    sms: Smartphone,
    whatsapp: MessageSquare
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 min-h-screen">
      <PageHeader
        title="Communications"
        subtitle="Send messages to customers via Email, SMS, or WhatsApp"
        action={() => setComposeOpen(true)}
        actionLabel="Compose Message"
        actionIcon={Send}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {communications.filter(c => c.channel === 'email').length}
                </p>
                <p className="text-sm text-slate-500">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {communications.filter(c => c.channel === 'sms').length}
                </p>
                <p className="text-sm text-slate-500">SMS Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {communications.filter(c => c.channel === 'whatsapp').length}
                </p>
                <p className="text-sm text-slate-500">WhatsApp Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{templates.length}</p>
                <p className="text-sm text-slate-500">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="history">Message History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Communications</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : communications.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No messages sent yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {communications.map((comm) => {
                    const ChannelIcon = channelIcons[comm.channel] || Mail;
                    const customer = customerMap[comm.customer_id];
                    const group = groupMap[comm.sent_to_group];
                    
                    return (
                      <div 
                        key={comm.id}
                        className="p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              comm.channel === 'email' ? 'bg-blue-100' :
                              comm.channel === 'sms' ? 'bg-purple-100' : 'bg-green-100'
                            }`}>
                              <ChannelIcon className={`w-4 h-4 ${
                                comm.channel === 'email' ? 'text-blue-600' :
                                comm.channel === 'sms' ? 'text-purple-600' : 'text-green-600'
                              }`} />
                            </div>
                            <div>
                              {comm.is_bulk ? (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-slate-400" />
                                  <span className="font-medium text-slate-800">
                                    {group ? group.name : 'All Customers'}
                                  </span>
                                  <Badge variant="outline" className="text-xs">Bulk</Badge>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-slate-400" />
                                  <span className="font-medium text-slate-800">
                                    {customer?.full_name || 'Unknown'}
                                  </span>
                                </div>
                              )}
                              {comm.subject && (
                                <p className="text-sm text-slate-600">{comm.subject}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="w-4 h-4" />
                            {format(new Date(comm.created_date), "MMM d, h:mm a")}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm pl-11 line-clamp-2">{comm.message}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Message Templates</CardTitle>
              <Button onClick={() => setTemplateOpen(true)} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">No templates yet</p>
                  <Button onClick={() => setTemplateOpen(true)}>Create Template</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div 
                      key={template.id}
                      className="p-4 border border-slate-200 rounded-lg hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-800">{template.name}</h4>
                        <Badge variant="outline" className="capitalize">{template.channel}</Badge>
                      </div>
                      {template.subject && (
                        <p className="text-sm text-slate-600 mb-1">Subject: {template.subject}</p>
                      )}
                      <p className="text-sm text-slate-500 line-clamp-2">{template.message}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          applyTemplate(template);
                          setComposeOpen(true);
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Channel Selection */}
            <div className="space-y-2">
              <Label>Channel</Label>
              <div className="flex gap-2">
                {[
                  { value: "email", label: "Email", icon: Mail },
                  { value: "sms", label: "SMS", icon: Smartphone },
                  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={channel === value ? "default" : "outline"}
                    onClick={() => setChannel(value)}
                    className={channel === value ? "bg-indigo-600" : ""}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Recipient Type */}
            <div className="space-y-2">
              <Label>Send To</Label>
              <Select value={recipientType} onValueChange={setRecipientType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Customers</SelectItem>
                  <SelectItem value="group">Customer Group</SelectItem>
                  <SelectItem value="all">All Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipients */}
            {recipientType === "individual" && (
              <div className="space-y-2">
                <Label>Select Customers</Label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {customers.map((customer) => (
                    <div key={customer.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`customer-${customer.id}`}
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCustomers(prev => [...prev, customer.id]);
                          } else {
                            setSelectedCustomers(prev => prev.filter(id => id !== customer.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={`customer-${customer.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {customer.full_name} - {customer.email || customer.phone_number}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recipientType === "group" && (
              <div className="space-y-2">
                <Label>Select Group</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Subject (for email) */}
            {channel === "email" && (
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here... Use {{customer_name}} for personalization"
                rows={5}
              />
            </div>

            {/* Templates Quick Select */}
            {templates.length > 0 && (
              <div className="space-y-2">
                <Label>Quick Templates</Label>
                <div className="flex flex-wrap gap-2">
                  {templates.slice(0, 4).map((template) => (
                    <Button
                      key={template.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template)}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend}
              disabled={sending || !message || (recipientType === "individual" && selectedCustomers.length === 0) || (recipientType === "group" && !selectedGroup)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Creation Dialog */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name *</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Welcome Message"
              />
            </div>

            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {channel === "email" && (
              <div className="space-y-2">
                <Label>Subject Template</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Message Template *</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your template... Use {{customer_name}} for personalization"
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                templateMutation.mutate({
                  name: templateName,
                  channel,
                  subject,
                  message
                });
              }}
              disabled={!templateName || !message}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
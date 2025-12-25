import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Settings, 
  MessageSquare, 
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Wrench,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        // User not logged in
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const isAdmin = user?.role === "admin";
  
  // Customer-facing pages
  const customerPages = ["CustomerPortal"];
  const isCustomerPage = customerPages.includes(currentPageName);

  // If it's a customer page, show customer layout
  if (isCustomerPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {children}
      </div>
    );
  }

  const adminNavItems = [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Customers", icon: Users, page: "Customers" },
    { name: "Services", icon: Wrench, page: "Services" },
    { name: "Assignments", icon: ClipboardList, page: "Assignments" },
    { name: "Groups", icon: FolderOpen, page: "Groups" },
    { name: "Communications", icon: MessageSquare, page: "Communications" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <style>{`
        :root {
          --primary: 234 89% 74%;
          --primary-foreground: 0 0% 100%;
        }
        
        .sidebar-transition {
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-item-hover:hover {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
        }
        
        .nav-item-active {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.08) 100%);
          border-left: 3px solid rgb(99, 102, 241);
        }
        
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9);
        }
      `}</style>

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 shadow-sm z-40 sidebar-transition ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-lg leading-tight">Zayan CMD</h1>
                <p className="text-xs text-slate-500">Customer Management</p>
              </div>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hover:bg-slate-100"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'nav-item-active text-indigo-700 font-medium' 
                    : 'text-slate-600 hover:text-slate-900 nav-item-hover'
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : ''}`} />
                {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <Avatar className="h-8 w-8 bg-gradient-to-br from-indigo-400 to-purple-500">
                  <AvatarFallback className="bg-transparent text-white text-sm">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-700 truncate">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to={createPageUrl("CustomerPortal")} className="cursor-pointer">
                  View Customer Portal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => base44.auth.logout()}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
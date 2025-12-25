import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchFilter({ 
  value, 
  onChange, 
  placeholder = "Search...",
  className = ""
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 bg-white border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
      />
    </div>
  );
}
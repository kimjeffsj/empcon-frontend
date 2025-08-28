"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/ui/select";
import { Search } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: Array<{
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder: string;
    width?: string;
  }>;
}

export function SearchFilter({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search...",
  filters = []
}: SearchFilterProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Additional Filters */}
          {filters.map((filter, index) => (
            <Select 
              key={index}
              value={filter.value}
              onValueChange={filter.onChange}
            >
              <SelectTrigger className={filter.width || "w-40"}>
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
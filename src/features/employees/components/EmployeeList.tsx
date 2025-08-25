"use client";

import { useMemo, useState } from "react";
import { mockDepartments, mockEmployees } from "../data/mockEmployees";
import { EmployeeResponse } from "@empcon/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Edit, Mail, Phone, Plus, Search, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

export const EmployeeList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filtered Employees (useMemo)
  const filteredEmployees = useMemo(() => {
    return mockEmployees.filter((employee) => {
      // Name, Email, Department keyword filter
      const searchMatch =
        searchTerm === "" ||
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Department filter
      const departmentMatch =
        departmentFilter === "all" ||
        employee.departmentId === departmentFilter;

      // Status Filter
      const statusMatch =
        statusFilter === "all" || employee.status === statusFilter;

      return searchMatch && departmentMatch && statusMatch;
    });
  }, [searchTerm, departmentFilter, statusFilter]);

  const getStatusBadge = (status: EmployeeResponse["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      case "ON_LEAVE":
        return <Badge variant="outline">On Leave</Badge>;
      case "TERMINATED":
        return <Badge variant="destructive">Terminated</Badge>;
    }
  };

  const formatPay = (payRate: number, payType: "HOURLY" | "SALARY") => {
    if (payType === "HOURLY") {
      return `$${payRate.toFixed(2)}/hr`;
    } else {
      return `$${payRate.toLocaleString()}/yr`;
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-muted-foreground">
            Manage and view employee information
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {/* 검색 입력 */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* 부서 필터 */}
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {mockDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 상태 필터 */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 직원 목록 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>
            Employee List ({filteredEmployees.length} employees)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Department/Position</TableHead>
                <TableHead>Pay Rate</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  {/* 이름 */}
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {employee.employeeNumber}
                      </p>
                    </div>
                  </TableCell>

                  {/* 연락처 */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{employee.phone}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* 부서/직책 */}
                  <TableCell>
                    <div>
                      <p className="font-medium">{employee.department?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.position?.title}
                      </p>
                    </div>
                  </TableCell>

                  {/* 급여 */}
                  <TableCell>
                    {formatPay(employee.payRate, employee.payType)}
                  </TableCell>

                  {/* 입사일 */}
                  <TableCell>
                    {new Date(employee.hireDate).toLocaleDateString()}
                  </TableCell>

                  {/* 상태 */}
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>

                  {/* 액션 */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 검색 결과가 없을 때 */}
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No employees found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

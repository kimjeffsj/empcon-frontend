"use client";

import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { CreateEmployeeRequest } from "@empcon/types";
import { Calendar, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import {
  calculateAge,
  calculateAnnualSalary,
  formatPayRate,
  formatSIN,
} from "@/lib/formatter";

interface PayInfoStepProps {
  data: Partial<CreateEmployeeRequest>;
  onUpdate: (data: Partial<CreateEmployeeRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
  currentUserRole?: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

export const PayInfoStep = ({
  data,
  onUpdate,
  onValidationChange,
  currentUserRole = "ADMIN",
}: PayInfoStepProps) => {
  const [localData, setLocalData] = useState({
    payType: data.payType || ("HOURLY" as "HOURLY" | "SALARY"),
    payRate: data.payRate?.toString() || "",
    dateOfBirth: data.dateOfBirth || "",
    sin: data.sin || "",
    role: data.role || ("EMPLOYEE" as "EMPLOYEE" | "MANAGER"),
  });

  const handleFieldChange = (field: string, value: string | number) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);

    // convert pay rate(string) to number
    const updateData =
      field === "payRate"
        ? { ...newData, payRate: parseFloat(value.toString()) || 0 }
        : { ...newData, payRate: parseFloat(newData.payRate) || 0 };

    onUpdate(updateData);
  };

  // Reset payRate fields when payType changes
  const handlePayTypeChange = (payType: "HOURLY" | "SALARY") => {
    const newData = { ...localData, payType, payRate: "" };
    setLocalData(newData);
    onUpdate({ ...newData, payRate: 0 });
  };

  // SIN format (000-000-000)
  const handleSINChange = (value: string) => {
    handleFieldChange("sin", formatSIN(value));
  };

  // Pay rate formatting
  const handlePayRateChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");

    // Only one period
    const parts = cleaned.split(".");
    let formatted = parts[0];
    if (parts.length > 1) {
      formatted += "." + parts[1].slice(0, 2); // 소수점 둘째 자리까지만
    }

    handleFieldChange("payRate", formatted);
  };

  // Validation
  const validateStep = () => {
    const payRateNum = parseFloat(localData.payRate);

    // Check required fields
    const hasRequiredFields =
      !!localData.payType &&
      !!localData.payRate &&
      !!localData.dateOfBirth &&
      !!localData.sin;

    // Validate pay rate
    const payRateValid = payRateNum > 0 && payRateNum <= 999999;

    // Age validation (over 18)
    const age = calculateAge(localData.dateOfBirth);
    const ageValid = age !== null && age >= 18 && age <= 100;

    // SIN validation
    const sinDigits = localData.sin.replace(/\D/g, "");
    const sinValid = sinDigits.length === 9;

    return hasRequiredFields && payRateValid && ageValid && sinValid;
  };

  useEffect(() => {
    onValidationChange(validateStep());
  }, [localData]);

  const currentAge = calculateAge(localData.dateOfBirth);
  const payRateNum = parseFloat(localData.payRate) || 0;

  return (
    <div className="space-y-6">
      {/* Employment Type */}
      <div>
        <h4 className="font-medium mb-4">Employment Details</h4>
        <div className="space-y-4">
          <div className="space-y-3">
            <Label>
              Employee Role <span className="text-red-500">*</span>
              {currentUserRole === "MANAGER" && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Managers can only create Employee roles)
                </span>
              )}
            </Label>
            <RadioGroup
              value={localData.role}
              onValueChange={(value) => handleFieldChange("role", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="EMPLOYEE" id="employee" />
                <Label htmlFor="employee">Employee</Label>
              </div>
              {/* ADMIN만 MANAGER 역할 생성 가능 */}
              {currentUserRole === "ADMIN" && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MANAGER" id="manager" />
                  <Label htmlFor="manager">Manager</Label>
                </div>
              )}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Pay Information */}
      <div>
        <h4 className="font-medium mb-4">Compensation</h4>
        <div className="space-y-4">
          <div className="space-y-3">
            <Label>
              Pay Type <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={localData.payType}
              onValueChange={handlePayTypeChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="HOURLY" id="hourly" />
                <Label htmlFor="hourly">Hourly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SALARY" id="salary" />
                <Label htmlFor="salary">Annual Salary</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payRate">
              {localData.payType === "HOURLY" ? "Hourly Rate" : "Annual Salary"}
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="payRate"
                value={localData.payRate}
                onChange={(e) => handlePayRateChange(e.target.value)}
                placeholder={localData.payType === "HOURLY" ? "25.00" : "50000"}
                className="pl-9"
              />
            </div>
            {localData.payType === "HOURLY" && payRateNum > 0 && (
              <p className="text-xs text-muted-foreground">
                Estimated annual: $
                {calculateAnnualSalary(payRateNum).toLocaleString()}
                (based on 40hrs/week)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <h4 className="font-medium mb-4">Personal Details</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="dateOfBirth"
                type="date"
                value={localData.dateOfBirth}
                onChange={(e) =>
                  handleFieldChange("dateOfBirth", e.target.value)
                }
                className="pl-9"
                max={
                  new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                }
              />
            </div>
            {currentAge && (
              <p className="text-xs text-muted-foreground">
                Age: {currentAge} years old
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sin">
              Social Insurance Number (SIN){" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sin"
              value={localData.sin}
              onChange={(e) => handleSINChange(e.target.value)}
              placeholder="000-000-000"
              maxLength={11}
            />
            <p className="text-xs text-muted-foreground">
              SIN will be encrypted and securely stored
            </p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {payRateNum > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h5 className="font-medium text-sm mb-3">Compensation Summary</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Pay Type</p>
                <p className="font-medium">
                  {localData.payType === "HOURLY" ? "Hourly" : "Annual Salary"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Rate</p>
                <p className="font-medium">
                  ${payRateNum.toLocaleString()}
                  {localData.payType === "HOURLY" ? "/hr" : "/year"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium">{localData.role}</p>
              </div>
              {currentAge && (
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium">{currentAge} years</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

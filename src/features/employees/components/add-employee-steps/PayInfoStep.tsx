"use client";

import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { CreateEmployeeRequest, EmployeeResponse } from "@empcon/types";
import { Calendar, DollarSign, Edit3, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useLazyGetEmployeeSINQuery } from "@/store/api/employeesApi";
import {
  calculateAge,
  calculateAnnualSalary,
  cleanSIN,
  formatSIN,
  formatPayRateInput,
  parsePayRate,
} from "@/lib/formatter";

interface PayInfoStepProps {
  data: Partial<CreateEmployeeRequest>;
  onUpdate: (data: Partial<CreateEmployeeRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
  currentUserRole?: "ADMIN" | "MANAGER" | "EMPLOYEE";
  mode?: "create" | "edit";
  initialData?: EmployeeResponse;
}

export const PayInfoStep = ({
  data,
  onUpdate,
  onValidationChange,
  currentUserRole = "ADMIN",
  mode = "create",
  initialData,
}: PayInfoStepProps) => {
  const [localData, setLocalData] = useState({
    payType: data.payType || ("HOURLY" as "HOURLY" | "SALARY"),
    payRate: data.payRate?.toString() || "",
    dateOfBirth: data.dateOfBirth || "",
    sin: data.sin || "",
    role: data.role || ("EMPLOYEE" as "EMPLOYEE" | "MANAGER"),
  });

  // SIN editing and viewing state
  const [isEditingSIN, setIsEditingSIN] = useState(false);
  const [isLoadingSIN, setIsLoadingSIN] = useState(false);
  const [fullSIN, setFullSIN] = useState("");

  // SIN API hook
  const [getSINTrigger] = useLazyGetEmployeeSINQuery();

  // Check if we're in edit mode with existing SIN
  const hasExistingSIN = mode === "edit" && initialData?.hasSIN;
  const maskedSIN =
    mode === "edit" && initialData?.sinMasked ? initialData.sinMasked : "";

  // Toggle SIN editing mode
  const handleToggleSINEdit = useCallback(async () => {
    if (!hasExistingSIN || !initialData?.id) return;

    if (!isEditingSIN) {
      // Load full SIN when entering edit mode
      setIsLoadingSIN(true);
      try {
        const result = await getSINTrigger(initialData.id).unwrap();
        setFullSIN(result.sin);
        const newData = { ...localData, sin: result.sin };
        setLocalData(newData);

        // Update parent formData with loaded SIN
        const updateData = {
          ...newData,
          payRate: parsePayRate(newData.payRate),
        };
        onUpdate(updateData);

        setIsEditingSIN(true);
      } catch (error) {
        console.error("Failed to load SIN:", error);
      } finally {
        setIsLoadingSIN(false);
      }
    } else {
      // Cancel editing - clear SIN from both local and parent data
      setIsEditingSIN(false);
      setFullSIN("");
      const newData = { ...localData, sin: "" };
      setLocalData(newData);

      // Update parent formData to clear SIN
      const updateData = {
        ...newData,
        payRate: parsePayRate(newData.payRate),
      };
      onUpdate(updateData);
    }
  }, [
    hasExistingSIN,
    initialData?.id,
    isEditingSIN,
    getSINTrigger,
    localData,
    onUpdate,
  ]);

  // Synchronize with data prop changes (for Edit mode)
  useEffect(() => {
    setLocalData({
      payType: data.payType || ("HOURLY" as "HOURLY" | "SALARY"),
      payRate: data.payRate?.toString() || "",
      dateOfBirth: data.dateOfBirth || "",
      sin: data.sin || "",
      role: data.role || ("EMPLOYEE" as "EMPLOYEE" | "MANAGER"),
    });
  }, [data]);

  const handleFieldChange = (field: string, value: string | number) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);

    // Only convert payRate when payRate field is being updated
    if (field === "payRate") {
      const updateData = {
        ...newData,
        payRate: parsePayRate(value.toString()),
      };
      onUpdate(updateData);
    } else {
      // For other fields, preserve existing payRate as number
      const updateData = { ...newData, payRate: parsePayRate(newData.payRate) };
      onUpdate(updateData);
    }
  };

  // Reset payRate fields when payType changes
  const handlePayTypeChange = (payType: "HOURLY" | "SALARY") => {
    const newData = { ...localData, payType, payRate: "" };
    setLocalData(newData);
    onUpdate({ ...newData, payRate: parsePayRate("") });
  };

  // SIN format (000-000-000)
  const handleSINChange = (value: string) => {
    handleFieldChange("sin", cleanSIN(value));
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

    // Check required fields (SIN is conditional in edit mode)
    const baseRequiredFields =
      !!localData.payType && !!localData.payRate && !!localData.dateOfBirth;

    // SIN validation logic based on mode and editing state
    let sinValid = true;

    if (mode === "create") {
      // Create mode: SIN is required and must be valid
      if (!localData.sin) {
        sinValid = false;
      } else {
        const sinDigits = localData.sin.replace(/\D/g, "");
        sinValid = sinDigits.length === 9;
      }
    } else if (mode === "edit") {
      if (hasExistingSIN && !isEditingSIN) {
        // Edit mode: Has existing SIN and not editing = always valid
        sinValid = true;
      } else if (!hasExistingSIN || isEditingSIN) {
        // Edit mode: No existing SIN OR editing = requires valid input
        if (!localData.sin) {
          sinValid = false;
        } else {
          const sinDigits = localData.sin.replace(/\D/g, "");
          sinValid = sinDigits.length === 9;
        }
      }
    }

    // Validate pay rate
    const payRateValid = payRateNum > 0 && payRateNum <= 999999;

    // Age validation (over 18)
    const age = calculateAge(localData.dateOfBirth);
    const ageValid = age !== null && age >= 18 && age <= 100;

    return baseRequiredFields && sinValid && payRateValid && ageValid;
  };

  useEffect(() => {
    onValidationChange(validateStep());
  }, [localData, isEditingSIN, hasExistingSIN]);

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
                onBlur={(e) => {
                  const formatted = formatPayRateInput(e.target.value);
                  if (formatted !== e.target.value) {
                    handleFieldChange("payRate", formatted);
                  }
                }}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="sin">
                Social Insurance Number (SIN){" "}
                {(mode === "create" ||
                  (mode === "edit" && (!hasExistingSIN || isEditingSIN))) && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              {hasExistingSIN && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleSINEdit}
                  disabled={isLoadingSIN}
                  className="h-6 px-2 text-xs"
                >
                  {isLoadingSIN ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : isEditingSIN ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit SIN
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* SIN Input */}
            {mode === "create" ||
            (hasExistingSIN && isEditingSIN) ||
            !hasExistingSIN ? (
              <Input
                id="sin"
                value={formatSIN(localData.sin)}
                onChange={(e) => handleSINChange(e.target.value)}
                placeholder="000-000-000"
                maxLength={11}
                disabled={isLoadingSIN}
              />
            ) : (
              <Input
                id="sin"
                value={maskedSIN}
                disabled
                className="bg-gray-50 text-gray-500"
                placeholder="xxx-xxx-xxx"
              />
            )}

            <p className="text-xs text-muted-foreground">
              {hasExistingSIN && !isEditingSIN
                ? "SIN is securely stored. Click 'Edit SIN' to modify."
                : "SIN will be encrypted and securely stored"}
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

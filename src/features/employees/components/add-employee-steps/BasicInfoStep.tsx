"use client";

import { CreateEmployeeRequest, EmployeeResponse } from "@empcon/types";
import { useEffect, useState, useCallback } from "react";
import { mockDepartments, mockPositions } from "../../data/mockEmployees";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cleanPhoneNumber, formatPhoneNumber } from "@/lib/formatter";
import { useLazyValidateEmailQuery } from "@/store/api/employeesApi";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface BasicInfoStepProps {
  data: Partial<CreateEmployeeRequest>;
  onUpdate: (data: Partial<CreateEmployeeRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
  mode?: 'create' | 'edit';
  initialData?: EmployeeResponse;
}

export const BasicInfoStep = ({
  data,
  onUpdate,
  onValidationChange,
  mode = 'create',
  initialData,
}: BasicInfoStepProps) => {
  // Local state
  const [localData, setLocalData] = useState({
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    middleName: data.middleName || "",
    email: data.email || "",
    phone: data.phone || "",
    departmentId: data.departmentId || "",
    positionId: data.positionId || "",
    hireDate: data.hireDate || "",
  });

  // Email validation state
  const [emailValidationState, setEmailValidationState] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    message: string;
  }>({
    isValidating: false,
    isValid: null,
    message: "",
  });

  // Email validation hook
  const [validateEmailTrigger] = useLazyValidateEmailQuery();

  // Email validation function
  const validateEmail = useCallback(async (email: string) => {
    // Skip validation if email is empty or invalid format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailValidationState({
        isValidating: false,
        isValid: null,
        message: "",
      });
      return;
    }

    // Skip validation in edit mode if email hasn't changed
    if (mode === 'edit' && initialData && email === initialData.email) {
      setEmailValidationState({
        isValidating: false,
        isValid: true,
        message: "Current email",
      });
      return;
    }

    setEmailValidationState({
      isValidating: true,
      isValid: null,
      message: "Checking availability...",
    });

    try {
      const result = await validateEmailTrigger(email).unwrap();
      setEmailValidationState({
        isValidating: false,
        isValid: result.available,
        message: result.message,
      });
    } catch (error) {
      setEmailValidationState({
        isValidating: false,
        isValid: false,
        message: "Error checking email availability",
      });
    }
  }, [mode, initialData, validateEmailTrigger]);

  // Handle email blur
  const handleEmailBlur = useCallback(() => {
    validateEmail(localData.email);
  }, [localData.email, validateEmail]);

  // Synchronize with data prop changes (for Edit mode)
  useEffect(() => {
    setLocalData({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      middleName: data.middleName || "",
      email: data.email || "",
      phone: data.phone || "",
      departmentId: data.departmentId || "",
      positionId: data.positionId || "",
      hireDate: data.hireDate || "",
    });
  }, [data]);

  // Position list for selected department
  const availablePositions = localData.departmentId
    ? mockPositions[localData.departmentId as keyof typeof mockPositions] || []
    : [];

  // Reset position when department changed
  const handleDepartmentChange = (departmentId: string) => {
    const newData = {
      ...localData,
      departmentId,
      positionId: "", // reset position
    };
    setLocalData(newData);
    onUpdate(newData);
  };

  const handleFieldChange = (field: string, value: string) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onUpdate(newData);
  };

  // Format phone number
  const handlePhoneChange = (value: string) => {
    handleFieldChange("phone", cleanPhoneNumber(value));
  };

  // Validation
  const validateStep = () => {
    const required = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "departmentId",
      "positionId",
      "hireDate",
    ];

    // required field validation
    const hasAllRequired = required.every((field) =>
      localData[field as keyof typeof localData]?.trim()
    );

    // Check email format
    const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localData.email);

    // Check phone number length
    const phoneValid = localData.phone.replace(/\D/g, "").length >= 10;

    // Email availability validation - only check if we have validation result
    const emailAvailabilityValid = 
      emailValidationState.isValid === null || // No validation attempted yet
      emailValidationState.isValid === true;   // Email is available

    return hasAllRequired && emailFormatValid && phoneValid && emailAvailabilityValid;
  };

  // Update validation state
  useEffect(() => {
    onValidationChange(validateStep());
  }, [localData, emailValidationState]);

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div>
        <h4 className="font-medium mb-4">Personal Information</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              value={localData.firstName}
              onChange={(e) => handleFieldChange("firstName", e.target.value)}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              value={localData.lastName}
              onChange={(e) => handleFieldChange("lastName", e.target.value)}
              placeholder="Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input
              id="middleName"
              value={localData.middleName}
              onChange={(e) => handleFieldChange("middleName", e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h4 className="font-medium mb-4">Contact Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={localData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="john.doe@company.com"
                className={
                  emailValidationState.isValid === false
                    ? "border-red-500"
                    : emailValidationState.isValid === true
                    ? "border-green-500"
                    : ""
                }
              />
              {/* Email validation status icon */}
              {emailValidationState.isValidating && (
                <div className="absolute right-2 top-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                </div>
              )}
              {!emailValidationState.isValidating && emailValidationState.isValid === true && (
                <div className="absolute right-2 top-2.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
              {!emailValidationState.isValidating && emailValidationState.isValid === false && (
                <div className="absolute right-2 top-2.5">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
            {/* Email validation message */}
            {emailValidationState.message && (
              <p
                className={`text-xs ${
                  emailValidationState.isValid === false
                    ? "text-red-500"
                    : emailValidationState.isValid === true
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {emailValidationState.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formatPhoneNumber(localData.phone)}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="555-123-4567"
            />
          </div>
        </div>
      </div>

      {/* Job Information */}
      <div>
        <h4 className="font-medium mb-4">Job Information</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="department">
              Department <span className="text-red-500">*</span>
            </Label>
            <Select
              value={localData.departmentId}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {mockDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">
              Position <span className="text-red-500">*</span>
            </Label>
            <Select
              value={localData.positionId}
              onValueChange={(value) => handleFieldChange("positionId", value)}
              disabled={!localData.departmentId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    localData.departmentId
                      ? "Select position"
                      : "Select department first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availablePositions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hireDate">
            Hire Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="hireDate"
            type="date"
            value={localData.hireDate}
            onChange={(e) => handleFieldChange("hireDate", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

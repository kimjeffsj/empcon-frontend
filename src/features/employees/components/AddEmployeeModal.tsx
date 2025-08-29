"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { CreateEmployeeRequest, UpdateEmployeeRequest, EmployeeResponse } from "@empcon/types";
import { parsePayRate } from "@/lib/formatter";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { BasicInfoStep } from "./add-employee-steps/BasicInfoStep";
import { AddressInfoStep } from "./add-employee-steps/AddressInfoStep";
import { PayInfoStep } from "./add-employee-steps/PayInfoStep";
import { AdditionalInfoStep } from "./add-employee-steps/AdditionalInfoStep";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initialData?: EmployeeResponse;
  onCreate?: (employee: CreateEmployeeRequest) => void;
  onUpdate?: (employee: UpdateEmployeeRequest) => void;
}

// Modal Steps
const STEPS = [
  {
    id: 1,
    title: "Basic Information",
    description: "Personal and job details",
  },
  { id: 2, title: "Address Information", description: "Home address details" },
  {
    id: 3,
    title: "Pay & Employment",
    description: "Salary and employment type",
  },
  {
    id: 4,
    title: "Additional Information",
    description: "Emergency contact and notes",
  },
];

export const AddEmployeeModal = ({
  open,
  onClose,
  onCreate,
  onUpdate,
  mode = "create",
  initialData,
}: AddEmployeeModalProps) => {
  const currentUserRole = useSelector(
    (state: RootState) => state.auth.user?.role
  );

  // Dynamic content based on mode
  const modalTitle = mode === "edit" ? "Edit Employee" : "Add New Employee";
  const submitButtonText =
    mode === "edit" ? "Update Employee" : "Create Employee";

  // Current Steps
  const [currentStep, setCurrentStep] = useState(1);

  // Form Data(All steps data management)
  const [formData, setFormData] = useState<Partial<CreateEmployeeRequest>>({});

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === "edit" && initialData && open) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        middleName: initialData.middleName,
        email: initialData.email,
        phone: initialData.phone,
        addressLine1: initialData.addressLine1,
        addressLine2: initialData.addressLine2,
        city: initialData.city,
        province: initialData.province,
        postalCode: initialData.postalCode,
        dateOfBirth: initialData.dateOfBirth,
        hireDate: initialData.hireDate,
        payRate: initialData.payRate,
        payType: initialData.payType,
        role: initialData.user?.role,
        departmentId: initialData.departmentId,
        positionId: initialData.positionId,
        managerId: initialData.managerId,
        sin: "", // Don't pre-fill SIN for security
        emergencyContactName: initialData.emergencyContactName,
        emergencyContactPhone: initialData.emergencyContactPhone,
        notes: initialData.notes,
      });
    } else if (mode === "create" || !open) {
      setFormData({});
    }
  }, [mode, initialData, open]);

  // Each steps validation
  const [stepValidation, setStepValidation] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  // Form data update
  const updateFormData = (stepData: Partial<CreateEmployeeRequest>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  // Next step
  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit
  const handleSubmit = () => {
    console.log("Final form data before processing: ", formData);
    
    if (mode === "create") {
      // Create mode: Send all required fields as CreateEmployeeRequest
      const cleanedData: CreateEmployeeRequest = {
        ...formData,
        // Ensure payRate is number
        payRate: parsePayRate(formData.payRate?.toString() || "0"),
        // Remove undefined/empty optional fields
        ...(formData.sin && formData.sin.trim() && { sin: formData.sin }),
        ...(formData.middleName && formData.middleName.trim() && { middleName: formData.middleName }),
        ...(formData.addressLine2 && formData.addressLine2.trim() && { addressLine2: formData.addressLine2 }),
        ...(formData.managerId && formData.managerId.trim() && { managerId: formData.managerId }),
        ...(formData.emergencyContactName && formData.emergencyContactName.trim() && { emergencyContactName: formData.emergencyContactName }),
        ...(formData.emergencyContactPhone && formData.emergencyContactPhone.trim() && { emergencyContactPhone: formData.emergencyContactPhone }),
        ...(formData.notes && formData.notes.trim() && { notes: formData.notes }),
      } as CreateEmployeeRequest;
      
      console.log("Cleaned create data for submission: ", cleanedData);
      onCreate?.(cleanedData);
    } else {
      // Edit mode: Send only changed fields as UpdateEmployeeRequest
      const updateData: UpdateEmployeeRequest = {};
      
      // Add fields only if they have values or have been changed
      if (formData.firstName) updateData.firstName = formData.firstName;
      if (formData.lastName) updateData.lastName = formData.lastName;
      if (formData.middleName?.trim()) updateData.middleName = formData.middleName;
      if (formData.email) updateData.email = formData.email;
      if (formData.phone) updateData.phone = formData.phone;
      if (formData.addressLine1) updateData.addressLine1 = formData.addressLine1;
      if (formData.addressLine2?.trim()) updateData.addressLine2 = formData.addressLine2;
      if (formData.city) updateData.city = formData.city;
      if (formData.province) updateData.province = formData.province;
      if (formData.postalCode) updateData.postalCode = formData.postalCode;
      if (formData.dateOfBirth) updateData.dateOfBirth = formData.dateOfBirth;
      if (formData.hireDate) updateData.hireDate = formData.hireDate;
      if (formData.payRate !== undefined) updateData.payRate = parsePayRate(formData.payRate.toString() || "0");
      if (formData.payType) updateData.payType = formData.payType;
      if (formData.role) updateData.role = formData.role;
      if (formData.departmentId) updateData.departmentId = formData.departmentId;
      if (formData.positionId) updateData.positionId = formData.positionId;
      if (formData.managerId?.trim()) updateData.managerId = formData.managerId;
      // SIN: Only include if not empty (security)
      if (formData.sin?.trim()) updateData.sin = formData.sin;
      if (formData.emergencyContactName?.trim()) updateData.emergencyContactName = formData.emergencyContactName;
      if (formData.emergencyContactPhone?.trim()) updateData.emergencyContactPhone = formData.emergencyContactPhone;
      if (formData.notes?.trim()) updateData.notes = formData.notes;
      
      console.log("Cleaned update data for submission: ", updateData);
      onUpdate?.(updateData);
    }
    
    handleClose();
  };

  // Reset form
  const handleClose = () => {
    setCurrentStep(1);
    setFormData({});
    setStepValidation({ 1: false, 2: false, 3: false, 4: false });
    onClose();
  };

  // Progress (25%, 50%, 75%, 100%)
  const progressValue = (currentStep / STEPS.length) * 100;

  // Change detection for Edit mode
  const hasChanges = useMemo(() => {
    if (mode === "create") return true; // Always allow creation
    if (!initialData) return true; // No initial data to compare

    // Compare important fields to detect changes
    const fieldsToCompare: (keyof CreateEmployeeRequest)[] = [
      "firstName",
      "lastName",
      "middleName",
      "email",
      "phone",
      "addressLine1",
      "addressLine2",
      "city",
      "province",
      "postalCode",
      "dateOfBirth",
      "hireDate",
      "payRate",
      "payType",
      "role",
      "departmentId",
      "positionId",
      "managerId",
      "emergencyContactName",
      "emergencyContactPhone",
      "notes",
    ];

    // Check regular fields
    const hasRegularChanges = fieldsToCompare.some((field) => {
      const currentValue = formData[field];
      const initialValue =
        field === "role"
          ? initialData.user?.role
          : initialData[field as keyof EmployeeResponse];

      // Handle different data types
      if (
        typeof currentValue === "number" &&
        typeof initialValue === "number"
      ) {
        return currentValue !== initialValue;
      }

      // Convert to string for comparison (handles undefined/null)
      return String(currentValue || "") !== String(initialValue || "");
    });

    // Check SIN changes - if SIN field has any value, it means it was edited
    const hasSINChanges = !!(formData.sin && formData.sin.trim());

    return hasRegularChanges || hasSINChanges;
  }, [mode, initialData, formData]);

  // 현재 단계 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={formData}
            onUpdate={updateFormData}
            onValidationChange={(isValid) =>
              setStepValidation((prev) => ({ ...prev, 1: isValid }))
            }
            mode={mode}
            initialData={initialData}
          />
        );
      case 2:
        return (
          <AddressInfoStep
            data={formData}
            onUpdate={updateFormData}
            onValidationChange={(isValid) =>
              setStepValidation((prev) => ({ ...prev, 2: isValid }))
            }
          />
        );
      case 3:
        return (
          <PayInfoStep
            data={formData}
            onUpdate={updateFormData}
            onValidationChange={(isValid) =>
              setStepValidation((prev) => ({ ...prev, 3: isValid }))
            }
            currentUserRole={currentUserRole}
            mode={mode}
            initialData={initialData}
          />
        );
      case 4:
        return (
          <AdditionalInfoStep
            data={formData}
            onUpdate={updateFormData}
            onValidationChange={(isValid) =>
              setStepValidation((prev) => ({ ...prev, 4: isValid }))
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle>{modalTitle}</AlertDialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDialogHeader>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressValue)}% Complete
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />

          {/* Current Step title */}
          <div className="mt-4">
            <h3 className="font-semibold">{STEPS[currentStep - 1].title}</h3>
            <p className="text-sm text-muted-foreground">
              {STEPS[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-4">{renderCurrentStep()}</div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>

            {currentStep === STEPS.length ? (
              <Button
                onClick={handleSubmit}
                disabled={
                  !stepValidation[currentStep as keyof typeof stepValidation] ||
                  (mode === "edit" && !hasChanges)
                }
              >
                {submitButtonText}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  !stepValidation[currentStep as keyof typeof stepValidation]
                }
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

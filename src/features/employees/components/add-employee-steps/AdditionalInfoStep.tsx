"use client";

import { useEffect, useState } from "react";
import { CreateEmployeeRequest } from "@empcon/types";
import { Phone, User, FileText, CheckCircle } from "lucide-react";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Badge } from "@/shared/ui/badge";
import {
  cleanPhoneNumber,
  formatPayRate,
  formatPhoneNumber,
} from "@/lib/formatter";

interface AdditionalInfoStepProps {
  data: Partial<CreateEmployeeRequest>;
  onUpdate: (data: Partial<CreateEmployeeRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export function AdditionalInfoStep({
  data,
  onUpdate,
  onValidationChange,
}: AdditionalInfoStepProps) {
  const [localData, setLocalData] = useState({
    emergencyContactName: data.emergencyContactName || "",
    emergencyContactPhone: data.emergencyContactPhone || "",
    notes: data.notes || "",
  });

  // Synchronize with data prop changes (for Edit mode)
  useEffect(() => {
    setLocalData({
      emergencyContactName: data.emergencyContactName || "",
      emergencyContactPhone: data.emergencyContactPhone || "",
      notes: data.notes || "",
    });
  }, [data]);

  const handleFieldChange = (field: string, value: string) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onUpdate(newData);
  };

  // Format phone number
  const handlePhoneChange = (value: string) => {
    handleFieldChange("emergencyContactPhone", cleanPhoneNumber(value));
  };

  // Validation (Always true - optional section)
  const validateStep = () => {
    // Validate phone number if emergency phone number is entered
    if (localData.emergencyContactPhone) {
      const phoneDigits = localData.emergencyContactPhone.replace(/\D/g, "");
      return phoneDigits.length === 10;
    }
    return true;
  };

  useEffect(() => {
    onValidationChange(validateStep());
  }, [localData]);

  // Helper function to get summary
  const getFullName = () => {
    const parts = [data.firstName, data.middleName, data.lastName].filter(
      Boolean
    );
    return parts.join(" ");
  };

  const getFullAddress = () => {
    const parts = [
      data.addressLine1,
      data.addressLine2,
      data.city,
      data.province,
      data.postalCode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="space-y-6">
      {/* Emergency Contact */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <User className="h-4 w-4" />
          Emergency Contact
        </h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Contact Name</Label>
            <Input
              id="emergencyContactName"
              value={formatPhoneNumber(localData.emergencyContactName)}
              onChange={(e) =>
                handleFieldChange("emergencyContactName", e.target.value)
              }
              placeholder="John Doe (Spouse, Parent, etc.)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="emergencyContactPhone"
                value={localData.emergencyContactPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(555) 123-4567"
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Additional Notes
        </h4>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes & Comments</Label>
          <Textarea
            id="notes"
            value={localData.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            placeholder="Any additional information about the employee (skills, certifications, special requirements, etc.)"
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Optional field for additional information</span>
            <span>{localData.notes.length}/500</span>
          </div>
        </div>
      </div>

      {/* Review Summary */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Review Information
        </h4>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employee Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div>
              <h5 className="font-medium text-sm mb-2">Personal Information</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {getFullName() || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{data.email || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{data.phone || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {data.dateOfBirth
                      ? new Date(data.dateOfBirth).toLocaleDateString()
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div>
              <h5 className="font-medium text-sm mb-2">Address</h5>
              <p className="text-sm">{getFullAddress() || "Not specified"}</p>
            </div>

            <Separator />

            {/* Employment */}
            <div>
              <h5 className="font-medium text-sm mb-2">Employment Details</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">
                    {data.departmentId || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Position</p>
                  <p className="font-medium">
                    {data.positionId || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Hire Date</p>
                  <p className="font-medium">
                    {data.hireDate
                      ? new Date(data.hireDate).toLocaleDateString()
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <Badge
                    variant={data.role === "MANAGER" ? "default" : "secondary"}
                  >
                    {data.role || "EMPLOYEE"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Compensation */}
            <div>
              <h5 className="font-medium text-sm mb-2">Compensation</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Pay Type</p>
                  <p className="font-medium">
                    {data.payType || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pay Rate</p>
                  <p className="font-medium">
                    {formatPayRate(data.payRate || 0, data.payType || "HOURLY")}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact & Notes */}
            {(localData.emergencyContactName || localData.notes) && (
              <>
                <Separator />
                <div>
                  <h5 className="font-medium text-sm mb-2">
                    Additional Information
                  </h5>
                  {localData.emergencyContactName && (
                    <div className="text-sm mb-2">
                      <p className="text-muted-foreground">Emergency Contact</p>
                      <p className="font-medium">
                        {localData.emergencyContactName}
                        {localData.emergencyContactPhone &&
                          ` • ${localData.emergencyContactPhone}`}
                      </p>
                    </div>
                  )}
                  {localData.notes && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Notes</p>
                      <p className="font-medium">{localData.notes}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

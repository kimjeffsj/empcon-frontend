"use client";

import { formatPostalCode } from "@/lib/formatter";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { CreateEmployeeRequest } from "@empcon/types";
import { useEffect, useState } from "react";

const PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "YT", name: "Yukon" },
];

interface AddressInfoStepProps {
  data: Partial<CreateEmployeeRequest>;
  onUpdate: (data: Partial<CreateEmployeeRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const AddressInfoStep = ({
  data,
  onUpdate,
  onValidationChange,
}: AddressInfoStepProps) => {
  const [localData, setLocalData] = useState({
    addressLine1: data.addressLine1 || "",
    addressLine2: data.addressLine2 || "",
    city: data.city || "",
    province: data.province || "",
    postalCode: data.postalCode || "",
  });

  const handleFieldChange = (field: string, value: string) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onUpdate(newData);
  };
  // Format postal code (Canadian postal code: A1A 1A1)
  const handlePostalCodeChange = (value: string) => {
    handleFieldChange("postalCode", formatPostalCode(value));
  };

  // Validation for next step
  const validateStep = () => {
    const required = ["addressLine1", "city", "province", "postalCode"];

    // Check required fields
    const hasAllRequired = required.every((field) =>
      localData[field as keyof typeof localData]?.trim()
    );

    // Check postal code (Canadian: A1A 1A1)
    const postalCodePattern = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
    const postalCodeValid = postalCodePattern.test(localData.postalCode);

    return hasAllRequired && postalCodeValid;
  };

  useEffect(() => {
    onValidationChange(validateStep());
  }, [localData]);

  return (
    <div className="space-y-6">
      {/* Street Address */}
      <div>
        <h4 className="font-medium mb-4">Street Address</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="addressLine1">
              Address Line 1 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="addressLine1"
              value={localData.addressLine1}
              onChange={(e) =>
                handleFieldChange("addressLine1", e.target.value)
              }
              placeholder="123 Main Street"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              value={localData.addressLine2}
              onChange={(e) =>
                handleFieldChange("addressLine2", e.target.value)
              }
              placeholder="Apartment, suite, floor, etc. (optional)"
            />
          </div>
        </div>
      </div>

      {/* City and Province */}
      <div>
        <h4 className="font-medium mb-4">Location</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              value={localData.city}
              onChange={(e) => handleFieldChange("city", e.target.value)}
              placeholder="Toronto"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">
              Province <span className="text-red-500">*</span>
            </Label>
            <Select
              value={localData.province}
              onValueChange={(value) => handleFieldChange("province", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((province) => (
                  <SelectItem key={province.code} value={province.code}>
                    {province.name} ({province.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Postal Code */}
      <div>
        <h4 className="font-medium mb-4">Postal Information</h4>
        <div className="space-y-2">
          <Label htmlFor="postalCode">
            Postal Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="postalCode"
            value={localData.postalCode}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            placeholder="A1A 1A1"
            maxLength={7}
          />
          <p className="text-xs text-muted-foreground">
            Canadian postal code format (e.g., M5V 3A1)
          </p>
        </div>
      </div>

      {/* Preview Card */}
      {localData.addressLine1 && localData.city && (
        <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
          <h5 className="font-medium text-sm mb-2">Address Preview:</h5>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{localData.addressLine1}</p>
            {localData.addressLine2 && <p>{localData.addressLine2}</p>}
            <p>
              {localData.city}
              {localData.province && `, ${localData.province}`}
              {localData.postalCode && ` ${localData.postalCode}`}
            </p>
            <p>Canada</p>
          </div>
        </div>
      )}
    </div>
  );
};

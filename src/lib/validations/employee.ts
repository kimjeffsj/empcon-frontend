import { z } from "zod";

// Employee form validation schema
export const employeeFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  middleName: z.string().max(50, "Middle name must be less than 50 characters").optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be less than 15 digits"),
  addressLine1: z.string().min(1, "Address line 1 is required").max(100, "Address line 1 must be less than 100 characters"),
  addressLine2: z.string().max(100, "Address line 2 must be less than 100 characters").optional(),
  city: z.string().min(1, "City is required").max(50, "City must be less than 50 characters"),
  province: z.string().min(2, "Province is required").max(2, "Province must be 2 characters"),
  postalCode: z.string().min(6, "Postal code must be 6 characters").max(7, "Postal code must be 6-7 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  hireDate: z.string().min(1, "Hire date is required"),
  payRate: z.number().min(0, "Pay rate must be positive").max(999999, "Pay rate is too high"),
  payType: z.enum(["HOURLY", "SALARY"], {
    message: "Pay type is required",
  }),
  departmentId: z.string().min(1, "Department is required"),
  positionId: z.string().min(1, "Position is required"),
  managerId: z.string().optional(),
  sin: z.string().min(9, "SIN must be 9 digits").max(11, "SIN must be 9-11 characters"),
  emergencyContactName: z.string().max(100, "Emergency contact name must be less than 100 characters").optional(),
  emergencyContactPhone: z.string().max(15, "Emergency contact phone must be less than 15 characters").optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

// Department form validation schema
export const departmentFormSchema = z.object({
  name: z.string().min(1, "Department name is required").max(100, "Department name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  managerId: z.string().optional(),
});

export type DepartmentFormData = z.infer<typeof departmentFormSchema>;

// Position form validation schema
export const positionFormSchema = z.object({
  title: z.string().min(1, "Position title is required").max(100, "Position title must be less than 100 characters"),
  departmentId: z.string().min(1, "Department is required"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

export type PositionFormData = z.infer<typeof positionFormSchema>;
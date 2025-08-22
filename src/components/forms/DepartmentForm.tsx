"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { departmentFormSchema, type DepartmentFormData } from "@/lib/validations/employee";

interface DepartmentFormProps {
  initialData?: Partial<DepartmentFormData>;
  onSubmit: (data: DepartmentFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function DepartmentForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: DepartmentFormProps) {
  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      ...initialData,
    },
  });

  const handleSubmit = (data: DepartmentFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the department"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (initialData ? "Update" : "Create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
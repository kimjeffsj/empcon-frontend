import { Employee } from "@empcon/types";

interface EmployeeInfoProps {
  employee?: Partial<Employee> | null;
  showEmployeeNumber?: boolean;
  className?: string;
}

export const EmployeeInfo = ({
  employee,
  showEmployeeNumber = true,
  className = "",
}: EmployeeInfoProps) => {
  return (
    <div className={className}>
      <p className="font-medium">
        {employee
          ? `${employee.firstName} ${employee.lastName}`
          : "Unknown Employee"}
      </p>
      {showEmployeeNumber && (
        <p className="text-sm text-gray-500">{employee?.employeeNumber}</p>
      )}
    </div>
  );
};

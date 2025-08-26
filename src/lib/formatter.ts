// Pay rate
export const formatPayRate = (
  payRate: number,
  payType: "HOURLY" | "SALARY"
): string => {
  if (payType === "HOURLY") {
    return `$${payRate.toFixed(2)}/hr`;
  }
  return `$${payRate.toLocaleString()}/yr`;
};

// Phone number (Canadian)
export const formatPhoneNumber = (value: string): string => {
  let cleaned = value.replace(/\D/g, "");

  if (cleaned.length > 10) {
    cleaned = cleaned.slice(0, 10);
  }

  if (cleaned.length >= 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else if (cleaned.length >= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else if (cleaned.length >= 3) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  }
  return cleaned;
};

// SIN
export const formatSIN = (value: string): string => {
  let cleaned = value.replace(/\D/g, "");

  if (cleaned.length > 9) {
    cleaned = cleaned.slice(0, 9);
  }

  if (cleaned.length > 6) {
    return (
      cleaned.slice(0, 3) + "-" + cleaned.slice(3, 6) + "-" + cleaned.slice(6)
    );
  } else if (cleaned.length > 3) {
    return cleaned.slice(0, 3) + "-" + cleaned.slice(3);
  }
  return cleaned;
};

// Postal Code
export const formatPostalCode = (value: string): string => {
  let cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  if (cleaned.length > 6) {
    cleaned = cleaned.slice(0, 6);
  }

  if (cleaned.length > 3) {
    return cleaned.slice(0, 3) + " " + cleaned.slice(3);
  }
  return cleaned;
};

// Age
export const calculateAge = (birthDate: string): number | null => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Salary
export const calculateAnnualSalary = (hourlyRate: number): number => {
  return hourlyRate * 40 * 52; // 40 hours/wk, 52 weeks (1 year)
};

// Clean format for db
export const cleanPhoneNumber = (value: string): string => {
  if (!value) return "";
  return value.replace(/\D/g, "").slice(0, 10);
};

export const cleanSIN = (value: string): string => {
  if (!value) return "";
  return value.replace(/\D/g, "").slice(0, 9);
};

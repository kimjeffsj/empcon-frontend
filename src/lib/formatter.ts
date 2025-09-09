// Pay rate
export const formatPayRate = (
  payRate: number,
  payType: "HOURLY" | "SALARY"
): string => {
  if (payType === "HOURLY") {
    return `$${Number(payRate).toFixed(2)}/hr`;
  }
  return `$${payRate.toLocaleString()}/yr`;
};

// Pay rate input formatting (15 → 15.00)
export const formatPayRateInput = (value: string): string => {
  if (!value || value === "") return "";
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return value;
  
  return numValue.toFixed(2);
};

// Clean and convert pay rate string to number
export const parsePayRate = (value: string): number => {
  if (!value || value === "") return 0;
  return parseFloat(value) || 0;
};

// Phone number (Canadian)
export const formatPhoneNumber = (value: string): string => {
  if (!value) return "";

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
  if (!value) return "";

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
  if (!value) return "";

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
  const [year, month, day] = birthDate.split("-").map(Number);
  const birth = new Date(year, month - 1, day); // calculate in local time
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

// ==== DATE FORMATTING ====

// User input dates (hireDate, dateOfBirth) - NO timezone conversion
export const formatUserDate = (dateString: string): string => {
  if (!dateString) return "";
  // "2025-09-02" → "09/02/2025"
  return dateString.replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1");
};

// System timestamps (createdAt, updatedAt) - Convert UTC to local
export const formatSystemTimestamp = (utcString: string): string => {
  if (!utcString) return "";
  return new Date(utcString).toLocaleDateString();
};

// ==== SCHEDULE DATE/TIME FORMATTING ====

// Schedule date display (ISO string → "Oct 15, 2023")
export const formatScheduleDate = (date: string): string => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric", 
    year: "numeric",
  });
};

// Schedule time display (ISO string → "14:30" in 24-hour format)
export const formatScheduleTime = (date: string): string => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// Calculate work duration (startTime, endTime, breakDuration → "8h 30m")
export const formatScheduleDuration = (
  startTime: string,
  endTime: string,
  breakDuration: number = 0
): string => {
  if (!startTime || !endTime) return "";
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const totalMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  const workMinutes = totalMinutes - breakDuration;
  const hours = Math.floor(workMinutes / 60);
  const minutes = workMinutes % 60;

  return `${hours}h ${minutes}m`;
};

// Format date for HTML input (Date/string → "2023-10-15")
export const formatDateForInput = (date: string | Date): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

// Format time for HTML input (Date/string → "14:30")
export const formatTimeForInput = (date: string | Date): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toTimeString().slice(0, 5);
};

// Combine date and time strings into ISO format
export const combineDateAndTime = (date: string, time: string): string => {
  if (!date || !time) return "";
  const dateObj = new Date(`${date}T${time}`);
  return dateObj.toISOString();
};

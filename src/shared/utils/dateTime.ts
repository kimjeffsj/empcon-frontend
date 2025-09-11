// Utility functions for date/time handling

export const formatDateForInput = (date: string | Date): string => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

export const formatTimeForInput = (date: string | Date): string => {
  const d = new Date(date);
  return d.toTimeString().slice(0, 5);
};

export const combineDateAndTime = (date: string, time: string): string => {
  const dateObj = new Date(`${date}T${time}`);
  return dateObj.toISOString();
};

// Additional timezone handling utilities can be added here
export const getCurrentDateInTimezone = (timezone?: string): Date => {
  return new Date();
};

export const formatDateTimeForDisplay = (
  dateTime: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = new Date(dateTime);
  return date.toLocaleString('en-US', options);
};
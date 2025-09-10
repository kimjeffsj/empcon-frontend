"use client";

import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/lib/utils";
import { Schedule } from "@empcon/types";

const localizer = momentLocalizer(moment);

interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    schedule: Schedule;
    employeeName: string;
    position?: string;
    status: Schedule['status'];
    type: "regular" | "night" | "overtime";
    daySchedules?: Schedule[]; // For summary events - all schedules for this date
  };
}

interface ScheduleCalendarProps {
  schedules: Schedule[];
  onSelectEvent?: (event: ScheduleEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  onDateSelect?: (date: Date, daySchedules: Schedule[]) => void;
}

export function ScheduleCalendar({
  schedules,
  onSelectEvent,
  onSelectSlot,
  onDateSelect,
}: ScheduleCalendarProps) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Group schedules by date and create summary events
  const events: ScheduleEvent[] = useMemo(() => {
    const groupedByDate: { [key: string]: Schedule[] } = {};
    
    // Group schedules by date (YYYY-MM-DD format)
    schedules.forEach((schedule) => {
      const dateKey = new Date(schedule.startTime).toDateString();
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(schedule);
    });

    // Create summary events for each date
    return Object.entries(groupedByDate).map(([dateKey, daySchedules]) => {
      const date = new Date(dateKey);
      const employeeCount = daySchedules.length;
      
      // Calculate summary info
      const hasNightShifts = daySchedules.some(s => {
        const hour = new Date(s.startTime).getHours();
        return hour >= 22 || hour < 6;
      });
      
      const hasOvertime = daySchedules.some(s => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        return end.getTime() - start.getTime() > 8 * 60 * 60 * 1000;
      });

      return {
        id: `summary-${dateKey}`,
        title: `📅 ${employeeCount} employee${employeeCount !== 1 ? 's' : ''}`,
        start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59),
        resource: {
          schedule: daySchedules[0], // Keep first schedule for reference
          employeeName: `${employeeCount} employees`,
          position: undefined,
          status: "SCHEDULED" as const,
          type: hasNightShifts ? "night" : hasOvertime ? "overtime" : "regular",
          daySchedules, // Include all schedules for this date
        },
      };
    });
  }, [schedules]);

  // Handle event click to select date and show details
  const handleEventSelect = (event: ScheduleEvent) => {
    const eventDate = new Date(event.start);
    eventDate.setHours(0, 0, 0, 0); // Normalize to start of day
    setSelectedDate(eventDate);
    
    // Pass selected date and schedules to parent component
    if (onDateSelect && event.resource.daySchedules) {
      onDateSelect(eventDate, event.resource.daySchedules);
    }
    
    // Also call the original onSelectEvent if provided
    if (onSelectEvent) {
      onSelectEvent(event);
    }
  };

  // Handle empty date slot click to select date
  const handleSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    const slotDate = new Date(slotInfo.start);
    slotDate.setHours(0, 0, 0, 0); // Normalize to start of day
    setSelectedDate(slotDate);
    
    // Pass selected date with empty schedules array to parent component
    if (onDateSelect) {
      onDateSelect(slotDate, []);
    }
    
    // Also call the original onSelectSlot if provided
    if (onSelectSlot) {
      onSelectSlot(slotInfo);
    }
  };

  const eventStyleGetter = (event: ScheduleEvent) => {
    let backgroundColor = "#3174ad"; // default blue
    let borderColor = "#3174ad";

    // For summary events, use more neutral colors
    if (event.resource.daySchedules) {
      // Mixed status handling for summary events
      const allCompleted = event.resource.daySchedules.every(s => s.status === "COMPLETED");
      const hasCancelled = event.resource.daySchedules.some(s => s.status === "CANCELLED" || s.status === "NO_SHOW");
      
      if (allCompleted) {
        backgroundColor = "#10b981"; // green - all completed
        borderColor = "#059669";
      } else if (hasCancelled) {
        backgroundColor = "#f97316"; // orange - mixed status
        borderColor = "#ea580c";
      } else {
        backgroundColor = "#3b82f6"; // blue - scheduled
        borderColor = "#2563eb";
      }
    } else {
      // Individual event colors (fallback)
      switch (event.resource.status) {
        case "SCHEDULED":
          backgroundColor = "#f59e0b";
          borderColor = "#d97706";
          break;
        case "COMPLETED":
          backgroundColor = "#10b981";
          borderColor = "#059669";
          break;
        case "CANCELLED":
        case "NO_SHOW":
          backgroundColor = "#ef4444";
          borderColor = "#dc2626";
          break;
      }
    }

    // Type-based styling
    const opacity = event.resource.type === "night" ? 0.9 : 1;

    return {
      style: {
        backgroundColor,
        borderColor,
        opacity,
        color: "white",
        border: "0px",
        borderRadius: "4px",
        fontSize: "12px",
        padding: "2px 4px",
      },
    };
  };

  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate("PREV")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate("NEXT")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate("TODAY")}
        >
          Today
        </Button>
      </div>
      
      <h3 className="text-lg font-semibold">{label}</h3>
      
      <div className="flex items-center gap-1">
        {["month", "week", "day"].map((viewName) => (
          <Button
            key={viewName}
            variant={view === viewName ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setView(viewName as View);
              onView(viewName);
            }}
          >
            {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );

  const CustomEvent = ({ event }: { event: ScheduleEvent }) => {
    const employeeCount = event.resource.daySchedules?.length || 1;
    
    return (
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium truncate">
          {event.title}
        </span>
        <div className="flex items-center gap-1">
          {event.resource.type === "night" && (
            <span className="text-xs opacity-75">🌙</span>
          )}
          {event.resource.type === "overtime" && (
            <span className="text-xs opacity-75">⏰</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Schedule Calendar
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Cancelled/No Show</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <div style={{ height: "600px" }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleEventSelect}
              onSelectSlot={handleSlotSelect}
              selectable
              popup
              components={{
                toolbar: CustomToolbar,
                event: CustomEvent,
              }}
              step={60}
              showMultiDayTimes
              messages={{
                next: "Next",
                previous: "Previous",
                today: "Today",
                month: "Month",
                week: "Week",
                day: "Day",
                agenda: "Agenda",
                date: "Date",
                time: "Time",
                event: "Event",
                noEventsInRange: "No schedules in this time range.",
                showMore: (total: number) => `+${total} more`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import React, { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { AlertTriangle, MapPin, Clock } from "lucide-react";
import { useClockStatus } from "../hooks/useClockStatus";
import { formatPacificTime12 } from "@/shared/utils/dateTime";

interface ClockInOutButtonProps {
  employeeId?: string;
  showLocation?: boolean;
  showNextSchedule?: boolean;
  compact?: boolean;
  className?: string;
}

export function ClockInOutButton({
  employeeId,
  showLocation = true,
  showNextSchedule = true,
  compact = false,
  className = "",
}: ClockInOutButtonProps) {
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);

  const {
    clockStatus,
    buttonConfig,
    todaySummary,
    currentTimeEntry,
    handleClockIn,
    handleClockOut,
    isLoading,
    isClockingIn,
    isClockingOut,
  } = useClockStatus({
    employeeId,
    autoRefresh: true,
    refetchInterval: 30000, // 30 seconds
  });

  const isAnyLoading = isLoading || isClockingIn || isClockingOut;

  const handleButtonClick = async () => {
    if (buttonConfig.disabled || isAnyLoading) return;

    if (buttonConfig.state === "clock-in") {
      // Handle Clock In
      if (showLocation && !showLocationInput && !location) {
        setShowLocationInput(true);
        return;
      }

      const success = await handleClockIn(showLocation ? location : undefined);
      if (success) {
        setLocation("");
        setShowLocationInput(false);
      }
    } else if (buttonConfig.state === "clock-out") {
      // Handle Clock Out
      if (showLocation && !showLocationInput && !location) {
        setShowLocationInput(true);
        return;
      }

      const success = await handleClockOut(showLocation ? location : undefined);
      if (success) {
        setLocation("");
        setShowLocationInput(false);
      }
    }
  };

  const handleLocationCancel = () => {
    setShowLocationInput(false);
    setLocation("");
  };

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Button
          onClick={handleButtonClick}
          variant={buttonConfig.variant}
          disabled={buttonConfig.disabled || isAnyLoading}
          className="w-full h-12 text-lg font-semibold"
        >
          {isAnyLoading ? (
            <>
              <buttonConfig.icon className="mr-2 h-5 w-5 animate-spin" />
              {isClockingIn
                ? "Clocking In..."
                : isClockingOut
                ? "Clocking Out..."
                : "Loading..."}
            </>
          ) : (
            <>
              <buttonConfig.icon className="mr-2 h-5 w-5" />
              {buttonConfig.text}
            </>
          )}
        </Button>

        {showLocationInput && (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g., Main Office, Work Site A"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={255}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleButtonClick} className="flex-1">
                Confirm
              </Button>
              <Button variant="outline" onClick={handleLocationCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Time Clock</CardTitle>
          {clockStatus.data?.isClocked && (
            <Badge
              variant="default"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
            >
              <Clock className="mr-1 h-3 w-3" />
              Clocked In
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status */}
        {currentTimeEntry && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Clocked in at{" "}
                {formatPacificTime12(currentTimeEntry.clockInTime)}
              </span>
            </div>
            {currentTimeEntry.schedule?.position && (
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Position: {currentTimeEntry.schedule.position}
              </p>
            )}
          </div>
        )}

        {/* Next Schedule Info */}
        {showNextSchedule && clockStatus.nextSchedule && !currentTimeEntry && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Next: {clockStatus.nextSchedule.position}
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Starts at{" "}
              {formatPacificTime12(clockStatus.nextSchedule.startTime)}
              {clockStatus.nextSchedule.timeUntilClockIn > 0 && (
                <span className="ml-2 text-xs">
                  (Available in {clockStatus.nextSchedule.timeUntilClockIn}m)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Warning for early clock-out */}
        {buttonConfig.state === "clock-out" && currentTimeEntry?.schedule && (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Scheduled until{" "}
                {formatPacificTime12(currentTimeEntry.schedule.endTime)}
              </span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Clocking out early? Make sure to contact your manager.
            </p>
          </div>
        )}

        {/* Location Input */}
        {showLocationInput && (
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Label htmlFor="location" className="text-sm font-medium">
                Location (Optional)
              </Label>
            </div>
            <Input
              id="location"
              placeholder="e.g., Main Office, Work Site A, Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={255}
              className="w-full"
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleButtonClick}
                className="flex-1"
                variant={buttonConfig.variant}
                disabled={isAnyLoading}
              >
                {isAnyLoading ? (
                  <>
                    <buttonConfig.icon className="mr-2 h-4 w-4 animate-spin" />
                    {isClockingIn ? "Clocking In..." : "Clocking Out..."}
                  </>
                ) : (
                  <>
                    <buttonConfig.icon className="mr-2 h-4 w-4" />
                    Confirm {buttonConfig.text}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleLocationCancel}
                disabled={isAnyLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Main Clock Button */}
        {!showLocationInput && (
          <Button
            onClick={handleButtonClick}
            variant={buttonConfig.variant}
            disabled={buttonConfig.disabled || isAnyLoading}
            className="w-full h-12 text-lg font-semibold"
          >
            {isAnyLoading ? (
              <>
                <buttonConfig.icon className="mr-2 h-5 w-5 animate-spin" />
                {isClockingIn
                  ? "Clocking In..."
                  : isClockingOut
                  ? "Clocking Out..."
                  : "Loading..."}
              </>
            ) : (
              <>
                <buttonConfig.icon className="mr-2 h-5 w-5" />
                {buttonConfig.text}
              </>
            )}
          </Button>
        )}

        {/* Today's Summary */}
        {todaySummary && (
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Today's Hours:</span>
              <span className="font-medium">
                {todaySummary.totalHoursWorked}h / {todaySummary.scheduledHours}
                h
              </span>
            </div>
            <div className="flex justify-between">
              <span>Schedules:</span>
              <span className="font-medium">
                {todaySummary.completedShifts} of {todaySummary.totalSchedules}{" "}
                completed
              </span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {clockStatus.error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              {clockStatus.error}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

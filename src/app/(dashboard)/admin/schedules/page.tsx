"use client";

import { useState } from "react";
import { ScheduleList } from "@/features/schedules/components/ScheduleList";
import { ScheduleForm } from "@/features/schedules/components/ScheduleForm";
import { CreateScheduleRequest, UpdateScheduleRequest } from "@empcon/types";
import {
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
} from "@/store/api/schedulesApi";

export default function SchedulesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Mutations
  const [createSchedule] = useCreateScheduleMutation();
  const [updateSchedule] = useUpdateScheduleMutation();

  const handleCreateSchedule = async (data: CreateScheduleRequest) => {
    await createSchedule(data).unwrap();
  };

  const handleUpdateSchedule = async (data: UpdateScheduleRequest) => {
    if (editingSchedule) {
      await updateSchedule({
        id: editingSchedule.id,
        data,
      }).unwrap();
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSchedule(null);
  };

  return (
    <div className="container mx-auto py-6">
      <ScheduleList 
        onAddClick={() => setIsFormOpen(true)}
        onEditClick={(schedule) => {
          setEditingSchedule(schedule);
          setIsFormOpen(true);
        }}
      />
      
      <ScheduleForm
        open={isFormOpen}
        onClose={handleFormClose}
        mode={editingSchedule ? "edit" : "create"}
        initialData={editingSchedule}
        onSubmit={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}
      />
    </div>
  );
}
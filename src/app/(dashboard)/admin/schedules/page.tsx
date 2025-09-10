"use client";

import { useState } from "react";
import { ScheduleList } from "@/features/schedules/components/ScheduleList";
import { ScheduleForm } from "@/features/schedules/components/ScheduleForm";
import { CreateScheduleRequest, UpdateScheduleRequest, Schedule } from "@empcon/types";
import {
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
} from "@/store/api/schedulesApi";

export default function SchedulesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Mutations
  const [createSchedule] = useCreateScheduleMutation();
  const [updateSchedule] = useUpdateScheduleMutation();

  // 통합된 스케줄 처리 함수
  const handleScheduleSubmit = async (data: CreateScheduleRequest | UpdateScheduleRequest) => {
    if (editingSchedule) {
      // 편집 모드: UpdateScheduleRequest
      await updateSchedule({
        id: editingSchedule.id,
        data: data as UpdateScheduleRequest,
      }).unwrap();
    } else {
      // 생성 모드: CreateScheduleRequest  
      await createSchedule(data as CreateScheduleRequest).unwrap();
    }
    handleFormClose();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSchedule(null);
  };

  return (
    <div className="container mx-auto py-6">
      <ScheduleList 
        onAddClick={() => setIsFormOpen(true)}
        onEditClick={(schedule: Schedule) => {
          setEditingSchedule(schedule);
          setIsFormOpen(true);
        }}
      />
      
      <ScheduleForm
        open={isFormOpen}
        onClose={handleFormClose}
        mode={editingSchedule ? "edit" : "create"}
        initialData={editingSchedule || undefined}
        onSubmit={handleScheduleSubmit}
      />
    </div>
  );
}
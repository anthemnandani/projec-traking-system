
import { Task } from "@/types";

// Helper function to ensure all required Task properties are present
export const createTaskObject = (taskData: Partial<Task>): Task => {
  return {
    id: taskData.id || "",
    title: taskData.title || "",
    clientId: taskData.clientId || "",
    description: taskData.description || "",
    status: taskData.status || "requirements",
    estimatedHours: taskData.estimatedHours || 0,
    estimatedCost: taskData.estimatedCost || 0,
    project: taskData.project,
    createdAt: taskData.createdAt || new Date(),
    updatedAt: taskData.updatedAt || new Date(),
    dueDate: taskData.dueDate,
    actualHours: taskData.actualHours,
    actualCost: taskData.actualCost,
    completedAt: taskData.completedAt,
  };
};

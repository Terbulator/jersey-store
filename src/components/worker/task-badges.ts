export const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-200 text-gray-800',
};

export const priorityColor: Record<string, string> = {
  LOW: 'bg-gray-200 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export function getTaskStatusColor(status: string) {
  return statusColor[status] ?? 'bg-gray-200 text-gray-800';
}

export function getTaskPriorityColor(priority: string) {
  return priorityColor[priority] ?? 'bg-gray-200 text-gray-700';
}

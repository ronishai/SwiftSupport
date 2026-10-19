export type TicketStatus = 'new' | 'in-progress' | 'pending' | 'closed';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type TeamId = string;
export type Category = string;

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  category: Category;
  floor: string;
  room: string;
  createdBy: { name: string; email: string; phone: string };
  assignedTo: { uid: string; displayName: string; email: string } | null;
  teamInCharge: TeamId;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
}

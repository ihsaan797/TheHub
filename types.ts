
export type ShiftType = string;

export type TaskCategory = string;

export interface Task {
  id: string;
  label: string;
  category: TaskCategory;
  isCompleted: boolean;
  notes?: string;
  timestamp?: number;
}

export interface TaskTemplate {
  id: string;
  label: string;
  category: TaskCategory;
  shiftType: ShiftType | 'ALL'; // 'ALL' applies to every shift
}

export interface ShiftData {
  id: string;
  type: ShiftType;
  date: string;
  tasks: Task[];
  status: 'active' | 'completed';
  agentName: string;
  occupancy: number; // Mock percentage
  notes: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export type UserRole = 'Front Office Manager' | 'Asst. FOM' | 'Senior GSA' | 'GSA';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  initials: string;
  color: string;
  password?: string;
}

export interface ShiftAssignment {
  id: string;
  date: string; // Format: YYYY-MM-DD
  shiftType: ShiftType;
  userId: string;
}

export interface DailyOccupancy {
  date: string; // YYYY-MM-DD
  percentage: number;
  notes?: string;
  isHighSeason?: boolean;
}

export interface AppConfig {
  appName: string;
  logoUrl: string;
  supportMessage: string;
}
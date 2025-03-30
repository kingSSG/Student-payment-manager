
export interface Student {
  id: number;
  name: string;
  course: string;
  feePerMonth: number;
  totalPaid: number;
  joinDate: string;
}

export interface Payment {
  id: number;
  studentId: number;
  amount: number;
  date: string;
  method: 'Cash' | 'UPI';
  notes: string;
}

export interface SkippedMonth {
  id: number;
  studentId: number;
  month: number; // 0-11 for Jan-Dec
  year: number;
  reason: string;
}

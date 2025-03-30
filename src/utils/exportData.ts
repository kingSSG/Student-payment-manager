
import { getStudents, getPayments, getRemainingBalance } from './database';

export async function exportStudentsToCSV(): Promise<string> {
  const students = await getStudents();
  
  // Create header row
  const headers = ['ID', 'Name', 'Course', 'Fee Per Month', 'Total Paid', 'Join Date', 'Remaining Balance'];
  
  // Process data rows
  const data = await Promise.all(
    students.map(async (student) => {
      const remainingBalance = await getRemainingBalance(student.id);
      return [
        student.id.toString(),
        student.name,
        student.course,
        student.feePerMonth.toString(),
        student.totalPaid.toString(),
        student.joinDate,
        remainingBalance.toString()
      ];
    })
  );
  
  // Combine header and data
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
}

export async function exportPaymentsToCSV(studentId?: number): Promise<string> {
  const payments = await getPayments(studentId);
  const students = await getStudents();
  
  // Create a mapping of student IDs to names for quick lookup
  const studentMap = students.reduce((map, student) => {
    map[student.id] = student.name;
    return map;
  }, {} as Record<number, string>);
  
  // Create header row
  const headers = ['ID', 'Student ID', 'Student Name', 'Amount', 'Date', 'Method', 'Notes'];
  
  // Process data rows
  const data = payments.map(payment => [
    payment.id.toString(),
    payment.studentId.toString(),
    studentMap[payment.studentId] || 'Unknown',
    payment.amount.toString(),
    payment.date,
    payment.method,
    `"${payment.notes.replace(/"/g, '""')}"` // Escape quotes in CSV
  ]);
  
  // Combine header and data
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

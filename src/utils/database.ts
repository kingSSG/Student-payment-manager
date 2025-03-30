// This is a simulation of SQLite database for the web
// In a real mobile app, you'd use capacitor-sqlite or another SQLite plugin

interface Student {
  id: number;
  name: string;
  course: string;
  feePerMonth: number;
  totalPaid: number;
  joinDate: string;
}

interface Payment {
  id: number;
  studentId: number;
  amount: number;
  date: string;
  method: 'Cash' | 'UPI';
  notes: string;
}

interface SkippedMonth {
  id: number;
  studentId: number;
  month: number; // 0-11 for Jan-Dec
  year: number;
  reason: string;
}

// Simulated database storage using localStorage
const DB_STUDENTS = 'students_db';
const DB_PAYMENTS = 'payments_db';
const DB_SKIPPED_MONTHS = 'skipped_months_db';
const DB_INITIALIZED = 'db_initialized';

export async function initDatabase(): Promise<void> {
  const isInitialized = localStorage.getItem(DB_INITIALIZED);
  
  if (!isInitialized) {
    // Initialize empty collections
    localStorage.setItem(DB_STUDENTS, JSON.stringify([]));
    localStorage.setItem(DB_PAYMENTS, JSON.stringify([]));
    localStorage.setItem(DB_SKIPPED_MONTHS, JSON.stringify([]));
    localStorage.setItem(DB_INITIALIZED, 'true');
    
    // Add some sample data
    await addSampleData();
  }
}

async function addSampleData(): Promise<void> {
  // Sample students
  const students = [
    {
      id: 1,
      name: 'John Doe',
      course: 'Computer Science',
      feePerMonth: 1500,
      totalPaid: 3000,
      joinDate: '2023-09-01'
    },
    {
      id: 2,
      name: 'Jane Smith',
      course: 'Mathematics',
      feePerMonth: 1200,
      totalPaid: 2400,
      joinDate: '2023-08-15'
    },
    {
      id: 3,
      name: 'Michael Johnson',
      course: 'Physics',
      feePerMonth: 1300,
      totalPaid: 1300,
      joinDate: '2023-10-05'
    }
  ];
  
  // Sample payments
  const payments = [
    {
      id: 1,
      studentId: 1,
      amount: 1500,
      date: '2023-09-05',
      method: 'Cash',
      notes: 'First month payment'
    },
    {
      id: 2,
      studentId: 1,
      amount: 1500,
      date: '2023-10-06',
      method: 'UPI',
      notes: 'Second month payment'
    },
    {
      id: 3,
      studentId: 2,
      amount: 1200,
      date: '2023-08-20',
      method: 'Cash',
      notes: 'First month payment'
    },
    {
      id: 4,
      studentId: 2,
      amount: 1200,
      date: '2023-09-18',
      method: 'UPI',
      notes: 'Second month payment'
    },
    {
      id: 5,
      studentId: 3,
      amount: 1300,
      date: '2023-10-10',
      method: 'Cash',
      notes: 'First month payment'
    }
  ] as Payment[];
  
  // Initialize empty skipped months
  localStorage.setItem(DB_SKIPPED_MONTHS, JSON.stringify([]));
  
  // Save to simulated database
  localStorage.setItem(DB_STUDENTS, JSON.stringify(students));
  localStorage.setItem(DB_PAYMENTS, JSON.stringify(payments));
}

// Student operations
export async function getStudents(): Promise<Student[]> {
  const studentsJson = localStorage.getItem(DB_STUDENTS) || '[]';
  return JSON.parse(studentsJson);
}

export async function getStudent(id: number): Promise<Student | null> {
  const students = await getStudents();
  return students.find(s => s.id === id) || null;
}

export async function addStudent(student: Omit<Student, 'id' | 'totalPaid'>): Promise<Student> {
  const students = await getStudents();
  
  // Generate new ID (in a real DB this would be handled automatically)
  const newId = students.length > 0 
    ? Math.max(...students.map(s => s.id)) + 1 
    : 1;
  
  const newStudent: Student = {
    ...student,
    id: newId,
    totalPaid: 0
  };
  
  students.push(newStudent);
  localStorage.setItem(DB_STUDENTS, JSON.stringify(students));
  
  return newStudent;
}

export async function updateStudent(student: Student): Promise<Student> {
  const students = await getStudents();
  const index = students.findIndex(s => s.id === student.id);
  
  if (index === -1) {
    throw new Error(`Student with ID ${student.id} not found`);
  }
  
  students[index] = student;
  localStorage.setItem(DB_STUDENTS, JSON.stringify(students));
  
  return student;
}

export async function deleteStudent(id: number): Promise<void> {
  const students = await getStudents();
  const filteredStudents = students.filter(s => s.id !== id);
  
  localStorage.setItem(DB_STUDENTS, JSON.stringify(filteredStudents));
  
  // Also delete related payments
  const payments = await getPayments();
  const filteredPayments = payments.filter(p => p.studentId !== id);
  
  localStorage.setItem(DB_PAYMENTS, JSON.stringify(filteredPayments));
}

// Payment operations
export async function getPayments(studentId?: number): Promise<Payment[]> {
  const paymentsJson = localStorage.getItem(DB_PAYMENTS) || '[]';
  const payments: Payment[] = JSON.parse(paymentsJson);
  
  if (studentId !== undefined) {
    return payments.filter(p => p.studentId === studentId);
  }
  
  return payments;
}

export async function addPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
  const payments = await getPayments();
  
  // Generate new ID
  const newId = payments.length > 0 
    ? Math.max(...payments.map(p => p.id)) + 1 
    : 1;
  
  const newPayment: Payment = {
    ...payment,
    id: newId
  };
  
  payments.push(newPayment);
  localStorage.setItem(DB_PAYMENTS, JSON.stringify(payments));
  
  // Update student's totalPaid
  const student = await getStudent(payment.studentId);
  if (student) {
    student.totalPaid += payment.amount;
    await updateStudent(student);
  }
  
  return newPayment;
}

export async function deletePayment(id: number): Promise<void> {
  const payments = await getPayments();
  const paymentToDelete = payments.find(p => p.id === id);
  
  if (!paymentToDelete) {
    throw new Error(`Payment with ID ${id} not found`);
  }
  
  // Update student's totalPaid
  const student = await getStudent(paymentToDelete.studentId);
  if (student) {
    student.totalPaid -= paymentToDelete.amount;
    await updateStudent(student);
  }
  
  const filteredPayments = payments.filter(p => p.id !== id);
  localStorage.setItem(DB_PAYMENTS, JSON.stringify(filteredPayments));
}

// Skipped Month operations
export async function getSkippedMonths(studentId?: number): Promise<SkippedMonth[]> {
  const skippedMonthsJson = localStorage.getItem(DB_SKIPPED_MONTHS) || '[]';
  const skippedMonths: SkippedMonth[] = JSON.parse(skippedMonthsJson);
  
  if (studentId !== undefined) {
    return skippedMonths.filter(sm => sm.studentId === studentId);
  }
  
  return skippedMonths;
}

export async function addSkippedMonth(skippedMonth: Omit<SkippedMonth, 'id'>): Promise<SkippedMonth> {
  const skippedMonths = await getSkippedMonths();
  
  // Generate new ID
  const newId = skippedMonths.length > 0 
    ? Math.max(...skippedMonths.map(sm => sm.id)) + 1 
    : 1;
  
  const newSkippedMonth: SkippedMonth = {
    ...skippedMonth,
    id: newId
  };
  
  skippedMonths.push(newSkippedMonth);
  localStorage.setItem(DB_SKIPPED_MONTHS, JSON.stringify(skippedMonths));
  
  return newSkippedMonth;
}

export async function deleteSkippedMonth(id: number): Promise<void> {
  const skippedMonths = await getSkippedMonths();
  const filteredSkippedMonths = skippedMonths.filter(sm => sm.id !== id);
  
  localStorage.setItem(DB_SKIPPED_MONTHS, JSON.stringify(filteredSkippedMonths));
}

// Calculate remaining balance with skipped months
export async function getRemainingBalance(studentId: number): Promise<number> {
  const student = await getStudent(studentId);
  if (!student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }
  
  const joinDate = new Date(student.joinDate);
  const currentDate = new Date();
  
  let months = (currentDate.getFullYear() - joinDate.getFullYear()) * 12;
  months += currentDate.getMonth() - joinDate.getMonth();
  
  // Ensure we don't calculate negative months
  months = Math.max(1, months);
  
  // Get skipped months for this student
  const skippedMonths = await getSkippedMonths(studentId);
  
  // Count how many skipped months fall within the period
  let skippedMonthsCount = 0;
  for (const skippedMonth of skippedMonths) {
    const skippedDate = new Date(skippedMonth.year, skippedMonth.month);
    
    // Check if the skipped month is within the join date and current date
    if (skippedDate >= joinDate && skippedDate <= currentDate) {
      skippedMonthsCount++;
    }
  }
  
  // Calculate total due with skipped months removed
  const totalDue = (months - skippedMonthsCount) * student.feePerMonth;
  const remainingBalance = totalDue - student.totalPaid;
  
  return Math.max(0, remainingBalance);
}

// Helper function to check if a month is skipped
export async function isMonthSkipped(studentId: number, month: number, year: number): Promise<boolean> {
  const skippedMonths = await getSkippedMonths(studentId);
  return skippedMonths.some(sm => sm.studentId === studentId && sm.month === month && sm.year === year);
}

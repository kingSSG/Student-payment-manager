import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CalendarDays, 
  CreditCard, 
  Download, 
  FileDown, 
  GraduationCap, 
  Trash2, 
  User,
  CalendarX 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { PaymentHistory } from "@/components/PaymentHistory";
import { AddPaymentDialog } from "@/components/AddPaymentDialog";
import { SkippedMonthsManager } from "@/components/SkippedMonthsManager";
import { toast } from "sonner";
import { getStudent, getRemainingBalance, deleteStudent, deletePayment } from "@/utils/database";
import { exportPaymentsToCSV, downloadCSV } from "@/utils/exportData";
import type { Student } from "@/types";

const StudentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = parseInt(id || "0");
  
  const [student, setStudent] = useState<Student | null>(null);
  const [remainingBalance, setRemainingBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (isNaN(studentId) || studentId <= 0) {
      navigate("/students");
      return;
    }
    
    async function fetchStudentData() {
      try {
        setIsLoading(true);
        const studentData = await getStudent(studentId);
        
        if (!studentData) {
          toast.error("Student not found");
          navigate("/students");
          return;
        }
        
        setStudent(studentData);
        
        const balance = await getRemainingBalance(studentId);
        setRemainingBalance(balance);
      } catch (error) {
        console.error("Error fetching student:", error);
        toast.error("Failed to load student data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStudentData();
  }, [studentId, navigate]);
  
  const handleDeleteStudent = async () => {
    try {
      setIsDeleting(true);
      await deleteStudent(studentId);
      toast.success("Student deleted successfully");
      navigate("/students");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleDeletePayment = async (paymentId: number) => {
    try {
      await deletePayment(paymentId);
      
      const updatedStudent = await getStudent(studentId);
      if (updatedStudent) {
        setStudent(updatedStudent);
      }
      
      const balance = await getRemainingBalance(studentId);
      setRemainingBalance(balance);
      
      toast.success("Payment deleted successfully");
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment");
    }
  };
  
  const handleExportPayments = async () => {
    try {
      const csvContent = await exportPaymentsToCSV(studentId);
      downloadCSV(csvContent, `payments_${student?.name.replace(/\s+/g, '_')}.csv`);
      toast.success("Payments exported successfully");
    } catch (error) {
      console.error("Error exporting payments:", error);
      toast.error("Failed to export payments");
    }
  };
  
  const handlePaymentAdded = async () => {
    const updatedStudent = await getStudent(studentId);
    if (updatedStudent) {
      setStudent(updatedStudent);
    }
    
    const balance = await getRemainingBalance(studentId);
    setRemainingBalance(balance);
  };
  
  const handleSkippedMonthsChanged = async () => {
    try {
      const balance = await getRemainingBalance(studentId);
      setRemainingBalance(balance);
    } catch (error) {
      console.error("Error updating balance after skipped month change:", error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-28 pb-16">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-8 w-48 bg-muted rounded-md mb-6"></div>
            <div className="h-36 w-full bg-muted rounded-lg mb-8"></div>
            <div className="h-64 w-full bg-muted rounded-lg"></div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!student) {
    return null; // This should never happen as we navigate away if student is not found
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="gap-1"
            >
              <Link to="/students">
                <ArrowLeft className="w-4 h-4" />
                Back to Students
              </Link>
            </Button>
            
            <div className="flex gap-2">
              {/* <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPayments}
                className="gap-1"
              >
                <FileDown className="w-4 h-4" />
                Export Payments
              </Button> */}
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-8 overflow-hidden">
              <div className="bg-primary/10 p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{student.name}</h1>
                      <div className="flex items-center text-muted-foreground gap-1">
                        <GraduationCap className="w-4 h-4" />
                        <span>{student.course}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center">
                    <div className="flex gap-8">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Monthly Fee</p>
                        <p className="text-xl font-semibold">₹{student.feePerMonth}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                        <p className="text-xl font-semibold">₹{student.totalPaid}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Student Details</h3>
                    
                    <div className="space-y-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <CalendarDays className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Join Date</p>
                          <p className="font-medium">
                            {new Date(student.joinDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Status</p>
                          <p className="font-medium">
                            {remainingBalance !== null && (
                              remainingBalance > 0 ? (
                                <span className="text-destructive">₹{remainingBalance} due</span>
                              ) : (
                                <span className="text-green-600 dark:text-green-500">Fully paid</span>
                              )
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Payment Summary</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Fee</span>
                        <span>₹{student.feePerMonth}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Paid</span>
                        <span>₹{student.totalPaid}</span>
                      </div>
                      {remainingBalance !== null && (
                        <div className="flex justify-between text-sm pt-3 border-t">
                          <span className="font-medium">Remaining Balance</span>
                          <span className={remainingBalance > 0 ? "text-destructive font-medium" : "text-green-600 dark:text-green-500 font-medium"}>
                            ₹{remainingBalance}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full mt-4 gap-1" 
                      onClick={() => setIsPaymentDialogOpen(true)}
                    >
                      <CreditCard className="w-4 h-4" />
                      Add New Payment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="space-y-8"
          >
            <PaymentHistory 
              studentId={studentId} 
              onAddPayment={() => setIsPaymentDialogOpen(true)}
              onDeletePayment={handleDeletePayment}
            />
            
            <SkippedMonthsManager 
              studentId={studentId}
              onMonthsChanged={handleSkippedMonthsChanged}
            />
          </motion.div>
        </div>
      </main>
      
      <AddPaymentDialog 
        studentId={studentId}
        studentName={student.name}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onPaymentAdded={handlePaymentAdded}
      />
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {student.name}? This action will also delete all their payment records and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteStudent}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetail;

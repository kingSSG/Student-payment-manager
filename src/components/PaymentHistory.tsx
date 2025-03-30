
import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Circle, 
  XCircle 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getPayments } from "@/utils/database";
import type { Payment } from "@/types";

interface PaymentHistoryProps {
  studentId: number;
  onAddPayment: () => void;
  onDeletePayment?: (paymentId: number) => void;
}

export function PaymentHistory({ 
  studentId, 
  onAddPayment,
  onDeletePayment 
}: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        setIsLoading(true);
        const studentPayments = await getPayments(studentId);
        // Sort by date (most recent first)
        studentPayments.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setPayments(studentPayments);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPayments();
  }, [studentId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Payment History</h3>
        <Button onClick={onAddPayment} size="sm" className="gap-1">
          <DollarSign className="w-4 h-4" />
          Add Payment
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-36 bg-muted rounded-md mx-auto"></div>
            <div className="h-24 w-full max-w-md bg-muted rounded-md"></div>
          </div>
        </div>
      ) : payments.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-medium mb-2">No payments yet</h4>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
            Record your first payment for this student by clicking the 'Add Payment' button.
          </p>
          <Button onClick={onAddPayment} variant="outline">Add First Payment</Button>
        </div>
      ) : (
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="relative pl-8 pr-4 py-4">
            {/* Timeline connector */}
            <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-border" />
            
            <div className="space-y-8">
              {payments.map((payment, index) => (
                <div key={payment.id} className="relative animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-0 w-6 h-6 rounded-full flex items-center justify-center z-10",
                    index === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {index === 0 ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Circle className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Payment card */}
                  <div className={cn(
                    "ml-4 p-4 rounded-lg border transition-all",
                    index === 0 ? "bg-card shadow-sm" : "bg-background"
                  )}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {new Date(payment.date).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                            payment.method === "Cash" 
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                          )}>
                            {payment.method === "Cash" ? (
                              <>
                                <DollarSign className="w-3 h-3" />
                                Cash
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3 h-3" />
                                UPI
                              </>
                            )}
                          </div>
                          <span className="text-lg font-semibold">
                            ₹{payment.amount}
                          </span>
                        </div>
                        
                        {payment.notes && (
                          <p className="text-sm text-muted-foreground">
                            {payment.notes}
                          </p>
                        )}
                      </div>
                      
                      {onDeletePayment && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onDeletePayment(payment.id);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete payment</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

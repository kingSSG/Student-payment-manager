
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, CalendarDays } from "lucide-react";
import { getRemainingBalance } from "@/utils/database";
import type { Student } from "@/types";

interface StudentCardProps {
  student: Student;
  index: number;
}

export function StudentCard({ student, index }: StudentCardProps) {
  const [remainingBalance, setRemainingBalance] = useState<number | null>(null);
  
  useEffect(() => {
    async function fetchBalance() {
      try {
        const balance = await getRemainingBalance(student.id);
        setRemainingBalance(balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
    
    fetchBalance();
  }, [student.id]);
  
  const animationDelay = `animation-delay-${(index % 3) * 200}`;
  
  return (
    <Link to={`/students/${student.id}`} className="block">
      <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-md animate-scale-in ${animationDelay}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-lg group-hover:text-primary transition-colors">{student.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {student.course}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-secondary px-2 py-1">
              ₹{student.feePerMonth}/month
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Paid: <span className="font-medium">₹{student.totalPaid}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Joined: <span className="font-medium">{new Date(student.joinDate).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 bg-secondary/50 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">
              {remainingBalance !== null ? (
                remainingBalance > 0 ? (
                  <span className="text-destructive">₹{remainingBalance} due</span>
                ) : (
                  <span className="text-green-600 dark:text-green-500">Fully paid</span>
                )
              ) : (
                <span className="text-muted-foreground">Calculating...</span>
              )}
            </p>
          </div>
          <Button size="sm" className="transition-transform duration-300 group-hover:translate-x-1">
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

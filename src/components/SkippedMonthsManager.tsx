
import { useState, useEffect } from "react";
import { 
  CalendarX, 
  Plus, 
  XCircle 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getSkippedMonths, addSkippedMonth, deleteSkippedMonth } from "@/utils/database";
import type { SkippedMonth } from "@/types";

interface SkippedMonthsManagerProps {
  studentId: number;
  onMonthsChanged: () => void;
}

export function SkippedMonthsManager({ studentId, onMonthsChanged }: SkippedMonthsManagerProps) {
  const [skippedMonths, setSkippedMonths] = useState<SkippedMonth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSkippedMonths();
  }, [studentId]);

  const fetchSkippedMonths = async () => {
    try {
      setIsLoading(true);
      const months = await getSkippedMonths(studentId);
      // Sort by date (most recent first)
      months.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
      setSkippedMonths(months);
    } catch (error) {
      console.error("Error fetching skipped months:", error);
      toast.error("Failed to load skipped months");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkippedMonth = async () => {
    try {
      setIsSubmitting(true);
      
      // Check if already exists
      const exists = skippedMonths.some(
        sm => sm.month === selectedMonth && sm.year === selectedYear
      );
      
      if (exists) {
        toast.error("This month has already been marked as skipped");
        return;
      }
      
      await addSkippedMonth({
        studentId,
        month: selectedMonth,
        year: selectedYear,
        reason: reason.trim()
      });
      
      toast.success("Month marked as skipped");
      await fetchSkippedMonths();
      onMonthsChanged();
      setIsDialogOpen(false);
      
      // Reset form
      setSelectedMonth(new Date().getMonth());
      setSelectedYear(new Date().getFullYear());
      setReason("");
    } catch (error) {
      console.error("Error adding skipped month:", error);
      toast.error("Failed to mark month as skipped");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSkippedMonth = async (id: number) => {
    try {
      await deleteSkippedMonth(id);
      toast.success("Skipped month removed");
      await fetchSkippedMonths();
      onMonthsChanged();
    } catch (error) {
      console.error("Error deleting skipped month:", error);
      toast.error("Failed to remove skipped month");
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate a range of years (5 years back to 5 years ahead)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Skipped Months</h3>
        <Button onClick={() => setIsDialogOpen(true)} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          Skip Month
        </Button>
      </div>

      {isLoading ? (
        <div className="py-6 flex justify-center">
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-36 bg-muted rounded-md mx-auto"></div>
            <div className="h-16 w-full max-w-md bg-muted rounded-md"></div>
          </div>
        </div>
      ) : skippedMonths.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <CalendarX className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium mb-2">No skipped months</h4>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
              Mark months as skipped if the student didn't attend or shouldn't be charged for that period.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">Skip First Month</Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[200px] rounded-md border">
          <div className="p-4 space-y-2">
            {skippedMonths.map((month) => (
              <div 
                key={month.id} 
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <p className="font-medium">{monthNames[month.month]} {month.year}</p>
                  {month.reason && (
                    <p className="text-sm text-muted-foreground mt-1">{month.reason}</p>
                  )}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteSkippedMonth(month.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove skipped month</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Dialog for adding a skipped month */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarX className="w-5 h-5 text-primary" />
              Skip a Month
            </DialogTitle>
            <DialogDescription>
              Mark a month as skipped to exclude it from payment calculations
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="year">Year</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for skipping this month..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="mt-4 sm:mt-0"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddSkippedMonth}
              disabled={isSubmitting}
              className="mt-2 sm:mt-0"
            >
              {isSubmitting ? "Adding..." : "Skip Month"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

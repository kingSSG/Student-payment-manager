
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  User,
  GraduationCap,
  CalendarDays,
  CreditCard,
  Plus,
  Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Navbar } from "@/components/Navbar";
import { addStudent } from "@/utils/database";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AddStudent = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [feePerMonth, setFeePerMonth] = useState("");
  const [joinDate, setJoinDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      toast.error("Please enter student name");
      return;
    }
    if (!course.trim()) {
      toast.error("Please enter course name");
      return;
    }
    if (!feePerMonth || isNaN(Number(feePerMonth)) || Number(feePerMonth) <= 0) {
      toast.error("Please enter a valid fee amount");
      return;
    }
    if (!joinDate) {
      toast.error("Please select join date");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const newStudent = await addStudent({
        name: name.trim(),
        course: course.trim(),
        feePerMonth: Number(feePerMonth),
        joinDate: format(joinDate, "yyyy-MM-dd")
      });
      
      toast.success("Student added successfully");
      navigate(`/students/${newStudent.id}`);
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="mb-6 gap-1"
          >
            <Link to="/students">
              <ArrowLeft className="w-4 h-4" />
              Back to Students
            </Link>
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Add New Student
                </CardTitle>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Student Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter student name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="course">Course / Program</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="course"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        placeholder="Enter course name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fee">Monthly Fee (₹)</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="fee"
                        type="number"
                        value={feePerMonth}
                        onChange={(e) => setFeePerMonth(e.target.value)}
                        placeholder="Enter monthly fee amount"
                        className="pl-10"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Join Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="joinDate"
                          className={cn(
                            "justify-start text-left font-normal w-full",
                            !joinDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {joinDate ? format(joinDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={joinDate}
                          onSelect={setJoinDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/students")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="gap-1"
                  >
                    {isSubmitting ? (
                      "Adding..."
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Add Student
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AddStudent;

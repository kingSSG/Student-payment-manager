
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowUpDown, 
  Download, 
  Plus, 
  Search, 
  SlidersHorizontal,
  Users, 
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Navbar } from "@/components/Navbar";
import { StudentCard } from "@/components/StudentCard";
import { toast } from "sonner";
import { getStudents } from "@/utils/database";
import { exportStudentsToCSV, downloadCSV } from "@/utils/exportData";
import type { Student } from "@/types";

type SortField = "name" | "course" | "feePerMonth" | "totalPaid" | "joinDate";
type SortDirection = "asc" | "desc";

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);

  useEffect(() => {
    async function fetchStudents() {
      try {
        setIsLoading(true);
        const data = await getStudents();
        setStudents(data);
        
        // Extract unique courses
        const courses = Array.from(new Set(data.map(student => student.course)));
        setAvailableCourses(courses);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStudents();
  }, []);
  
  useEffect(() => {
    // Filter students based on search query and course filter
    let result = [...students];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(student => 
        student.name.toLowerCase().includes(query) ||
        student.course.toLowerCase().includes(query)
      );
    }
    
    if (courseFilter !== "all") {
      result = result.filter(student => student.course === courseFilter);
    }
    
    // Sort students
    result.sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];
      
      // Handle date strings
      if (sortField === "joinDate") {
        fieldA = new Date(fieldA as string).getTime();
        fieldB = new Date(fieldB as string).getTime();
      }
      
      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    setFilteredStudents(result);
  }, [students, searchQuery, courseFilter, sortField, sortDirection]);

  const handleExportCSV = async () => {
    try {
      const csvContent = await exportStudentsToCSV();
      downloadCSV(csvContent, "students.csv");
      toast.success("Students data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-8 h-8" />
              Students
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all students
            </p>
          </div>
          
          <div className="flex gap-2">
            {/* <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button> */}
            <Button asChild>
              <Link to="/add-student">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-4 flex-grow md:flex-grow-0">
            <Select
              value={courseFilter}
              onValueChange={setCourseFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {availableCourses.map(course => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={sortField}
                  onValueChange={(value) => setSortField(value as SortField)}
                >
                  <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="course">Course</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="feePerMonth">Fee Per Month</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="totalPaid">Total Paid</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="joinDate">Join Date</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Direction</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={sortDirection}
                  onValueChange={(value) => setSortDirection(value as SortDirection)}
                >
                  <DropdownMenuRadioItem value="asc" className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 rotate-180" /> Ascending
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="desc" className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" /> Descending
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="rounded-lg border p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-muted"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="h-3 w-24 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
                <div className="mt-4 h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No students found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {students.length === 0
                ? "Get started by adding your first student"
                : "Try changing your search or filter criteria"}
            </p>
            {students.length === 0 && (
              <Button asChild>
                <Link to="/add-student">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Student
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredStudents.map((student, index) => (
              <StudentCard key={student.id} student={student} index={index} />
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Students;


import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Users, FileText, Settings, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-28 pb-16">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="inline-block mb-4">
            <span className="relative inline-flex">
              <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium">
                Student Payments Management
              </span>
              <span className="absolute -right-2 -top-2 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-primary" />
              </span>
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Manage Student Payments
            <br />
            <span className="text-primary">with Ease</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Keep track of student payments, calculate balances,
            and export data with our simple yet powerful app.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button
              size="lg"
              onClick={() => navigate("/students")}
              className="gap-2"
            >
              <Users className="w-5 h-5" />
              View Students
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/add-student")}
              className="gap-2"
            >
              Add New Student
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <FeatureCard 
            icon={<Users className="w-6 h-6" />}
            title="Student Management"
            description="Add, view, and manage student profiles with detailed payment history."
          />
          {/* <FeatureCard 
            icon={<FileText className="w-6 h-6" />}
            title="Export Data"
            description="Export payment records to CSV format for external use in Excel or Google Sheets."
          /> */}
          <FeatureCard 
            icon={<Settings className="w-6 h-6" />}
            title="Customization"
            description="Switch between light and dark modes for comfortable viewing in any environment."
          />
        </motion.div>
      </main>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <motion.div
    className="p-6 rounded-xl border bg-card hover:shadow-md transition-all"
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
  >
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <span className="text-primary">{icon}</span>
    </div>
    <h3 className="text-xl font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

export default Index;

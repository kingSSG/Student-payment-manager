
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { 
  Users, Plus, Home, FileDown, Menu, X 
} from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 group"
          aria-label="Home"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Users className="text-white w-5 h-5" />
          </div>
          <span className="font-semibold text-lg transition-all duration-300 group-hover:text-primary">
            Payments
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/" isActive={isActive("/")}>
            <Home className="w-4 h-4 mr-1" />
            Home
          </NavLink>
          <NavLink to="/students" isActive={isActive("/students")}>
            <Users className="w-4 h-4 mr-1" />
            Students
          </NavLink>
          <NavLink to="/add-student" isActive={isActive("/add-student")}>
            <Plus className="w-4 h-4 mr-1" />
            Add Student
          </NavLink>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center md:hidden space-x-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden glass mt-2 mx-4 rounded-xl overflow-hidden animate-scale-in">
          <div className="flex flex-col p-4 space-y-2">
            <MobileNavLink to="/" isActive={isActive("/")}>
              <Home className="w-5 h-5 mr-2" />
              Home
            </MobileNavLink>
            <MobileNavLink to="/students" isActive={isActive("/students")}>
              <Users className="w-5 h-5 mr-2" />
              Students
            </MobileNavLink>
            <MobileNavLink to="/add-student" isActive={isActive("/add-student")}>
              <Plus className="w-5 h-5 mr-2" />
              Add Student
            </MobileNavLink>
          </div>
        </nav>
      )}
    </header>
  );
}

interface NavLinkProps {
  children: React.ReactNode;
  to: string;
  isActive: boolean;
}

function NavLink({ children, to, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ children, to, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent"
      }`}
    >
      {children}
    </Link>
  );
}

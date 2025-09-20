import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu,
  X,
  LayoutDashboard, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Shield, 
  Settings,
  Workflow,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Accounts", href: "/accounts", icon: Building2 },
  { name: "Investments", href: "/investments", icon: TrendingUp },
  { name: "Loans", href: "/loans", icon: DollarSign },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Loan Workflow", href: "/loan-workflow", icon: Workflow },
  { name: "Investment Workflow", href: "/investment-workflow", icon: Target },
  { name: "Le Tue Richieste", href: "/your-requests", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function MobileHeader() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentPage = navigation.find(nav => 
    nav.href === location || (nav.href !== "/" && location.startsWith(nav.href))
  );

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-neutral-800">FinanceHub</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-neutral-600">
            {currentPage?.name || "Page"}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <nav className="bg-white border-b border-neutral-200 px-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            {navigation.map((item) => {
              const isActive = location === item.href || 
                (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
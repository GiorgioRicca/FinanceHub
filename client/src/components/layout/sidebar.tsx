import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Shield, 
  Settings,
  User,
  LogOut,
  Workflow,
  Target,
  ShoppingBag
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Investimenti", href: "/investimenti", icon: TrendingUp },
  { name: "Mercato Asset", href: "/mercato-asset", icon: ShoppingBag },
  { name: "Prestiti", href: "/prestiti", icon: DollarSign },
  { name: "Transazioni", href: "/transazioni", icon: Receipt },
  { name: "Richiesta Prestito", href: "/richiesta-prestito", icon: Workflow },
  { name: "Simulatore Investimenti", href: "/simulatore-investimenti", icon: Target },
  { name: "Le Tue Richieste", href: "/le-tue-richieste", icon: Shield },
  { name: "Impostazioni", href: "/impostazioni", icon: Settings },
];

/**
 * Componente Sidebar per la navigazione principale dell'applicazione.
 * Implementa menu di navigazione con icone e stati attivi.
 * Gestisce routing e visualizzazione logo FinanceHub.
 */
export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-neutral-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-neutral-800">FinanceHub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-neutral-300 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-neutral-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">Mario Rossi</p>
            <p className="text-xs text-neutral-500 truncate">mario.rossi@email.com</p>
          </div>
          <button className="text-neutral-400 hover:text-neutral-600">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

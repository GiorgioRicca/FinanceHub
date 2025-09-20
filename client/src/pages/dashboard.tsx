import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import PortfolioChart from "@/components/charts/portfolio-chart";
import AllocationChart from "@/components/charts/allocation-chart";
import LoanCalculator from "@/components/calculators/loan-calculator";
import InvestmentSimulator from "@/components/calculators/investment-simulator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent, formatDate, getAccountDisplayNumber } from "@/lib/financial-utils";
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  DollarSign,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import type { DashboardSummary } from "@shared/schema";


const DEMO_USER_ID = "demo-user-123";

/**
 * Componente Dashboard principale che visualizza la panoramica finanziaria.
 * Mostra statistiche, conti, grafici e transazioni recenti dell'utente.
 * Gestisce caricamento dati e aggiornamenti automatici in tempo reale.
 */
export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard", DEMO_USER_ID],
    refetchInterval: 30000, 
    refetchIntervalInBackground: true,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<any[]>({
    queryKey: ["/api/transactions/recent", DEMO_USER_ID],
    refetchInterval: 30000, 
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const { data: loans = [] } = useQuery<any[]>({
    queryKey: ["/api/loans", DEMO_USER_ID],
    refetchInterval: 30000, 
    refetchIntervalInBackground: true,
  });

  const { data: accounts = [] } = useQuery<any[]>({
    queryKey: ["/api/accounts", DEMO_USER_ID],
    refetchInterval: 30000, 
    refetchIntervalInBackground: true,
  });

  const stats = [
    {
      title: "Saldo Totale",
      value: summary?.totalBalance || "0",
      change: "+2.5% dal mese scorso",
      positive: true,
      icon: Wallet,
      color: "text-primary"
    },
    {
      title: "Investimenti",
      value: summary?.totalInvestments || "0",
      change: `+${summary?.investmentGrowth || "0"}% questa settimana`,
      positive: true,
      icon: TrendingUp,
      color: "text-secondary"
    },
    {
      title: "Spese Mensili",
      value: summary?.monthlyExpenses || "0",
      change: `${summary?.expenseVariation || "0"}% dal budget`,
      positive: parseFloat(summary?.expenseVariation || "0") >= 0,
      icon: CreditCard,
      color: "text-accent"
    },
    {
      title: "Prestiti Attivi",
      value: summary?.activeLoanBalance || "0",
      change: `${loans.length} ${loans.length === 1 ? 'prestito attivo' : 'prestiti attivi'}`,
      positive: null,
      icon: DollarSign,
      color: "text-neutral-600"
    }
  ];

  const getCategoryBadgeStyle = (category: string) => {
    const styles = {
      "Income": "bg-secondary/10 text-secondary",
      "Entrata": "bg-secondary/10 text-secondary",
      "Investment": "bg-primary/10 text-primary",
      "Investimento": "bg-primary/10 text-primary",
      "Loan": "bg-accent/10 text-accent",
      "Prestito": "bg-accent/10 text-accent",
      "Transfer": "bg-neutral-100 text-neutral-600",
      "Trasferimento": "bg-neutral-100 text-neutral-600",
      "Utilities": "bg-neutral-100 text-neutral-600",
      "Bollette": "bg-neutral-100 text-neutral-600",
      "Expense": "bg-neutral-100 text-neutral-600",
      "Spesa": "bg-neutral-100 text-neutral-600",
      default: "bg-neutral-100 text-neutral-600"
    };
    return styles[category as keyof typeof styles] || styles.default;
  };

  if (summaryLoading) {
    return (
      <div className="flex-1">
        <Header 
          title="Dashboard Finanziario" 
          subtitle="Bentornato, gestisci le tue finanze in modo efficiente" 
        />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title="Dashboard Finanziario" 
        subtitle="Bentornato, gestisci le tue finanze in modo efficiente" 
      />
      
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Account Overview - Responsive Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="stat-card bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-neutral-600 mb-1">{stat.title}</p>
                    <p className="text-xl lg:text-2xl font-bold text-neutral-800 leading-tight mb-2">
                      {formatCurrency(stat.value)}
                    </p>
                    <p className={`text-xs lg:text-sm flex items-center space-x-1 ${
                      stat.positive === true ? 'text-secondary' : 
                      stat.positive === false ? 'text-accent' : 'text-neutral-500'
                    }`}>
                      {stat.positive === true && <ArrowUp className="h-3 w-3 flex-shrink-0" />}
                      {stat.positive === false && <ArrowDown className="h-3 w-3 flex-shrink-0" />}
                      <span className="line-clamp-1">{stat.change}</span>
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 lg:h-7 lg:w-7 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Account Summary */}
        <section className="financial-card">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-800">I Tuoi Conti</h3>
          </div>
          
          {accounts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account: any) => (
                <Card key={account.id} className="border border-neutral-200 hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-800 text-sm mb-1">
                          {account.name}
                        </h4>
                        <p className="text-xs text-neutral-500 mb-2">
                          {getAccountDisplayNumber(account.accountNumber)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-neutral-800">
                            {formatCurrency(account.balance)}
                          </span>
                          <Badge className={`text-xs ${
                            account.type === 'checking' ? 'bg-blue-100 text-blue-800' :
                            account.type === 'savings' ? 'bg-green-100 text-green-800' :
                            account.type === 'investment' ? 'bg-purple-100 text-purple-800' :
                            'bg-neutral-100 text-neutral-800'
                          }`}>
                            {account.type === 'checking' ? 'Corrente' :
                             account.type === 'savings' ? 'Risparmio' :
                             account.type === 'investment' ? 'Investimenti' : account.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">Nessun conto disponibile</p>
          )}
        </section>

        {/* Charts - Responsive */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          <PortfolioChart />
          <AllocationChart />
        </section>

        {/* Calculators - Responsive */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          <LoanCalculator />
          <InvestmentSimulator />
        </section>

        {/* Recent Transactions */}
        <section className="financial-card">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-800">Transazioni Recenti</h3>
            <Link 
              href="/transactions" 
              className="text-primary hover:text-primary/80 text-xs sm:text-sm font-medium transition-colors self-start sm:self-center"
            >
              Vedi Tutto
            </Link>
          </div>
          
          {transactionsLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-6">
              <div className="min-w-full px-3 sm:px-4 lg:px-6">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="text-left text-xs sm:text-sm text-neutral-600 border-b border-neutral-200">
                      <th className="pb-3 font-medium">Data</th>
                      <th className="pb-3 font-medium">Descrizione</th>
                      <th className="pb-3 font-medium hidden sm:table-cell">Categoria</th>
                      <th className="pb-3 font-medium hidden md:table-cell">Conto</th>
                      <th className="pb-3 font-medium text-right">Importo</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm">
                    {transactions?.map((transaction: any) => (
                      <tr key={transaction.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-3 sm:py-4 text-neutral-600">{formatDate(transaction.date)}</td>
                        <td className="py-3 sm:py-4 font-medium text-neutral-800 truncate max-w-[120px] sm:max-w-none">{transaction.description}</td>
                        <td className="py-3 sm:py-4 hidden sm:table-cell">
                          <Badge className={getCategoryBadgeStyle(transaction.category)}>
                            {transaction.category === 'Income' ? 'Entrata' :
                             transaction.category === 'Expense' ? 'Spesa' :
                             transaction.category === 'Transfer' ? 'Trasferimento' :
                             transaction.category === 'Investment' ? 'Investimento' :
                             transaction.category === 'Loan' ? 'Prestito' :
                             transaction.category === 'Utilities' ? 'Bollette' : transaction.category}
                          </Badge>
                        </td>
                        <td className="py-3 sm:py-4 text-neutral-600 hidden md:table-cell truncate max-w-[100px]">
                          {transaction.accountName} {getAccountDisplayNumber(transaction.accountNumber)}
                        </td>
                        <td className={`py-3 sm:py-4 text-right font-medium ${
                          transaction.type === 'credit' ? 'text-secondary' : 'text-neutral-800'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

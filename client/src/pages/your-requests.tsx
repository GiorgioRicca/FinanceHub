import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/financial-utils";
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Building2,
  Car,
  Home,
  CreditCard,
  Target,
  DollarSign
} from "lucide-react";

const DEMO_USER_ID = "demo-user-123";

interface LoanApplication {
  id: string;
  type: string;
  amount: string;
  purpose: string;
  income: string;
  employmentStatus: string;
  creditScore: number;
  status: string;
  submittedDate: string;
  estimatedRate: string;
  estimatedMonthly: string;
  approvedDate?: string;
}

interface InvestmentSimulation {
  id: string;
  asset: string;
  amount: string;
  strategy: string;
  riskLevel: string;
  expectedReturn: string;
  timeframe: string;
  submittedDate: string;
  status: string;
}

export default function YourRequests() {
  const { data: loanApplications = [], isLoading: loansLoading } = useQuery<LoanApplication[]>({
    queryKey: ["/api/loan-workflow/applications", DEMO_USER_ID],
    refetchInterval: 15000, 
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const { data: investmentSimulations = [], isLoading: investmentsLoading } = useQuery<InvestmentSimulation[]>({
    queryKey: ["/api/investment-workflow/simulations", DEMO_USER_ID],
    refetchInterval: 30000, 
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const getLoanTypeIcon = (type: string) => {
    switch (type) {
      case "mortgage": return Home;
      case "auto": return Car;
      case "personal": return CreditCard;
      default: return Building2;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "requires_documents": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return CheckCircle;
      case "completed": return CheckCircle;
      case "pending": return Clock;
      case "requires_documents": return AlertCircle;
      case "rejected": return AlertCircle;
      default: return FileText;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const isLoading = loansLoading || investmentsLoading;
  const totalRequests = loanApplications.length + investmentSimulations.length;

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header 
          title="Le Tue Richieste" 
          subtitle="Monitora le tue richieste di prestiti e simulazioni di investimento" 
        />
        <div className="p-4 lg:p-6">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title="Le Tue Richieste" 
        subtitle="Monitora le tue richieste di prestiti e simulazioni di investimento" 
      />
      
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <Card className="stat-card">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Totale Richieste</p>
                  <p className="text-2xl font-bold text-neutral-800 mt-1">{totalRequests}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Richieste Prestiti</p>
                  <p className="text-2xl font-bold text-neutral-800 mt-1">{loanApplications.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Simulazioni Investimenti</p>
                  <p className="text-2xl font-bold text-neutral-800 mt-1">{investmentSimulations.length}</p>
                </div>
                <Target className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loan Applications */}
        {loanApplications.length > 0 && (
          <section className="financial-card">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 lg:mb-6">Richieste di Prestito</h3>
            <div className="space-y-4">
              {loanApplications.map((application) => {
                const LoanIcon = getLoanTypeIcon(application.type);
                const StatusIcon = getStatusIcon(application.status);
                
                return (
                  <Card key={application.id} className="border border-neutral-200">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <LoanIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-neutral-800 capitalize">
                                {application.type === "mortgage" ? "Mutuo" : 
                                 application.type === "auto" ? "Prestito Auto" : 
                                 "Prestito Personale"}
                              </h4>
                              <Badge className={getStatusColor(application.status)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {application.status === "approved" ? "Approvato" :
                                 application.status === "pending" ? "In Attesa" :
                                 application.status === "requires_documents" ? "Documenti Richiesti" :
                                 "Rifiutato"}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600 mb-1">{application.purpose}</p>
                            <p className="text-xs text-neutral-500">
                              Richiesto il {formatDate(application.submittedDate)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-neutral-500">Importo</p>
                            <p className="font-semibold">{formatCurrency(application.amount)}</p>
                          </div>
                          <div>
                            <p className="text-neutral-500">Tasso Stimato</p>
                            <p className="font-semibold">{(parseFloat(application.estimatedRate) * 100).toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-neutral-500">Rata Mensile</p>
                            <p className="font-semibold">{formatCurrency(application.estimatedMonthly)}</p>
                          </div>
                          <div>
                            <p className="text-neutral-500">Credit Score</p>
                            <p className="font-semibold">{application.creditScore}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Investment Simulations */}
        {investmentSimulations.length > 0 && (
          <section className="financial-card">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 lg:mb-6">Simulazioni di Investimento</h3>
            <div className="space-y-4">
              {investmentSimulations.map((simulation) => {
                const StatusIcon = getStatusIcon(simulation.status);
                
                return (
                  <Card key={simulation.id} className="border border-neutral-200">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-secondary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-neutral-800">{simulation.asset}</h4>
                              <Badge className={getStatusColor(simulation.status)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {simulation.status === "completed" ? "Completato" : "In Corso"}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600 mb-1 capitalize">{simulation.strategy}</p>
                            <p className="text-xs text-neutral-500">
                              Simulato il {formatDate(simulation.submittedDate)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-neutral-500">Importo</p>
                            <p className="font-semibold">{formatCurrency(simulation.amount)}</p>
                          </div>
                          <div>
                            <p className="text-neutral-500">Livello Rischio</p>
                            <Badge className={getRiskLevelColor(simulation.riskLevel)}>
                              {simulation.riskLevel === "low" ? "Basso" :
                               simulation.riskLevel === "medium" ? "Medio" : "Alto"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-neutral-500">Rendimento Atteso</p>
                            <p className="font-semibold text-secondary">{simulation.expectedReturn}</p>
                          </div>
                          <div>
                            <p className="text-neutral-500">Orizzonte Temporale</p>
                            <p className="font-semibold">{simulation.timeframe} anni</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {totalRequests === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Nessuna Richiesta</h3>
            <p className="text-neutral-600 mb-6">
              Non hai ancora effettuato richieste di prestiti o simulazioni di investimento.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/loan-workflow" 
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Richiedi Prestito
              </a>
              <a 
                href="/investment-workflow" 
                className="inline-flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Simula Investimento
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
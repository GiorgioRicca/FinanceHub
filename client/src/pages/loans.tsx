import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/financial-utils";
import { DollarSign, Calendar, Percent, CreditCard } from "lucide-react";
import type { Loan } from "@shared/schema";

const DEMO_USER_ID = "demo-user-123";

/**
 * Componente pagina prestiti per visualizzare e gestire prestiti attivi.
 * Mostra dettagli prestiti, progressi di rimborso e statistiche.
 * Implementa calcoli di progresso e visualizzazione grafica dello stato.
 */
export default function Loans() {
  const { data: loans, isLoading } = useQuery<Loan[]>({
    queryKey: ["/api/loans", DEMO_USER_ID],
    refetchInterval: 30000, 
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const calculateLoanProgress = (loan: Loan) => {
    const totalPaid = parseFloat(loan.principal) - parseFloat(loan.remainingBalance);
    const progressPercent = (totalPaid / parseFloat(loan.principal)) * 100;
    return {
      totalPaid,
      progressPercent: Math.max(0, Math.min(100, progressPercent))
    };
  };

  const getLoanTypeStyle = (type: string) => {
    const styles = {
      "mortgage": "bg-primary/10 text-primary",
      "auto": "bg-secondary/10 text-secondary",
      "personal": "bg-accent/10 text-accent",
      default: "bg-neutral-100 text-neutral-600"
    };
    return styles[type as keyof typeof styles] || styles.default;
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Prestiti" subtitle="Gestisci i tuoi prestiti e pagamenti" />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
              ))}
            </div>
            <div className="bg-gray-200 h-96 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalRemaining = loans?.reduce((sum, loan) => sum + parseFloat(loan.remainingBalance), 0) || 0;
  const totalMonthlyPayments = loans?.reduce((sum, loan) => sum + parseFloat(loan.monthlyPayment), 0) || 0;
  const averageRate = (loans && loans.length > 0) ? loans.reduce((sum, loan) => sum + parseFloat(loan.interestRate), 0) / loans.length : 0;

  return (
    <div className="flex-1">
      <Header title="Prestiti" subtitle="Gestisci i tuoi prestiti e pagamenti" />
      
      <div className="p-6 space-y-6">
        {/* Loan Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Totale Residuo</p>
                  <p className="text-2xl font-bold text-neutral-800 mt-1">
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Rate Mensili</p>
                  <p className="text-2xl font-bold text-neutral-800 mt-1">
                    {formatCurrency(totalMonthlyPayments)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Tasso Medio</p>
                  <p className="text-2xl font-bold text-neutral-800 mt-1">
                    {(averageRate * 100).toFixed(2)}%
                  </p>
                </div>
                <Percent className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loan Details */}
        <div className="space-y-6">
          {loans && loans.length > 0 ? (
            loans.map((loan) => {
              const { totalPaid, progressPercent } = calculateLoanProgress(loan);
              
              return (
                <Card key={loan.id} className="financial-card">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg capitalize">
                          {loan.type === 'mortgage' ? 'Mutuo' :
                           loan.type === 'auto' ? 'Prestito Auto' :
                           loan.type === 'personal' ? 'Prestito Personale' : loan.type}
                        </CardTitle>
                        <Badge className={getLoanTypeStyle(loan.type)}>
                          {loan.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">
                        Iniziato il {formatDate(loan.startDate)}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-neutral-400" />
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Loan Progress */}
                    <div>
                      <div className="flex justify-between text-sm text-neutral-600 mb-2">
                        <span>Progresso Prestito</span>
                        <span>{progressPercent.toFixed(1)}% pagato</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                      <div className="flex justify-between text-xs text-neutral-500 mt-1">
                        <span>Paid: {formatCurrency(totalPaid)}</span>
                        <span>Remaining: {formatCurrency(loan.remainingBalance)}</span>
                      </div>
                    </div>

                    {/* Loan Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-neutral-600">Importo Originale</p>
                        <p className="text-lg font-semibold text-neutral-800">
                          {formatCurrency(loan.principal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Rata Mensile</p>
                        <p className="text-lg font-semibold text-neutral-800">
                          {formatCurrency(loan.monthlyPayment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Tasso di Interesse</p>
                        <p className="text-lg font-semibold text-neutral-800">
                          {(parseFloat(loan.interestRate) * 100).toFixed(3)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Durata</p>
                        <p className="text-lg font-semibold text-neutral-800">
                          {loan.termMonths} mesi
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-2 text-sm font-semibold text-neutral-900">Nessun prestito attivo</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Attualmente non hai prestiti attivi.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

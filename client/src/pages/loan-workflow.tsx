import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/financial-utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Building2,
  Car,
  Home,
  CreditCard
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

interface LoanLimits {
  min_amount: number;
  max_amount: number;
}

export default function LoanWorkflow() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    purpose: "",
    income: "",
    employmentStatus: "",
    termMonths: "60"
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery<LoanApplication[]>({
    queryKey: ["/api/loan-workflow/applications", DEMO_USER_ID],
    refetchInterval: 15000, 
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  
  const { data: loanLimits } = useQuery<LoanLimits>({
    queryKey: ["/api/validation/loan-limits", formData.type],
    enabled: !!formData.type,
  });

  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/loan-workflow/apply", data);
      return await response.json();
    },
    onSuccess: (data) => {
      let toastMessage = `La tua richiesta di prestito è stata inviata. ID: ${data.id.slice(0, 8)}`;
      
      if (data.status === "approved") {
        toastMessage += " ✅ Approvata immediatamente!";
      } else if (data.status === "pending") {
        toastMessage += " ⏳ In valutazione (riceverai una notifica entro 60 secondi)";
      } else if (data.status === "requires_documents") {
        toastMessage += " 📋 Documentazione aggiuntiva richiesta";
      }
      
      toast({
        title: "Richiesta Inviata",
        description: toastMessage,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loan-workflow/applications"] });
      
      setFormData({
        type: "",
        amount: "",
        purpose: "",
        income: "",
        employmentStatus: "",
        termMonths: "60"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.amount || !formData.income || !formData.employmentStatus) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    
    const amount = parseFloat(formData.amount);
    if (loanLimits && (amount < loanLimits.min_amount || amount > loanLimits.max_amount)) {
      toast({
        title: "Importo Non Valido",
        description: `L'importo deve essere tra €${loanLimits.min_amount.toLocaleString()} e €${loanLimits.max_amount.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    applyMutation.mutate(formData);
  };

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
      case "Approvato": return "bg-green-100 text-green-800";
      case "In Valutazione":
      case "In Attesa":
           return "bg-yellow-100 text-yellow-800";
      case "Documenti Richiesti": return "bg-blue-100 text-blue-800";
      case "Rifiutato": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approvato": return CheckCircle;
      case "In Valutazione":
      case "In Attesa":
        return Clock;
      case "Documenti Richiesti": return FileText;
      case "Rifiutato": return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div className="flex-1">
      <Header 
        title="Workflow Prestiti" 
        subtitle="Richiedi e gestisci i tuoi prestiti"
      />
      
      <div className="p-6 space-y-6">
        {/* Modulo Richiesta Prestito */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span>Richiedi un Prestito</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-neutral-700">
                    Tipo di Prestito *
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mortgage">Mutuo Casa</SelectItem>
                      <SelectItem value="auto">Prestito Auto</SelectItem>
                      <SelectItem value="personal">Prestito Personale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount" className="text-sm font-medium text-neutral-700">
                    Importo Richiesto * (€)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="mt-2"
                    placeholder="25000"
                  />
                </div>

                <div>
                  <Label htmlFor="income" className="text-sm font-medium text-neutral-700">
                    Reddito Annuale * (€)
                  </Label>
                  <Input
                    id="income"
                    type="number"
                    value={formData.income}
                    onChange={(e) => setFormData({...formData, income: e.target.value})}
                    className="mt-2"
                    placeholder="45000"
                  />
                </div>

                <div>
                  <Label htmlFor="employment" className="text-sm font-medium text-neutral-700">
                    Stato Occupazionale *
                  </Label>
                  <Select value={formData.employmentStatus} onValueChange={(value) => setFormData({...formData, employmentStatus: value})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Seleziona stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Dipendente</SelectItem>
                      <SelectItem value="self_employed">Libero Professionista</SelectItem>
                      <SelectItem value="unemployed">Disoccupato</SelectItem>
                      <SelectItem value="retired">Pensionato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="termMonths" className="text-sm font-medium text-neutral-700">
                    Durata (mesi)
                  </Label>
                  <Select value={formData.termMonths} onValueChange={(value) => setFormData({...formData, termMonths: value})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 mesi</SelectItem>
                      <SelectItem value="24">24 mesi</SelectItem>
                      <SelectItem value="36">36 mesi</SelectItem>
                      <SelectItem value="60">60 mesi</SelectItem>
                      <SelectItem value="120">120 mesi</SelectItem>
                      <SelectItem value="240">240 mesi</SelectItem>
                      <SelectItem value="360">360 mesi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="purpose" className="text-sm font-medium text-neutral-700">
                  Finalità del Prestito
                </Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="mt-2"
                  placeholder="Descrivi brevemente l'utilizzo del prestito..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/90"
                disabled={applyMutation.isPending}
              >
                {applyMutation.isPending ? "Invio in corso..." : "Invia Richiesta"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stato delle Richieste */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Le Tue Richieste</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => {
                  const Icon = getLoanTypeIcon(app.type);
                  const StatusIcon = getStatusIcon(app.status);
                  
                  return (
                    <div key={app.id} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-neutral-100 rounded-lg">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-neutral-800 capitalize">
                                {app.type === "mortgage" ? "Mutuo Casa" : 
                                 app.type === "auto" ? "Prestito Auto" : "Prestito Personale"}
                              </h4>
                              <Badge className={getStatusColor(app.status)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {app.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600 mt-1">
                              Importo: {formatCurrency(app.amount)} • 
                              Richiesta: {formatDate(app.submittedDate)}
                            </p>
                            {app.status === "approved" && (
                              <div className="mt-2 text-sm">
                                <span className="text-green-600 font-medium">
                                  Tasso: {app.estimatedRate}% • Rata: {formatCurrency(app.estimatedMonthly)}
                                </span>
                              </div>
                            )}
                            {app.purpose && (
                              <p className="text-sm text-neutral-500 mt-1">{app.purpose}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-neutral-500">
                          ID: {app.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-neutral-400" />
                <h3 className="mt-2 text-sm font-semibold text-neutral-900">
                  Nessuna richiesta
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Non hai ancora inviato richieste di prestito.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
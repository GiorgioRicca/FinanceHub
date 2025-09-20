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
import { formatCurrency, formatDate } from "@/lib/financial-utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Target, 
  PieChart, 
  BarChart3,
  Zap,
  Shield,
  Activity
} from "lucide-react";

const DEMO_USER_ID = "demo-user-123";

interface InvestmentSimulation {
  id: string;
  strategy: string;
  initialAmount: string;
  monthlyContribution: string;
  riskLevel: string;
  timeHorizon: string;
  portfolioAllocation: any;
  createdDate: string;
  projectedReturns: Array<{
    year: number;
    value: string;
    annualReturn: string;
  }>;
  riskMetrics: {
    volatility: string;
    sharpeRatio: string;
    maxDrawdown: string;
  };
}

interface InvestmentLimits {
  min_amount: number;
  max_amount: number;
}

export default function InvestmentWorkflow() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    strategy: "",
    initialAmount: "",
    monthlyContribution: "",
    riskLevel: "",
    timeHorizon: "10",
    portfolioAllocation: {
      stocks: 60,
      bonds: 30,
      alternatives: 10
    }
  });

  const { data: simulations, isLoading: simulationsLoading } = useQuery<InvestmentSimulation[]>({
    queryKey: ["/api/investment-workflow/simulations", DEMO_USER_ID],
  });

  
  const { data: investmentLimits } = useQuery<InvestmentLimits>({
    queryKey: ["/api/validation/investment-limits"],
  });

  const simulateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/investment-workflow/simulate", data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Simulazione Completata",
        description: `Simulazione creata con ID: ${data.id.slice(0, 8)}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/investment-workflow/simulations"] });
    }
  });

  const executeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/investment-workflow/execute", data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Investimento Eseguito",
        description: `Investimento eseguito. Conferma: ${data.confirmationNumber}`,
      });
    }
  });

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.strategy || !formData.initialAmount || !formData.riskLevel) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    
    const amount = parseFloat(formData.initialAmount);
    if (investmentLimits && (amount < investmentLimits.min_amount || amount > investmentLimits.max_amount)) {
      toast({
        title: "Importo Non Valido",
        description: `L'investimento deve essere tra €${investmentLimits.min_amount.toLocaleString()} e €${investmentLimits.max_amount.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    
    const simulationData = {
      asset: formData.strategy === "conservative" ? "Obbligazioni Governo" :
             formData.strategy === "moderate" ? "ETF Bilanciato" : "ETF Azionario",
      amount: formData.initialAmount,
      strategy: formData.strategy,
      riskLevel: formData.riskLevel,
      timeframe: formData.timeHorizon
    };

    simulateMutation.mutate(simulationData);
  };

  const handleExecuteInvestment = (simulationId: string, amount: string) => {
    executeMutation.mutate({ simulationId, amount });
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "conservative": return "bg-green-100 text-green-800";
      case "moderate": return "bg-yellow-100 text-yellow-800";
      case "aggressive": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "conservative": return Shield;
      case "moderate": return Target;
      case "aggressive": return Zap;
      default: return Activity;
    }
  };

  const updateAllocation = (type: string, value: number) => {
    const newAllocation = { ...formData.portfolioAllocation };
    newAllocation[type as keyof typeof newAllocation] = value;
    
    
    const total = Object.values(newAllocation).reduce((sum, val) => sum + val, 0);
    if (total <= 100) {
      setFormData({ ...formData, portfolioAllocation: newAllocation });
    }
  };

  return (
    <div className="flex-1">
      <Header 
        title="Workflow Investimenti" 
        subtitle="Simula e gestisci le tue strategie di investimento"
      />
      
      <div className="p-6 space-y-6">
        {/* Simulatore Investimenti */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Simula Strategia di Investimento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSimulate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="strategy" className="text-sm font-medium text-neutral-700">
                    Strategia di Investimento *
                  </Label>
                  <Select value={formData.strategy} onValueChange={(value) => setFormData({...formData, strategy: value})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Seleziona strategia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="growth">Crescita</SelectItem>
                      <SelectItem value="income">Reddito</SelectItem>
                      <SelectItem value="balanced">Bilanciata</SelectItem>
                      <SelectItem value="index">Indicizzata</SelectItem>
                      <SelectItem value="esg">ESG/Sostenibile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="riskLevel" className="text-sm font-medium text-neutral-700">
                    Profilo di Rischio *
                  </Label>
                  <Select value={formData.riskLevel} onValueChange={(value) => setFormData({...formData, riskLevel: value})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Seleziona rischio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservativo</SelectItem>
                      <SelectItem value="moderate">Moderato</SelectItem>
                      <SelectItem value="aggressive">Aggressivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="initialAmount" className="text-sm font-medium text-neutral-700">
                    Investimento Iniziale * (€)
                  </Label>
                  <Input
                    id="initialAmount"
                    type="number"
                    value={formData.initialAmount}
                    onChange={(e) => setFormData({...formData, initialAmount: e.target.value})}
                    className="mt-2"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyContribution" className="text-sm font-medium text-neutral-700">
                    Contributo Mensile (€)
                  </Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    value={formData.monthlyContribution}
                    onChange={(e) => setFormData({...formData, monthlyContribution: e.target.value})}
                    className="mt-2"
                    placeholder="500"
                  />
                </div>

                <div>
                  <Label htmlFor="timeHorizon" className="text-sm font-medium text-neutral-700">
                    Orizzonte Temporale (anni)
                  </Label>
                  <Select value={formData.timeHorizon} onValueChange={(value) => setFormData({...formData, timeHorizon: value})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 anni</SelectItem>
                      <SelectItem value="10">10 anni</SelectItem>
                      <SelectItem value="15">15 anni</SelectItem>
                      <SelectItem value="20">20 anni</SelectItem>
                      <SelectItem value="30">30 anni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Asset Allocation */}
              <div>
                <Label className="text-sm font-medium text-neutral-700">
                  Allocazione Portfolio
                </Label>
                <div className="mt-3 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Azioni: {formData.portfolioAllocation.stocks}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.portfolioAllocation.stocks}
                      onChange={(e) => updateAllocation('stocks', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Obbligazioni: {formData.portfolioAllocation.bonds}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.portfolioAllocation.bonds}
                      onChange={(e) => updateAllocation('bonds', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Alternativi: {formData.portfolioAllocation.alternatives}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.portfolioAllocation.alternatives}
                      onChange={(e) => updateAllocation('alternatives', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary text-white hover:bg-secondary/90"
                disabled={simulateMutation.isPending}
              >
                {simulateMutation.isPending ? "Simulazione in corso..." : "Avvia Simulazione"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Simulazioni Salvate */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Le Tue Simulazioni</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {simulationsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : simulations && simulations.length > 0 ? (
              <div className="space-y-6">
                {simulations.map((sim) => {
                  const RiskIcon = getRiskIcon(sim.riskLevel);
                  const finalYear = sim.projectedReturns && sim.projectedReturns.length > 0 
                    ? sim.projectedReturns[sim.projectedReturns.length - 1] 
                    : null;
                  
                  return (
                    <div key={sim.id} className="border border-neutral-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-neutral-100 rounded-lg">
                            <RiskIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-neutral-800 capitalize">
                                Strategia {sim.strategy}
                              </h4>
                              <Badge className={getRiskLevelColor(sim.riskLevel)}>
                                {sim.riskLevel === "conservative" ? "Conservativo" :
                                 sim.riskLevel === "moderate" ? "Moderato" : "Aggressivo"}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600 mt-1">
                              Creata: {formatDate(sim.createdDate)} • 
                              Orizzonte: {sim.timeHorizon} anni
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleExecuteInvestment(sim.id, sim.initialAmount)}
                            disabled={executeMutation.isPending}
                            className="bg-secondary text-white hover:bg-secondary/90"
                          >
                            Investi Ora
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-neutral-600">Investimento Iniziale</p>
                          <p className="font-semibold text-neutral-800">
                            {formatCurrency(sim.initialAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">Contributo Mensile</p>
                          <p className="font-semibold text-neutral-800">
                            {formatCurrency(sim.monthlyContribution)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">Valore Proiettato</p>
                          <p className="font-semibold text-secondary">
                            {finalYear ? formatCurrency(finalYear.value) : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">Rendimento Medio</p>
                          <p className="font-semibold text-primary">
                            {finalYear ? `${finalYear.annualReturn}%` : "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Metriche di Rischio */}
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <h5 className="font-medium text-neutral-800 mb-3">Metriche di Rischio</h5>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-600">Volatilità: </span>
                            <span className="font-medium">{sim.riskMetrics?.volatility || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-neutral-600">Sharpe Ratio: </span>
                            <span className="font-medium">{sim.riskMetrics?.sharpeRatio || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-neutral-600">Max Drawdown: </span>
                            <span className="font-medium">{sim.riskMetrics?.maxDrawdown || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-xs text-neutral-500 mt-2">
                        ID: {sim.id.slice(0, 8)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="mx-auto h-12 w-12 text-neutral-400" />
                <h3 className="mt-2 text-sm font-semibold text-neutral-900">
                  Nessuna simulazione
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Crea la tua prima simulazione di investimento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
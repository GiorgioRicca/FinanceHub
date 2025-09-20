import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/financial-utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface InvestmentResult {
  futureValue: string;
  totalContributions: string;
  totalGain: string;
  returnPercentage: string;
}

/**
 * Componente simulatore investimenti per proiezioni future.
 * Implementa calcoli di crescita con contributi mensili e interesse composto.
 * Simula scenari di investimento con diversi parametri temporali.
 */
export default function InvestmentSimulator() {
  const [initial, setInitial] = useState("");
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("10");
  const [result, setResult] = useState<InvestmentResult | null>(null);

  const calculateMutation = useMutation({
    mutationFn: async (data: { 
      initialInvestment: string; 
      monthlyContribution: string; 
      expectedReturn: string; 
      timeHorizon: string 
    }) => {
      const response = await apiRequest("POST", "/api/calculate/investment", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    }
  });

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initial || !monthly || !rate || !years) return;

    calculateMutation.mutate({
      initialInvestment: initial,
      monthlyContribution: monthly,
      expectedReturn: rate,
      timeHorizon: years
    });
  };

  return (
    <Card className="financial-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Simulatore Investimenti</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSimulate} className="space-y-4">
          <div>
            <Label htmlFor="initial" className="text-sm font-medium text-neutral-700">
              Investimento Iniziale
            </Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">$</span>
              <Input
                id="initial"
                type="number"
                value={initial}
                onChange={(e) => setInitial(e.target.value)}
                className="pl-8"
                placeholder="10,000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="monthly" className="text-sm font-medium text-neutral-700">
              Contributo Mensile
            </Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">$</span>
              <Input
                id="monthly"
                type="number"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                className="pl-8"
                placeholder="500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rate" className="text-sm font-medium text-neutral-700">
                Rendimento Atteso (%)
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="mt-2"
                placeholder="7.5"
              />
            </div>
            <div>
              <Label htmlFor="years" className="text-sm font-medium text-neutral-700">
                Orizzonte Temporale (anni)
              </Label>
              <Select value={years} onValueChange={setYears}>
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

          <Button
            type="submit"
            className="w-full bg-secondary text-white hover:bg-secondary/90"
            disabled={calculateMutation.isPending}
          >
            {calculateMutation.isPending ? "Simulazione..." : "Simula Crescita"}
          </Button>

          {result && (
            <div className="bg-secondary/5 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">Valore Futuro:</span>
                  <p className="font-semibold text-secondary">
                    {formatCurrency(result.futureValue)}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-600">Guadagno Totale:</span>
                  <p className="font-semibold text-secondary">
                    {formatCurrency(result.totalGain)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

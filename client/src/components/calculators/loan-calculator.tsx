import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/financial-utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LoanResult {
  monthlyPayment: string;
  totalInterest: string;
  totalAmount: string;
}

/**
 * Componente calcolatore prestiti per simulare rate e interessi.
 * Implementa form interattivo con validazione e chiamate API.
 * Calcola rate mensili, interessi totali e importo totale del prestito.
 */
export default function LoanCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [term, setTerm] = useState("15");
  const [result, setResult] = useState<LoanResult | null>(null);

  const calculateMutation = useMutation({
    mutationFn: async (data: { principal: string; interestRate: string; termYears: string }) => {
      const response = await apiRequest("POST", "/api/calculate/loan", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    }
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !rate || !term) return;

    calculateMutation.mutate({
      principal: amount,
      interestRate: rate,
      termYears: term
    });
  };

  return (
    <Card className="financial-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Calcolatore Prestiti</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <Label htmlFor="amount" className="text-sm font-medium text-neutral-700">
              Importo Prestito
            </Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">$</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                placeholder="50,000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rate" className="text-sm font-medium text-neutral-700">
                Tasso Interesse (%)
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="mt-2"
                placeholder="5.25"
              />
            </div>
            <div>
              <Label htmlFor="term" className="text-sm font-medium text-neutral-700">
                Term (years)
              </Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 years</SelectItem>
                  <SelectItem value="10">10 years</SelectItem>
                  <SelectItem value="15">15 years</SelectItem>
                  <SelectItem value="20">20 years</SelectItem>
                  <SelectItem value="30">30 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-white hover:bg-primary/90"
            disabled={calculateMutation.isPending}
          >
            {calculateMutation.isPending ? "Calcolo..." : "Calcola Rata"}
          </Button>

          {result && (
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">Rata Mensile:</span>
                  <p className="font-semibold text-neutral-800">
                    {formatCurrency(result.monthlyPayment)}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-600">Interesse Totale:</span>
                  <p className="font-semibold text-neutral-800">
                    {formatCurrency(result.totalInterest)}
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

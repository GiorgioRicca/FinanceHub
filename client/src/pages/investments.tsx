import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  formatCurrency,
  formatPercent,
  formatDate,
} from "@/lib/financial-utils";
import { apiRequest } from "@/lib/queryClient";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  ShoppingCart,
  Minus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Investment, Account } from "@shared/schema";

const DEMO_USER_ID = "demo-user-123";

/**
 * Componente pagina investimenti per gestire il portafoglio utente.
 * Implementa acquisto/vendita investimenti con dialog e validazioni.
 * Mostra performance, dettagli investimenti e operazioni di trading.
 */
export default function Investments() {
  const [selectedInvestment, setSelectedInvestment] =
    useState<Investment | null>(null);
  const [sharesToSell, setSharesToSell] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: investments, isLoading } = useQuery<Investment[]>({
    queryKey: ["/api/investments", DEMO_USER_ID],
    refetchInterval: 45000, 
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts", DEMO_USER_ID],
  });

  const sellMutation = useMutation({
    mutationFn: async ({
      symbol,
      shares,
      accountId,
    }: {
      symbol: string;
      shares: string;
      accountId: string;
    }) => {
      const response = await apiRequest("POST", "/api/investments/sell", {
        userId: DEMO_USER_ID,
        symbol,
        shares,
        accountId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Vendita completata",
        description: "L'investimento è stato venduto con successo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setSelectedInvestment(null);
      setSharesToSell("");
      setSelectedAccount("");
    },
    onError: (error: any) => {
      toast({
        title: "Errore nella vendita",
        description:
          error.message || "Si è verificato un errore durante la vendita",
        variant: "destructive",
      });
    },
  });

  const handleSell = () => {
    if (!selectedInvestment || !sharesToSell || !selectedAccount) return;

    sellMutation.mutate({
      symbol: selectedInvestment.symbol,
      shares: sharesToSell,
      accountId: selectedAccount,
    });
  };

  const calculateGainLoss = (investment: Investment) => {
    const currentValue =
      parseFloat(investment.shares) * parseFloat(investment.currentPrice);
    const purchaseValue =
      parseFloat(investment.shares) * parseFloat(investment.purchasePrice);
    const gainLoss = currentValue - purchaseValue;
    const gainLossPercent = (gainLoss / purchaseValue) * 100;

    return {
      currentValue,
      purchaseValue,
      gainLoss,
      gainLossPercent,
      isGain: gainLoss >= 0,
    };
  };

  const getAssetType = (investment: Investment) => {
    const symbol = (investment.symbol || "").toUpperCase();
    const name = (investment.name || "").toUpperCase();

    
    const S = String(symbol ?? "").toUpperCase();
    const N = String(name ?? "").toUpperCase();

    if (
      S.includes("BTP") ||
      S.includes("BOND") ||
      N.includes("BOND") ||
      N.includes("BTP") ||
      N.includes("OBBLIGAZ")
    ) {
      return { type: "Obbligazione", color: "bg-green-100 text-green-800" };
    }

    
    if (
      S.includes("FTSE-MIB") ||
      S.includes("ETF") ||
      N.includes("ETF") ||
      N.includes("INDEX")
    ) {
      return { type: "ETF", color: "bg-red-100 text-red-800" };
    }

    
    return { type: "Azione", color: "bg-blue-100 text-blue-800" };
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header
          title="Investimenti"
          subtitle="Monitora il tuo portafoglio di investimenti"
        />
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

  const totalValue =
    investments?.reduce((sum, inv) => {
      return sum + parseFloat(inv.shares) * parseFloat(inv.currentPrice);
    }, 0) || 0;

  const totalGainLoss =
    investments?.reduce((sum, inv) => {
      const { gainLoss } = calculateGainLoss(inv);
      return sum + gainLoss;
    }, 0) || 0;

  const totalGainLossPercent =
    investments?.reduce((sum, inv, _, arr) => {
      const { gainLossPercent } = calculateGainLoss(inv);
      return sum + gainLossPercent / arr.length;
    }, 0) || 0;

  return (
    <div className="flex-1">
      <Header
        title="Investimenti"
        subtitle="Monitora il tuo portafoglio di investimenti"
      />

      <div className="p-6 space-y-6">
        {/* Azioni */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Il Tuo Portafoglio</h2>
          </div>
          <Link href="/investment-marketplace">
            <Button>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Acquista Asset
            </Button>
          </Link>
        </div>

        {/* Riepilogo Portafoglio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">
                    Valore Totale
                  </p>
                  <p className="text-2xl font-bold text-neutral-800 mt-1">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">
                    Guadagno/Perdita Totale
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      totalGainLoss >= 0 ? "text-secondary" : "text-accent"
                    }`}
                  >
                    {totalGainLoss >= 0 ? "+" : ""}
                    {formatCurrency(totalGainLoss)}
                  </p>
                </div>
                {totalGainLoss >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-secondary" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-accent" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">
                    Performance
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      totalGainLossPercent >= 0
                        ? "text-secondary"
                        : "text-accent"
                    }`}
                  >
                    {formatPercent(totalGainLossPercent)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Holdings */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle>
              Portafoglio Investimenti
              <span className="text-sm font-normal text-neutral-600 ml-2">
                ({investments?.length || 0} asset)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {investments && investments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-neutral-600 border-b border-neutral-200">
                      <th className="pb-3 font-medium">Simbolo</th>
                      <th className="pb-3 font-medium">Nome</th>
                      <th className="pb-3 font-medium">Tipo</th>
                      <th className="pb-3 font-medium">Quantità</th>
                      <th className="pb-3 font-medium">Prezzo Acquisto</th>
                      <th className="pb-3 font-medium">Prezzo Attuale</th>
                      <th className="pb-3 font-medium">Valore Attuale</th>
                      <th className="pb-3 font-medium">Guadagno/Perdita</th>
                      <th className="pb-3 font-medium">Data Acquisto</th>
                      <th className="pb-3 font-medium text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {investments.map((investment) => {
                      const {
                        currentValue,
                        gainLoss,
                        gainLossPercent,
                        isGain,
                      } = calculateGainLoss(investment);
                      const { type, color } = getAssetType(investment);

                      return (
                        <tr
                          key={investment.id}
                          className="border-b border-neutral-100 hover:bg-neutral-50"
                        >
                          <td className="py-4 font-semibold text-neutral-800">
                            {investment.symbol}
                          </td>
                          <td className="py-4 text-neutral-600">
                            {investment.name}
                          </td>
                          <td className="py-4">
                            <Badge className={`${color} border-0`}>
                              {type}
                            </Badge>
                          </td>
                          <td className="py-4 text-neutral-600">
                            {Math.floor(parseFloat(investment.shares))}
                          </td>
                          <td className="py-4 text-neutral-600">
                            {formatCurrency(investment.purchasePrice)}
                          </td>
                          <td className="py-4 text-neutral-600">
                            {formatCurrency(investment.currentPrice)}
                          </td>
                          <td className="py-4 font-medium text-neutral-800">
                            {formatCurrency(currentValue)}
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span
                                className={`font-medium ${isGain ? "text-secondary" : "text-accent"}`}
                              >
                                {isGain ? "+" : ""}
                                {formatCurrency(gainLoss)}
                              </span>
                              <Badge
                                className={`w-fit ${isGain ? "bg-secondary/10 text-secondary" : "bg-accent/10 text-accent"}`}
                              >
                                {formatPercent(gainLossPercent)}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-4 text-neutral-600">
                            {formatDate(investment.purchaseDate)}
                          </td>
                          <td className="py-4 text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedInvestment(investment)
                                  }
                                >
                                  <Minus className="h-4 w-4 mr-1" />
                                  Vendi
                                </Button>
                              </DialogTrigger>

                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Vendi {investment.name}
                                  </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4">
                                  <div className="bg-neutral-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium">
                                        {investment.symbol}
                                      </span>
                                      <span className="text-lg font-bold text-secondary">
                                        {formatCurrency(
                                          investment.currentPrice,
                                        )}
                                      </span>
                                    </div>
                                    <p className="text-sm text-neutral-600 mt-1">
                                      {investment.name}
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                      Possedute:{" "}
                                      {Math.floor(
                                        parseFloat(investment.shares),
                                      )}{" "}
                                      {getAssetType(investment).type ===
                                      "Azione"
                                        ? "azioni"
                                        : getAssetType(investment).type ===
                                            "ETF"
                                          ? "quote"
                                          : "titoli"}
                                    </p>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="sharesToSell">
                                        Numero di Azioni da Vendere
                                      </Label>
                                      <Input
                                        id="sharesToSell"
                                        type="number"
                                        value={sharesToSell}
                                        onChange={(e) =>
                                          setSharesToSell(e.target.value)
                                        }
                                        placeholder="Es. 5"
                                        min="1"
                                        max={parseFloat(investment.shares)}
                                        step="1"
                                      />
                                    </div>

                                    <div>
                                      <Label htmlFor="accountSell">
                                        Conto di Accredito
                                      </Label>
                                      <Select
                                        value={selectedAccount}
                                        onValueChange={setSelectedAccount}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Seleziona un conto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {accounts
                                            ?.filter(
                                              (acc) => acc.type !== "loan",
                                            )
                                            .map((account) => (
                                              <SelectItem
                                                key={account.id}
                                                value={account.id}
                                              >
                                                {account.name} -{" "}
                                                {formatCurrency(
                                                  account.balance,
                                                )}
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {sharesToSell && selectedInvestment && (
                                      <div className="bg-secondary/10 p-3 rounded-lg">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm">
                                            Ricavo Vendita:
                                          </span>
                                          <span className="font-bold text-secondary">
                                            {formatCurrency(
                                              (
                                                parseFloat(sharesToSell) *
                                                parseFloat(
                                                  selectedInvestment.currentPrice,
                                                )
                                              ).toString(),
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    <Button
                                      onClick={handleSell}
                                      disabled={
                                        !sharesToSell ||
                                        !selectedAccount ||
                                        sellMutation.isPending
                                      }
                                      className="w-full"
                                      variant="destructive"
                                    >
                                      {sellMutation.isPending
                                        ? "Elaborazione..."
                                        : "Conferma Vendita"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-neutral-400" />
                <h3 className="mt-2 text-sm font-semibold text-neutral-900">
                  Nessun investimento
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Inizia a costruire il tuo portafoglio investimenti oggi.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/financial-utils";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, TrendingUp, Building2, Zap, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AvailableAsset, Account } from "@shared/schema";

const DEMO_USER_ID = "demo-user-123";

export default function InvestmentMarketplace() {
  const [selectedAsset, setSelectedAsset] = useState<AvailableAsset | null>(null);
  const [shares, setShares] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assets, isLoading: assetsLoading } = useQuery<AvailableAsset[]>({
    queryKey: ["/api/assets"],
    refetchInterval: 30000,
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts", DEMO_USER_ID],
  });

  const buyMutation = useMutation({
    mutationFn: async ({ symbol, shares, accountId }: { symbol: string; shares: string; accountId: string }) => {
      const response = await apiRequest("POST", "/api/investments/buy", {
        userId: DEMO_USER_ID,
        symbol,
        shares,
        accountId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Acquisto completato",
        description: "L'investimento è stato aggiunto al tuo portafoglio",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setSelectedAsset(null);
      setShares("");
      setSelectedAccount("");
    },
    onError: (error: any) => {
      toast({
        title: "Errore nell'acquisto",
        description: error.message || "Si è verificato un errore durante l'acquisto",
        variant: "destructive",
      });
    },
  });

  const handleBuy = () => {
    if (!selectedAsset || !shares || !selectedAccount) return;

    const sharesNum = parseFloat(shares);
    const totalCost = sharesNum * parseFloat(selectedAsset.currentPrice);
    const account = accounts?.find(acc => acc.id === selectedAccount);
    
    if (!account || parseFloat(account.balance) < totalCost) {
      toast({
        title: "Fondi insufficienti",
        description: "Il conto selezionato non ha fondi sufficienti per questo acquisto",
        variant: "destructive",
      });
      return;
    }

    buyMutation.mutate({
      symbol: selectedAsset.symbol,
      shares,
      accountId: selectedAccount
    });
  };

  const getSectorIcon = (sector: string) => {
    switch (sector?.toLowerCase()) {
      case 'energy': return <Zap className="h-4 w-4" />;
      case 'finance': return <DollarSign className="h-4 w-4" />;
      case 'technology': return <TrendingUp className="h-4 w-4" />;
      case 'utilities': return <Building2 className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getSectorColor = (sector: string) => {
    switch (sector?.toLowerCase()) {
      case 'energy': return 'bg-yellow-100 text-yellow-800';
      case 'finance': return 'bg-blue-100 text-blue-800';
      case 'technology': return 'bg-purple-100 text-purple-800';
      case 'utilities': return 'bg-green-100 text-green-800';
      case 'government': return 'bg-gray-100 text-gray-800';
      case 'corporate': return 'bg-orange-100 text-orange-800';
      case 'etf': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const filteredAssets = assets?.filter(asset => {
    if (filterType === "all") return true;
    return asset.type === filterType;
  });

  if (assetsLoading) {
    return (
      <div className="flex-1">
        <Header title="Mercato Investimenti" subtitle="Acquista azioni e obbligazioni per il tuo portafoglio" />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-200 h-48 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header title="Mercato Investimenti" subtitle="Acquista azioni e obbligazioni per il tuo portafoglio" />
      
      <div className="p-6 space-y-6">
        {/* Filtri */}
        <div className="flex items-center justify-between">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli Asset</SelectItem>
              <SelectItem value="stock">Azioni</SelectItem>
              <SelectItem value="bond">Obbligazioni</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="text-sm text-neutral-600">
            {filteredAssets?.length || 0} asset disponibili
          </div>
        </div>

        {/* Grid degli Asset */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets?.map((asset) => (
            <Card key={asset.symbol} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getSectorIcon(asset.sector)}
                    <CardTitle className="text-lg">{asset.symbol}</CardTitle>
                  </div>
                  <Badge className={getSectorColor(asset.sector)}>
                    {asset.type === 'stock' ? 'Azione' : 'Obbligazione'}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600 font-medium">{asset.name}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Prezzo</span>
                    <span className="text-lg font-semibold text-secondary">
                      {formatCurrency(asset.currentPrice)}
                    </span>
                  </div>
                  
                  {asset.sector && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Settore</span>
                      <Badge variant="outline" className="text-xs">
                        {asset.sector}
                      </Badge>
                    </div>
                  )}
                </div>

                {asset.description && (
                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {asset.description}
                  </p>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Acquista
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Acquista {asset.name}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="bg-neutral-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{asset.symbol}</span>
                          <span className="text-lg font-bold text-secondary">
                            {formatCurrency(asset.currentPrice)}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">{asset.name}</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="shares">Numero di Azioni/Obbligazioni</Label>
                          <Input
                            id="shares"
                            type="number"
                            value={shares}
                            onChange={(e) => setShares(e.target.value)}
                            placeholder="Es. 10"
                            min="1"
                            step="1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="account">Conto di Addebito</Label>
                          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona un conto" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts?.filter(acc => acc.type !== 'loan').map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name} - {formatCurrency(account.balance)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {shares && selectedAsset && (
                          <div className="bg-secondary/10 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Costo Totale:</span>
                              <span className="font-bold text-secondary">
                                {formatCurrency((parseFloat(shares) * parseFloat(selectedAsset.currentPrice)).toString())}
                              </span>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleBuy}
                          disabled={!shares || !selectedAccount || buyMutation.isPending}
                          className="w-full"
                        >
                          {buyMutation.isPending ? "Elaborazione..." : "Conferma Acquisto"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!filteredAssets || filteredAssets.length === 0) && (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-600 mb-2">Nessun asset disponibile</h3>
            <p className="text-neutral-500">
              Non ci sono asset disponibili per il filtro selezionato.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
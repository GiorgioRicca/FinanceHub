import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCurrency,
  formatDate,
  getAccountDisplayNumber,
} from "@/lib/financial-utils";
import { Receipt, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const DEMO_USER_ID = "demo-user-123";

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [limit, setLimit] = useState("50");

  const { data: transactions = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/transactions/recent/${DEMO_USER_ID}/${limit}`],
    refetchInterval: 15000, 
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const getCategoryBadgeStyle = (category: string) => {
    const styles = {
      Income: "bg-secondary/10 text-secondary",
      Investment: "bg-primary/10 text-primary",
      Loan: "bg-accent/10 text-accent",
      Transfer: "bg-neutral-100 text-neutral-600",
      Utilities: "bg-orange-100 text-orange-600",
      default: "bg-neutral-100 text-neutral-600",
    };
    return styles[category as keyof typeof styles] || styles.default;
  };

  type Tx = {
    description?: string | null;
    category?: string | null;
  };

  const toLower = (v: unknown) => String(v ?? "").toLowerCase();

  const safeIncludes = (haystack: unknown, needle: unknown) =>
    toLower(haystack).includes(toLower(needle));

  const safeEqCI = (a: unknown, b: unknown) => toLower(a) === toLower(b);

  const filteredTransactions = (transactions ?? []).filter(
    (tx: Tx | null | undefined) => {
      const q = toLower(searchTerm);

      const matchesSearch =
        safeIncludes(tx?.description, q) || safeIncludes(tx?.category, q);

      const matchesCategory =
        safeEqCI(categoryFilter, "all") ||
        safeEqCI(tx?.category, categoryFilter);

      return matchesSearch && matchesCategory;
    },
  );

  const categories = Array.from(
    new Set(transactions.map((t: any) => t.category)),
  );

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header
          title="Transazioni"
          subtitle="Visualizza e gestisci lo storico delle transazioni"
        />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header
        title="Transazioni"
        subtitle="Visualizza e gestisci lo storico delle transazioni"
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card className="financial-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Cerca transazioni..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-4">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tutte le Categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le Categorie</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={limit} onValueChange={setLimit}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 items</SelectItem>
                    <SelectItem value="50">50 items</SelectItem>
                    <SelectItem value="100">100 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card className="financial-card">
          <CardContent className="p-0">
            {filteredTransactions && filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr className="text-left text-sm text-neutral-600">
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Description</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">Account</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredTransactions.map((transaction: any) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-neutral-100 hover:bg-neutral-50"
                      >
                        <td className="p-4 text-neutral-600">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-neutral-800">
                            {transaction.description}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={getCategoryBadgeStyle(
                              transaction.category,
                            )}
                          >
                            {transaction.category}
                          </Badge>
                        </td>
                        <td className="p-4 text-neutral-600">
                          <div>{transaction.accountName}</div>
                          <div className="text-xs text-neutral-500">
                            {getAccountDisplayNumber(transaction.accountNumber)}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              transaction.type === "credit"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {transaction.type === "credit" ? "Credit" : "Debit"}
                          </Badge>
                        </td>
                        <td
                          className={`p-4 text-right font-medium ${
                            transaction.type === "credit"
                              ? "text-secondary"
                              : "text-neutral-800"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Receipt className="mx-auto h-12 w-12 text-neutral-400" />
                <h3 className="mt-2 text-sm font-semibold text-neutral-900">
                  No transactions found
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {searchTerm || categoryFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Your transactions will appear here once you start using your accounts."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        {filteredTransactions && filteredTransactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="stat-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-neutral-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-neutral-800 mt-1">
                    {filteredTransactions.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-neutral-600">Total Credits</p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {formatCurrency(
                      filteredTransactions
                        .filter((t: any) => t.type === "credit")
                        .reduce(
                          (sum: number, t: any) => sum + parseFloat(t.amount),
                          0,
                        ),
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-neutral-600">Total Debits</p>
                  <p className="text-2xl font-bold text-accent mt-1">
                    {formatCurrency(
                      filteredTransactions
                        .filter((t: any) => t.type === "debit")
                        .reduce(
                          (sum: number, t: any) => sum + parseFloat(t.amount),
                          0,
                        ),
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

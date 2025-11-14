import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History } from "lucide-react";

export default function TransactionsPage() {
  // Mock data - will be replaced with real data from backend in Task 2
  const transactions = [
    { id: "1", type: "funding", description: "Account Top-up", amount: "+3,000.00", status: "confirmed", date: "2025-01-15 14:30" },
    { id: "2", type: "data_purchase", description: "MTN 1GB Data", amount: "-250.00", status: "completed", date: "2025-01-15 12:15" },
    { id: "3", type: "airtime_purchase", description: "Glo ₦200 Airtime", amount: "-200.00", status: "completed", date: "2025-01-14 18:45" },
    { id: "4", type: "referral_bonus", description: "Referral Reward", amount: "+5,000.00", status: "completed", date: "2025-01-13 10:20" },
    { id: "5", type: "funding", description: "Account Top-up", amount: "+2,000.00", status: "pending", date: "2025-01-12 16:00" },
    { id: "6", type: "data_purchase", description: "9mobile 2GB Data", amount: "-380.00", status: "completed", date: "2025-01-11 09:30" },
    { id: "7", type: "airtime_purchase", description: "MTN ₦500 Airtime", amount: "-500.00", status: "completed", date: "2025-01-10 20:15" },
    { id: "8", type: "data_purchase", description: "Airtel 1.5GB Data", amount: "-350.00", status: "completed", date: "2025-01-09 11:45" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case "confirmed":
        return <Badge variant="default">Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "funding":
        return "Funding";
      case "data_purchase":
        return "Data Purchase";
      case "airtime_purchase":
        return "Airtime Purchase";
      case "referral_bonus":
        return "Referral Bonus";
      default:
        return type;
    }
  };

  const filterByType = (type?: string) => {
    if (!type) return transactions;
    return transactions.filter(t => t.type === type);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">View your transaction history</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="funding" data-testid="tab-funding">Funding</TabsTrigger>
          <TabsTrigger value="data_purchase" data-testid="tab-data">Data</TabsTrigger>
          <TabsTrigger value="airtime_purchase" data-testid="tab-airtime">Airtime</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <TransactionList transactions={transactions} getStatusBadge={getStatusBadge} getTypeLabel={getTypeLabel} />
        </TabsContent>

        <TabsContent value="funding" className="space-y-4">
          <TransactionList transactions={filterByType("funding")} getStatusBadge={getStatusBadge} getTypeLabel={getTypeLabel} />
        </TabsContent>

        <TabsContent value="data_purchase" className="space-y-4">
          <TransactionList transactions={filterByType("data_purchase")} getStatusBadge={getStatusBadge} getTypeLabel={getTypeLabel} />
        </TabsContent>

        <TabsContent value="airtime_purchase" className="space-y-4">
          <TransactionList transactions={filterByType("airtime_purchase")} getStatusBadge={getStatusBadge} getTypeLabel={getTypeLabel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TransactionList({ transactions, getStatusBadge, getTypeLabel }: any) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <History className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No transactions found</p>
              <p className="text-sm text-muted-foreground">Your transactions will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Complete record of all your transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction: any) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover-elevate"
              data-testid={`transaction-${transaction.id}`}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{getTypeLabel(transaction.type)}</span>
                  {getStatusBadge(transaction.status)}
                </div>
                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{transaction.date}</p>
              </div>
              <div className={`text-lg font-bold ${transaction.amount.startsWith("+") ? "text-green-600" : "text-foreground"}`}>
                {transaction.amount.startsWith("+") ? "+" : ""}₦{transaction.amount.replace("+", "").replace("-", "")}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

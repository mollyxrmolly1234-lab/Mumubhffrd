import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Wallet, Smartphone, CreditCard, Users, ArrowUpRight, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  if (!user) {
    setLocation("/login");
    return null;
  }

  // Fetch user data and transactions
  const { data: userData } = useQuery({
    queryKey: ["/api/user", user.id],
    enabled: !!user.id,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/user", user.id, "/transactions"],
    enabled: !!user.id,
  });

  const currentUser = userData || user;
  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {currentUser.username}!</h1>
        <p className="text-muted-foreground">Manage your account and purchase data & airtime</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardDescription>Account Balance</CardDescription>
          <CardTitle className="text-4xl">₦{parseFloat(currentUser.balance || "0").toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Link href="/fund">
            <Button data-testid="button-fund-account">
              <Wallet className="h-4 w-4 mr-2" />
              Fund Account
            </Button>
          </Link>
          <Link href="/data">
            <Button variant="outline" data-testid="button-buy-data">
              <Smartphone className="h-4 w-4 mr-2" />
              Buy Data
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUser.referralCount || 0}/50</div>
            <p className="text-xs text-muted-foreground">
              {50 - (currentUser.referralCount || 0)} more to earn ₦5,000
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{parseFloat(currentUser.referralEarnings || "0").toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Total earned from referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/airtime">
              <Button variant="outline" size="sm" className="w-full" data-testid="button-buy-airtime">
                <CreditCard className="h-3 w-3 mr-2" />
                Buy Airtime
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" data-testid="button-view-all">
                View All
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction: any) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate"
                data-testid={`transaction-${transaction.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium capitalize">{transaction.type.replace("_", " ")}</p>
                    <Badge variant="default" className="text-xs">Completed</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(transaction.createdAt).toLocaleString()}</p>
                </div>
                <div className={`font-semibold ${parseFloat(transaction.amount) > 0 ? "text-green-600" : ""}`}>
                  {parseFloat(transaction.amount) > 0 ? "+" : ""}₦{Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

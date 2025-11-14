import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CheckCircle2, XCircle, Settings, DollarSign, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [paymentSettings, setPaymentSettings] = useState({
    accountNumber: "8121320468",
    bankName: "Moniepoint",
    accountName: "Keno",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - will be replaced with real data from backend in Task 2
  const pendingFunding = [
    { id: "1", username: "user123", amount: "3,000.00", date: "2025-01-15 14:30", phoneNumber: "+2348012345678" },
    { id: "2", username: "jane_doe", amount: "5,000.00", date: "2025-01-15 10:15", phoneNumber: "+2348098765432" },
    { id: "3", username: "john_smith", amount: "2,000.00", date: "2025-01-14 18:45", phoneNumber: "+2348123456789" },
  ];

  const recentActivity = [
    { id: "1", action: "Confirmed funding", user: "user123", amount: "₦3,000", time: "2 hours ago" },
    { id: "2", action: "Updated payment details", user: "admin", amount: "-", time: "5 hours ago" },
    { id: "3", action: "Confirmed funding", user: "jane_doe", amount: "₦5,000", time: "1 day ago" },
  ];

  const handleSaveSettings = () => {
    // Will be connected to backend in Task 2
    console.log("Saving payment settings:", paymentSettings);
    toast({
      title: "Settings Updated",
      description: "Payment details have been updated successfully",
    });
    setIsEditing(false);
  };

  const handleConfirmFunding = (id: string) => {
    // Will be connected to backend in Task 2
    console.log("Confirming funding:", id);
    toast({
      title: "Funding Confirmed",
      description: "User account has been credited",
    });
  };

  const handleRejectFunding = (id: string) => {
    // Will be connected to backend in Task 2
    console.log("Rejecting funding:", id);
    toast({
      title: "Funding Rejected",
      description: "Funding request has been rejected",
      variant: "destructive",
    });
  };

  const handleLogout = () => {
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-md bg-destructive flex items-center justify-center">
              <Shield className="h-6 w-6 text-destructive-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage payments and confirmations</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-admin-logout">
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingFunding.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">150</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="payments" className="w-full">
          <TabsList>
            <TabsTrigger value="payments" data-testid="tab-payments">Payment Settings</TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">Pending Funding</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Account Details</CardTitle>
                    <CardDescription>Update the account details shown to users for funding</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} data-testid="button-edit-settings">
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={paymentSettings.accountNumber}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, accountNumber: e.target.value })}
                    disabled={!isEditing}
                    data-testid="input-account-number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={paymentSettings.bankName}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                    disabled={!isEditing}
                    data-testid="input-bank-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={paymentSettings.accountName}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, accountName: e.target.value })}
                    disabled={!isEditing}
                    data-testid="input-account-name"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSettings} data-testid="button-save-settings">
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Funding Requests</CardTitle>
                <CardDescription>Review and confirm user funding requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingFunding.length === 0 ? (
                  <Alert>
                    <AlertDescription>No pending funding requests</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {pendingFunding.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 rounded-lg border bg-card"
                        data-testid={`funding-request-${request.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{request.username}</span>
                              <Badge variant="secondary">Pending</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{request.phoneNumber}</p>
                            <p className="text-xs text-muted-foreground">{request.date}</p>
                          </div>
                          <div className="text-right space-y-3">
                            <div className="text-xl font-bold text-primary">₦{request.amount}</div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectFunding(request.id)}
                                data-testid={`button-reject-${request.id}`}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleConfirmFunding(request.id)}
                                data-testid={`button-confirm-${request.id}`}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Admin actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      data-testid={`activity-${activity.id}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.user} • {activity.amount}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

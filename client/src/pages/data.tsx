import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Smartphone } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function DataPage() {
  const [selectedBundle, setSelectedBundle] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("+234");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: bundles = [], isLoading } = useQuery({
    queryKey: ["/api/data-bundles"],
  });

  const purchaseMutation = useMutation({
    mutationFn: (data: { bundleId: string; phoneNumber: string }) =>
      apiRequest("POST", "/api/data/purchase", data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Data bundle purchased successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user", user?.id] });
      setIsDialogOpen(false);
      setPhoneNumber("+234");
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleBuyNow = (bundle: any) => {
    setSelectedBundle(bundle);
    setIsDialogOpen(true);
  };

  const handlePurchase = () => {
    if (!selectedBundle || !phoneNumber.match(/^\+234\d{10}$/)) {
      toast({
        title: "Invalid phone number",
        description: "Phone number must be in format +234XXXXXXXXXX",
        variant: "destructive",
      });
      return;
    }
    purchaseMutation.mutate({
      bundleId: selectedBundle.id,
      phoneNumber,
    });
  };

  const groupedBundles = bundles.reduce((acc: any, bundle: any) => {
    const network = bundle.network.toLowerCase();
    if (!acc[network]) acc[network] = [];
    acc[network].push(bundle);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Buy Data</h1>
        <p className="text-muted-foreground">Choose from our affordable data plans</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <Tabs defaultValue="9mobile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="9mobile" data-testid="tab-9mobile">9mobile</TabsTrigger>
            <TabsTrigger value="mtn" data-testid="tab-mtn">MTN</TabsTrigger>
            <TabsTrigger value="glo" data-testid="tab-glo">Glo</TabsTrigger>
            <TabsTrigger value="airtel" data-testid="tab-airtel">Airtel</TabsTrigger>
          </TabsList>

          {Object.entries(groupedBundles).map(([network, networkBundles]: [string, any]) => (
            <TabsContent key={network} value={network} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {networkBundles.map((bundle: any) => (
                <Card key={bundle.id} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="capitalize">{bundle.network}</Badge>
                      <span className="text-xs text-muted-foreground">{bundle.validity}</span>
                    </div>
                    <CardTitle className="text-2xl">{bundle.dataAmount}</CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">₦{bundle.price}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => handleBuyNow(bundle)}
                      data-testid={`button-buy-${bundle.id}`}
                    >
                      Buy Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
        </Tabs>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Data Bundle</DialogTitle>
            <DialogDescription>
              Confirm your purchase details below
            </DialogDescription>
          </DialogHeader>
          {selectedBundle && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="font-medium capitalize">{selectedBundle.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Amount:</span>
                  <span className="font-medium">{selectedBundle.dataAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validity:</span>
                  <span className="font-medium">{selectedBundle.validity}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-bold text-lg text-primary">₦{selectedBundle.price}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+234XXXXXXXXXX"
                  data-testid="input-phone-number"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handlePurchase}
                  data-testid="button-confirm-purchase"
                >
                  Confirm Purchase
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

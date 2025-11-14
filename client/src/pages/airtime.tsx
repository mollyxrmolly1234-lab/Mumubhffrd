import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const airtimeSchema = z.object({
  network: z.string().min(1, "Please select a network"),
  phoneNumber: z.string().regex(/^\+234\d{10}$/, "Phone number must be in format +234XXXXXXXXXX"),
  amount: z.number().min(50, "Minimum airtime amount is ₦50"),
});

type AirtimeForm = z.infer<typeof airtimeSchema>;

const networks = ["MTN", "Glo", "Airtel", "9mobile"];

export default function AirtimePage() {
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AirtimeForm>({
    resolver: zodResolver(airtimeSchema),
    defaultValues: {
      phoneNumber: "+234",
      amount: 0,
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: (data: AirtimeForm) => apiRequest("POST", "/api/airtime/purchase", data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Airtime purchased successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user", user?.id] });
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const selectedNetwork = watch("network");
  const amount = watch("amount");

  const onSubmit = async (data: AirtimeForm) => {
    purchaseMutation.mutate(data);
  };

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Buy Airtime</h1>
        <p className="text-muted-foreground">Top up airtime for any Nigerian network</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Purchase Airtime</CardTitle>
                <CardDescription>Instant delivery to your number</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="network">Network</Label>
                <Select onValueChange={(value) => setValue("network", value)}>
                  <SelectTrigger data-testid="select-network">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network} value={network}>
                        {network}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.network && (
                  <p className="text-sm text-destructive">{errors.network.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  data-testid="input-phone-number"
                  {...register("phoneNumber")}
                  placeholder="+234XXXXXXXXXX"
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  data-testid="input-amount"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="Enter amount"
                  min="50"
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Quick Amounts</Label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant="outline"
                      onClick={() => setValue("amount", quickAmount)}
                      data-testid={`button-quick-${quickAmount}`}
                      className={amount === quickAmount ? "border-primary" : ""}
                    >
                      ₦{quickAmount}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedNetwork && amount >= 50 && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">You will be charged</span>
                    <span className="text-xl font-bold">₦{amount}</span>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-primary/10 border-primary/20">
                  <AlertDescription>Airtime purchased successfully!</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-testid="button-purchase-airtime"
              >
                {isSubmitting ? "Processing..." : "Purchase Airtime"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

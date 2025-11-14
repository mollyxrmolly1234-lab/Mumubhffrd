import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Wallet, Copy, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const fundSchema = z.object({
  amount: z.number().min(1000, "Minimum deposit is ₦1,000"),
});

type FundForm = z.infer<typeof fundSchema>;

export default function FundPage() {
  const { toast } = useToast();
  const [step, setStep] = useState<"input" | "loading" | "details">("input");
  const [paymentDetails, setPaymentDetails] = useState({
    accountNumber: "8121320468",
    bankName: "Moniepoint",
    accountName: "Keno",
  });
  const [requestedAmount, setRequestedAmount] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<FundForm>({
    resolver: zodResolver(fundSchema),
  });

  const onSubmit = async (data: FundForm) => {
    setRequestedAmount(data.amount);
    setStep("loading");

    // Fake loading animation (2-3 seconds)
    setTimeout(() => {
      setStep("details");
    }, 2500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
    });
  };

  const handleConfirmPayment = () => {
    // Will be connected to backend in Task 2
    console.log("Payment confirmed for amount:", requestedAmount);
    toast({
      title: "Payment Confirmation Received",
      description: "Your payment is pending admin confirmation. You'll be notified once confirmed.",
    });
    setStep("input");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fund Account</h1>
        <p className="text-muted-foreground">Top up your wallet balance</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Add Funds</CardTitle>
                <CardDescription>Minimum deposit: ₦1,000</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  data-testid="input-amount"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="Enter amount (minimum ₦1,000)"
                  min="1000"
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  After entering the amount, you'll receive payment details to complete your bank transfer.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full"
                data-testid="button-proceed"
              >
                Proceed to Payment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Loading Dialog */}
      <Dialog open={step === "loading"}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Generating Payment Details...</h3>
              <p className="text-sm text-muted-foreground">Please wait a moment</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog open={step === "details"} onOpenChange={(open) => !open && setStep("input")}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Payment Details</h3>
              <p className="text-sm text-muted-foreground">
                Transfer ₦{requestedAmount.toLocaleString()} to the account below
              </p>
            </div>

            <Card className="bg-muted">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Account Number</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold" data-testid="text-account-number">
                      {paymentDetails.accountNumber}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(paymentDetails.accountNumber)}
                      data-testid="button-copy-account"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Bank Name</div>
                  <div className="font-medium">{paymentDetails.bankName}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Account Name</div>
                  <div className="font-medium">{paymentDetails.accountName}</div>
                </div>
              </CardContent>
            </Card>

            <Alert className="bg-primary/10 border-primary/20">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>
                After making the transfer, click "I've Sent Payment" below. Our admin will confirm your payment shortly.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("input")}
                data-testid="button-cancel-payment"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmPayment}
                data-testid="button-confirm-payment"
              >
                I've Sent Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

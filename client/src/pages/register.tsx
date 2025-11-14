import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smartphone, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  phoneNumber: z.string().regex(/^\+234\d{10}$/, "Phone number must be in format +234XXXXXXXXXX"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"details" | "telegram" | "verify">("details");
  const [error, setError] = useState("");
  const [botStarted, setBotStarted] = useState(false);
  const { login } = useAuth();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phoneNumber: "+234",
      referralCode: new URLSearchParams(window.location.search).get("ref") || "",
    },
  });

  const phoneNumber = watch("phoneNumber");

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError("");
      const response = await apiRequest("POST", "/api/auth/register", data);
      
      if (response.success && response.user) {
        login(response.user);
        setLocation("/dashboard");
      } else {
        setError("Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  const handleRequestOTP = () => {
    const phone = watch("phoneNumber");
    if (!phone || !phone.match(/^\+234\d{10}$/)) {
      setError("Please enter a valid phone number");
      return;
    }
    setStep("telegram");
  };

  const handleVerifyOTP = async () => {
    const phone = watch("phoneNumber");
    try {
      setError("");
      const response = await apiRequest("POST", "/api/auth/request-otp", { phoneNumber: phone });
      
      if (response.success) {
        setBotStarted(true);
        setStep("verify");
      } else {
        setError(response.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Make sure you've started the bot.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">DATA4ME</span>
            </div>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              {step === "details" && "Enter your details to get started"}
              {step === "telegram" && "Verify your phone number with Telegram"}
              {step === "verify" && "Enter the OTP sent to your Telegram"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {step === "details" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      data-testid="input-username"
                      {...register("username")}
                      placeholder="Choose a username"
                    />
                    {errors.username && (
                      <p className="text-sm text-destructive">{errors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      data-testid="input-phone"
                      {...register("phoneNumber")}
                      placeholder="+234XXXXXXXXXX"
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      data-testid="input-password"
                      {...register("password")}
                      placeholder="Minimum 6 characters"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      data-testid="input-confirm-password"
                      {...register("confirmPassword")}
                      placeholder="Re-enter your password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                    <Input
                      id="referralCode"
                      data-testid="input-referral-code"
                      {...register("referralCode")}
                      placeholder="Enter referral code"
                    />
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleRequestOTP}
                    data-testid="button-next"
                  >
                    Next: Verify Phone
                  </Button>
                </>
              )}

              {step === "telegram" && (
                <div className="space-y-4">
                  <Alert>
                    <Send className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> To verify your phone number, you need to start our Telegram bot first.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm">Verification Steps:</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">1.</span>
                        <span>Open Telegram and search for our bot</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">2.</span>
                        <span>Send <code className="bg-background px-1 rounded">/start</code> to the bot</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">3.</span>
                        <span>The bot will send you a 6-digit OTP code</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">4.</span>
                        <span>Enter the code below to verify</span>
                      </li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <Label>Your Phone Number</Label>
                    <div className="text-sm font-medium bg-muted p-3 rounded-md">
                      {phoneNumber}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep("details")}
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={handleVerifyOTP}
                      data-testid="button-started-bot"
                    >
                      I've Started the Bot
                    </Button>
                  </div>
                </div>
              )}

              {step === "verify" && (
                <>
                  {botStarted && (
                    <Alert className="bg-primary/10 border-primary/20">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <AlertDescription>
                        Check your Telegram for the OTP code
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP Code</Label>
                    <Input
                      id="otp"
                      data-testid="input-otp"
                      {...register("otp")}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                    {errors.otp && (
                      <p className="text-sm text-destructive">{errors.otp.message}</p>
                    )}
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep("telegram")}
                      data-testid="button-back-telegram"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                      data-testid="button-verify-register"
                    >
                      {isSubmitting ? "Verifying..." : "Complete Registration"}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login">
                <a className="text-primary hover:underline font-medium" data-testid="link-login">
                  Login
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

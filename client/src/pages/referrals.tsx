import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Copy, Gift, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReferralsPage() {
  const { toast } = useToast();
  
  // Mock data - will be replaced with real data from backend in Task 2
  const referralData = {
    code: "USER123",
    count: 12,
    target: 50,
    earnings: "1,200.00",
    link: `${window.location.origin}/register?ref=USER123`,
  };

  const progress = (referralData.count / referralData.target) * 100;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralData.link);
    toast({
      title: "Link Copied!",
      description: "Share this link with your friends and family",
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralData.code);
    toast({
      title: "Code Copied!",
      description: "Your referral code has been copied",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground">Earn ₦5,000 for every 50 referrals</p>
      </div>

      {/* Progress Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Your Referral Progress</CardTitle>
              <CardDescription>Track your journey to ₦5,000</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-2xl font-bold">{referralData.count} / {referralData.target}</span>
              <Badge variant="secondary">{referralData.target - referralData.count} more to go</Badge>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          <Alert className="bg-primary/10 border-primary/20">
            <Gift className="h-4 w-4 text-primary" />
            <AlertDescription>
              You're {referralData.target - referralData.count} referrals away from earning ₦5,000!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Earnings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Total Earnings</CardTitle>
              <CardDescription>Your referral rewards</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">₦{referralData.earnings}</div>
          <p className="text-sm text-muted-foreground mt-1">
            From {Math.floor(referralData.count / 50)} completed milestones
          </p>
        </CardContent>
      </Card>

      {/* Share Card */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Referral Link</CardTitle>
          <CardDescription>Invite friends and earn rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Referral Link</label>
            <div className="flex gap-2">
              <Input
                value={referralData.link}
                readOnly
                data-testid="input-referral-link"
                className="font-mono text-xs"
              />
              <Button
                onClick={handleCopyLink}
                data-testid="button-copy-link"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Referral Code</label>
            <div className="flex gap-2">
              <Input
                value={referralData.code}
                readOnly
                data-testid="input-referral-code"
                className="font-mono"
              />
              <Button
                variant="outline"
                onClick={handleCopyCode}
                data-testid="button-copy-code"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <span>Share your referral link or code with friends and family</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <span>They sign up using your link or enter your code during registration</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3.</span>
              <span>When you reach 50 referrals, you earn ₦5,000 credited to your account</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">4.</span>
              <span>Keep referring and earning! There's no limit to how much you can earn</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

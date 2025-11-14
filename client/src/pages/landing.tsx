import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Zap, Gift, Shield, Users, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DATA4ME</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" data-testid="button-login">Login</Button>
            </Link>
            <Link href="/register">
              <Button data-testid="button-signup">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <Badge variant="secondary" className="mb-4">Nigeria's Most Affordable Data Provider</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Affordable Data & Airtime for Nigerians
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get the cheapest data bundles and airtime for all Nigerian networks. Instant delivery, secure payments, and earn rewards through referrals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto" data-testid="button-get-started">
                  Get Started
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-view-prices">
                  View Prices
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-semibold">Why Choose DATA4ME?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide the best value, fastest delivery, and most rewarding experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Instant Delivery</CardTitle>
                <CardDescription>
                  Data and airtime delivered to your number instantly after purchase
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Bank transfer with instant confirmation from our admin team
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Referral Rewards</CardTitle>
                <CardDescription>
                  Earn ₦5,000 for every 50 people you refer to our platform
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-16">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-semibold">Top Deals</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Unbeatable prices across all Nigerian networks
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {sampleDeals.map((deal, index) => (
              <Card key={index} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{deal.network}</Badge>
                    <span className="text-xs text-muted-foreground">{deal.validity}</span>
                  </div>
                  <CardTitle className="text-2xl">{deal.data}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-foreground">₦{deal.price}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/register">
                    <Button className="w-full" data-testid={`button-buy-${deal.network.toLowerCase()}`}>
                      Buy Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl">Refer & Earn ₦5,000</CardTitle>
                <CardDescription className="text-base pt-2">
                  Share your unique referral link with friends and family. When 50 people sign up using your link, you earn ₦5,000 credited directly to your account!
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/register">
                  <Button size="lg" data-testid="button-start-earning">
                    Start Earning Today
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">10,000+</div>
              <div className="text-sm text-muted-foreground">Transactions Completed</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">5,000+</div>
              <div className="text-sm text-muted-foreground">Satisfied Customers</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">100%</div>
              <div className="text-sm text-muted-foreground">Instant Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">DATA4ME</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Nigeria's most affordable data and airtime provider
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/register" className="hover:text-foreground">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-foreground">Login</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Networks</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>MTN</li>
                <li>Glo</li>
                <li>Airtel</li>
                <li>9mobile</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 DATA4ME. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const sampleDeals = [
  { network: "9mobile", data: "1GB", validity: "30 days", price: "200" },
  { network: "9mobile", data: "2GB", validity: "30 days", price: "380" },
  { network: "MTN", data: "1GB", validity: "30 days", price: "250" },
  { network: "Glo", data: "2GB", validity: "30 days", price: "400" },
  { network: "Airtel", data: "1.5GB", validity: "30 days", price: "350" },
  { network: "MTN", data: "500MB", validity: "30 days", price: "150" },
];

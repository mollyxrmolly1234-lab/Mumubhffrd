import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    question: "How do I fund my account?",
    answer: "Go to 'Fund Account', enter the amount (minimum ₦1,000), and you'll receive bank account details for transfer. After sending payment, click 'I've Sent Payment' and our admin will confirm it shortly.",
  },
  {
    question: "How long does it take to receive data after purchase?",
    answer: "Data is delivered instantly after purchase! Make sure you have sufficient balance and the correct phone number.",
  },
  {
    question: "What networks do you support?",
    answer: "We support all Nigerian networks: MTN, Glo, Airtel, and 9mobile. 9mobile has the cheapest data bundles!",
  },
  {
    question: "How does the referral program work?",
    answer: "Share your unique referral link with friends. When 50 people sign up using your link, you earn ₦5,000 credited to your account automatically!",
  },
  {
    question: "What's the minimum amount I can deposit?",
    answer: "The minimum deposit amount is ₦1,000. This ensures efficient processing of transactions.",
  },
  {
    question: "Can I buy data for someone else?",
    answer: "Yes! When purchasing data or airtime, you can enter any valid Nigerian phone number.",
  },
  {
    question: "How do I verify my phone number?",
    answer: "During registration, you'll need to start our Telegram bot and enter the OTP code sent to you. This ensures account security and prevents spam.",
  },
  {
    question: "What if my data doesn't arrive?",
    answer: "Data is usually instant. If you don't receive it within 5 minutes, check your transaction history and contact us through this chat widget with your transaction ID.",
  },
];

export function CustomerService() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  return (
    <>
      {/* Floating Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        onClick={() => setIsOpen(true)}
        data-testid="button-customer-service"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* FAQ Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Customer Support
            </DialogTitle>
            <DialogDescription>
              Find answers to frequently asked questions
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <Card
                  key={index}
                  className="hover-elevate cursor-pointer"
                  onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
                  data-testid={`faq-${index}`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-start justify-between gap-2">
                      <span>{faq.question}</span>
                      {selectedFaq === index && (
                        <Badge variant="secondary" className="shrink-0">Open</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  {selectedFaq === index && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Still need help? Contact us at{" "}
              <a href="mailto:support@data4me.com" className="text-primary hover:underline">
                support@data4me.com
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

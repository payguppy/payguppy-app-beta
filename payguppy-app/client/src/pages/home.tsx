import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Shield, Globe } from 'lucide-react';
import { Link } from 'wouter';

export default function Home() {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-primary-foreground px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="w-48 h-32 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm shadow-2xl flex items-center justify-center">
              <QrCode className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Pay with Crypto,<br />Anywhere</h1>
          <p className="text-xl opacity-90 mb-8">Seamless cryptocurrency payments for merchants and customers worldwide</p>
          <Link href="/scanner">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold shadow-lg">
              Start Paying
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why PayGuppy?</h2>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">QR Code Payments</h3>
                <p className="text-muted-foreground">Scan and pay instantly with any cryptocurrency wallet</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Fast</h3>
                <p className="text-muted-foreground">Bank-level security with lightning-fast transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
                <p className="text-muted-foreground">Accept payments from customers worldwide, 24/7</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 bg-muted/50">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <details>
                  <summary className="font-semibold cursor-pointer">How do I start accepting payments?</summary>
                  <p className="text-muted-foreground mt-3">Simply create a merchant account, set up your payment channels, and start generating QR codes for your customers.</p>
                </details>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <details>
                  <summary className="font-semibold cursor-pointer">Which cryptocurrencies are supported?</summary>
                  <p className="text-muted-foreground mt-3">We support major cryptocurrencies including Bitcoin, Ethereum, USDT, USDC, and many others across multiple blockchains.</p>
                </details>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <details>
                  <summary className="font-semibold cursor-pointer">Are there any fees?</summary>
                  <p className="text-muted-foreground mt-3">We charge competitive transaction fees starting from 1%. No setup fees or monthly subscriptions required.</p>
                </details>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

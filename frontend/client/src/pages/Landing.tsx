import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <div className="text-primary text-6xl mb-4">▲</div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            REACTIVEPOWBRIDGE
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            CROSS-CHAIN BRIDGE PROTOCOL WITH MARKET MAKER CAPABILITIES
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/bridge">
              <Button size="lg" className="gap-2 min-w-[200px]" data-testid="button-launch-app">
                LAUNCH APP
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 min-w-[200px]"
              onClick={() => window.open("https://reactive.network", "_blank")}
              data-testid="button-learn-more"
            >
              LEARN MORE
            </Button>
          </div>

          <div className="pt-12">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
              PROTOCOL STATS
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold font-mono mb-1">$1.2M</div>
                <div className="text-xs text-muted-foreground uppercase">VOLUME</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-mono mb-1">234</div>
                <div className="text-xs text-muted-foreground uppercase">ORDERS</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-mono mb-1">12</div>
                <div className="text-xs text-muted-foreground uppercase">MARKET MAKERS</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-mono mb-1">2</div>
                <div className="text-xs text-muted-foreground uppercase">CHAINS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              PROTOCOL FEATURES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/20 text-primary mb-6">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 uppercase tracking-wide">
                CROSS-CHAIN BRIDGE
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Place orders on one chain and have them filled on another with event-driven reactive architecture
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-status-filled/20 text-status-filled mb-6">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 uppercase tracking-wide">
                MARKET MAKER NETWORK
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Liquidity providers earn configurable premiums for filling orders with competitive pricing
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-status-pending/20 text-status-pending mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 uppercase tracking-wide">
                ANTI-MEV PROTECTION
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Sophisticated cross-chain cancellation system prevents sandwich attacks during operations
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            START BRIDGING
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect your wallet and place your first cross-chain order in seconds
          </p>
          <Link href="/bridge">
            <Button size="lg" className="gap-2 min-w-[200px]" data-testid="button-get-started">
              GET STARTED
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-12 px-4 md:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">▲</span>
            <span className="font-bold">REACTIVEPOWBRIDGE</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">DOCS</a>
            <a href="#" className="hover:text-foreground transition-colors">GITHUB</a>
            <a href="#" className="hover:text-foreground transition-colors">DISCORD</a>
            <a href="#" className="hover:text-foreground transition-colors">TWITTER</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

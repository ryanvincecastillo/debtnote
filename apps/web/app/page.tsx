import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ToneShowcase } from "@/components/landing/tone-showcase";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <ToneShowcase />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <LandingFooter />
    </div>
  );
}

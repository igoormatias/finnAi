import { LandingBenefits } from "@/features/landing/components/landing-benefits";
import { LandingCta } from "@/features/landing/components/landing-cta";
import { LandingFeatures } from "@/features/landing/components/landing-features";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { LandingScoreSection } from "@/features/landing/components/landing-score-section";

export function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingBenefits />
        <LandingScoreSection />
        <LandingFeatures />
        <LandingCta />
      </main>
      <LandingFooter />
    </>
  );
}

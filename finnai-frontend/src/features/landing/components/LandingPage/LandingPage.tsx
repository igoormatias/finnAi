import { LandingBenefits } from "@/features/landing";
import { LandingCta } from "@/features/landing";
import { LandingFeatures } from "@/features/landing";
import { LandingFooter } from "@/features/landing";
import { LandingHero } from "@/features/landing";
import { LandingNavbar } from "@/features/landing";
import { LandingScoreSection } from "@/features/landing";

export const LandingPage = () => {
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

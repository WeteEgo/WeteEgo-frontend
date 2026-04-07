"use client";

/**
 * Marketing landing: hero → protocol → why → corridors → how → developers → trust+roadmap → CTA.
 * Lenis + ScrollTrigger live in MarketingShell (marketing layout only).
 */
import { HeroSection } from "./HeroSection";
import { ProtocolStackSection } from "./ProtocolStackSection";
import { WhyWeteEgoSection } from "./WhyWeteEgoSection";
import { CorridorsSection } from "./CorridorsSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { DeveloperSection } from "./DeveloperSection";
import { TrustSection } from "./TrustSection";
import { LandingFooterCTA } from "./LandingFooterCTA";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProtocolStackSection />
      <WhyWeteEgoSection />
      <CorridorsSection />
      <HowItWorksSection />
      <DeveloperSection />
      <TrustSection />
      <LandingFooterCTA />
    </>
  );
}

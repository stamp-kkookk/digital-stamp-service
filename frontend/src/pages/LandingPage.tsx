/**
 * LandingPage
 * 꾸욱(KKOOKK) 서비스 랜딩 페이지
 * 소상공인(사장님) 타겟 - 회원가입 및 서비스 도입 유도
 */

import {
  FAQSection,
  FooterSection,
  GuaranteeSection,
  HeroSection,
  ProblemSection,
  ReviewSection,
  SolvingSection,
} from "@/features/landing/components";
import { LandingHeader } from "@/features/landing/components/LandingHeader";
import { ScrollIndicator } from "@/features/landing/components/ScrollIndicator";
import { FloatingConsultButton } from "@/features/landing/components/FloatingConsultButton";
import { ScrollToTop } from "@/components/shared/ScrollToTop";

export function LandingPage() {
  return (
    <>
      <ScrollToTop />
      <div className="relative min-h-screen bg-white isolate">
        {/* Header */}
        <LandingHeader />

        {/* Floating Scroll Indicator */}
        <ScrollIndicator />

        {/* Floating Consult Button */}
        <FloatingConsultButton />

        {/* Main Content - Scroll Snap Container (스크롤바 숨김) */}
        <main className="snap-y snap-proximity overflow-y-auto h-screen [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <HeroSection />
          <ProblemSection />
          <SolvingSection />
          <GuaranteeSection />
          <ReviewSection />
          <FAQSection />
          {/* Footer - Inside snap container for smooth scrolling */}
          <FooterSection />
        </main>
      </div>
    </>
  );
}

export default LandingPage;

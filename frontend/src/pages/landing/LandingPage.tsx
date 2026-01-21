import HeroSection from "./components/HeroSection";
import CustomizationSection from "./components/CustomizationSection";
import {
  ProblemSection,
  SolutionSection,
  CustomerSection,
} from "./components/ProblemSolutionSection";
import FooterSection from "./components/FooterSection";

export default function LandingPage() {
  return (
    <main className="h-screen snap-y snap-mandatory overflow-y-auto scroll-smooth">
      {/* Section 1: Hero - 독창적인 스탬프 전시 */}
      <HeroSection />

      {/* Section 2: Customization - 나만의 스탬프 시뮬레이션 */}
      <CustomizationSection />

      {/* Section 3: Problem - 종이 쿠폰의 문제점 */}
      <ProblemSection />

      {/* Section 4: Solution - 꾸욱의 해결책 */}
      <SolutionSection />

      {/* Section 5: Customer - 사용자 관점 */}
      <CustomerSection />

      {/* Section 6: Footer - CTA & 정보 */}
      <FooterSection />
    </main>
  );
}

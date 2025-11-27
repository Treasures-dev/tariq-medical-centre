import HeroSection from "./components/UI/Hero";
import { MarqueeDemo } from "./components/UI/Reviews";

import TeamCarousel from "./components/UI/OurTeam";
import OrganogramWithData from "./components/UI/Organogram";
import ServiceCarusel from "./components/UI/ServiceCarusel";

import ServiceSection from "./components/UI/Grid";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ServiceSection />

      <ServiceCarusel />
      <TeamCarousel />

      <OrganogramWithData />
      <MarqueeDemo />
    </div>
  );
}

import HeroSection from "./components/UI/Hero";
import { MarqueeDemo } from "./components/UI/Reviews";
import TeamCarousel from "./components/UI/OurTeam";
import OrganogramWithData from "./components/UI/Organogram";
import ServiceCarusel from "./components/UI/ServiceCarusel";
import ServiceSection from "./components/UI/Grid";


export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      
      {/* HERO */}
      <section aria-label="Hero Section">
        <HeroSection />
      </section>

      {/* SERVICES GRID */}
      <section aria-labelledby="services">
        <header>
          <h2 className="hidden" id="services">
            Our Medical Services
          </h2>
        </header>

        <article>
          <ServiceSection />
        </article>
      </section>

      {/* PREMIUM SERVICES CAROUSEL */}
      <section aria-labelledby="featured-services">
        <header>
          <h2 className="hidden" id="featured-services">
            Featured Services
          </h2>
        </header>

        <article>
          <ServiceCarusel />
        </article>
      </section>

      {/* OUR DOCTORS */}
      <section aria-labelledby="team">
        <header>
          <h2 className="hidden" id="team">
            Meet Our Expert Doctors
          </h2>
        </header>

        <article>
          <TeamCarousel />
        </article>
      </section>

      {/* ORGANOGRAM */}
      <section aria-labelledby="organogram">
        <header>
          <h2 className="hidden" id="organogram">
            Clinic Organogram
          </h2>
        </header>

        <article>
          <OrganogramWithData />
        </article>
      </section>

      {/* REVIEWS */}
      <section aria-labelledby="reviews">
        <header>
          <h2 className="hidden"  id="reviews">
            What Our Patients Say
          </h2> 
        </header>

        <article>
          <MarqueeDemo />
        </article>
      </section>

    </main>
  );
}

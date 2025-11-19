
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import AboutHero from "@/components/about/about-hero";
import AboutStory from "@/components/about/about-story";
import AboutMission from "@/components/about/about-mission";
import AboutTeam from "@/components/about/about-team";

export const metadata = {
  title: "About CDM Suite - Digital Marketing Agency",
  description: "Learn about CDM Suite's mission, values, and team. Founded in 2015, we're a digital marketing agency that helps businesses get real, measurable results.",
};

export default function AboutPage() {
  return (
    <main>
      <Navigation />
      <AboutHero />
      <AboutStory />
      <AboutMission />
      <AboutTeam />
      <Footer />
    </main>
  );
}

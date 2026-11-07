import Hero from "@/components/landingpage/Hero"
import Navbar from "@/components/layout/Navbar"
import Features from "@/components/landingpage/Features" 
import HowItWorks from "@/components/landingpage/HowItWorks" 
import Subscription_Plans from "@/components/landingpage/Subscription_Plans"

function page() {
  return (
    <>
    <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Subscription_Plans />
    </>
  )
}

export default page
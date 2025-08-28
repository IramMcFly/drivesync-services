"use client";

import { useState, useEffect } from 'react';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import WhyChooseSection from './WhyChooseSection';
import HowItWorksSection from './HowItWorksSection';
import CTASection from './CTASection';
import ContactSection from './ContactSection';
import FooterSection from './FooterSection';
import Navbar from './Navbar';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar isScrolled={isScrolled} />
      <HeroSection />
      <ServicesSection />
      <WhyChooseSection />
      <HowItWorksSection />
      <CTASection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}

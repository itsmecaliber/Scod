import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Testimonial from "@/components/Testimonial";

const LandingPage = () => {
  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full border-b bg-black py-1 z-50">
        <nav className="py-1 flex justify-between items-center px-5">
          <Link to="/">
            <img src="/te-logo.png" className="h-9" alt="Logo" />
          </Link>
          <Link to="/signin">
            <Button className="h-8 px-5 text-sm">Login</Button>
          </Link>
        </nav>
      </header>

      {/* Section 1: Hero with Text & Grid Background */}
      <section className="relative h-screen bg-black flex items-center justify-center overflow-hidden px-6 md:px-16 pt-20 md:pt-24">
        {/* Grid Overlay */}
        <div className="grid-background" />

        {/* Text Content */}
        <div className="space-y-6 text-center max-w-[1190px] z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold gradient-title leading-tight">
            <div className="whitespace-nowrap">The Ultimate Social Platform</div>
            <div className="font-bold">Built for Gamers</div>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Network with top teams, showcase your skills, and grab new opportunities—all in one platform.
          </p>
          <br />
          <br />
          <Link to="/signup">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Section 2: Laptop Video with Text */}
      <section className="w-full h-screen bg-black flex items-center justify-center px-6 md:px-16">
        <div className="flex flex-col md:flex-row items-center justify-center w-full h-full gap-10">
          {/* Video on the left */}
          <div className="flex-shrink-0 max-w-[60%] md:max-w-[50%]">
            <video
              src="/laptop_final.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto object-contain pointer-events-none"
            />
          </div>

          {/* Text on the right */}
          <div className="text-white max-w-md text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Showcase Your Gameplay</h2>
            <p className="text-lg text-muted-foreground">
              Whether you're a streamer or a competitive player, share your highlights, connect with fans, and elevate your presence in the gaming world.
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <div className="relative bg-black py-20 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/50 via-black to-transparent"></div>
        </div>

        {/* Content container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Title section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Loved by thousands of players
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Here's what our community says about the platform
            </p>
          </div>
          {/* Testimonials with dual fade effect */}
          <div className="relative h-[600px]">
            {/* Fade in effect at top - makes testimonials emerge from darkness */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black via-black/90 to-transparent z-10 pointer-events-none"></div>

            {/* Fade out effect at bottom - makes testimonials dissolve into darkness */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black via-black/95 to-transparent z-10 pointer-events-none"></div>

            {/* Testimonials component with adjusted padding */}
            <div className="relative z-0 h-full pt-8 pb-16">
              <Testimonial />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
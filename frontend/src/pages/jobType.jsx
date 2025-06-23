import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const JobType = () => {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 overflow-hidden">
      
      {/* Background Gaming Image */}
      {/* <img
        src="/images/bg-controller.png" // use your own path
        alt="gaming controller"
        className="absolute opacity-10 w-[700px] sm:w-[900px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
      /> */}

      {/* Overlay Filter */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-900/50 to-black/80 pointer-events-none"></div>
        
      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 z-10 text-center">
        Choose Your Path
      </h1>
      <p className="text-gray-400 text-lg mb-10 z-10 text-center max-w-md">
        Whether you’re recruiting for glory or hunting your next team – step into the arena.
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-6 w-full max-w-sm z-10">
        <Link to="/jobs">
          <Button className="w-full py-6 text-xl font-semibold bg-white text-black hover:bg-gray-200 transition-all duration-300 rounded-2xl shadow-xl">
            You Are An Organization
          </Button>
        </Link>
        <Link to="/my-jobs">
          <Button className="w-full py-6 text-xl font-semibold bg-white text-black hover:bg-gray-200 transition-all duration-300 rounded-2xl shadow-xl">
            You Are A Player
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default JobType;

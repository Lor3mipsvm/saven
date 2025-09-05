"use client";

import { Button } from "@saven/ui";
import { Card } from "@saven/ui";
import { Badge } from "@saven/ui";
import { Separator } from "@saven/ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@saven/ui";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@saven/ui";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentCrypto, setCurrentCrypto] = useState(0);
  const cryptos = ['BTC', 'ETH', 'USD'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCrypto((prev) => (prev + 1) % cryptos.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <div className="relative h-screen w-full overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          >
            <source src="/ocean.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 animate-gradient" />
          </video>
          {/* Professional overlay for better text readability */}
          <div className="absolute inset-0 bg-slate-900/80" />
        </div>

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-slate-100">
              saven
            </div>
            <Badge variant="secondary" className="bg-slate-800/20 text-slate-100 border-slate-700/30">
              Beta
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="bg-slate-800/20 border-slate-700/30 text-slate-100 hover:bg-slate-800/30">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-slate-800/20 backdrop-blur-xl border-slate-700/30">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col space-y-6 mt-8">
                  <a href="#" className="text-slate-100 hover:text-slate-300 transition-colors text-lg">
                    Home
                  </a>
                  <a href="#" className="text-slate-100 hover:text-slate-300 transition-colors text-lg">
                    About
                  </a>
                  <a href="#" className="text-slate-100 hover:text-slate-300 transition-colors text-lg">
                    Services
                  </a>
                  <a href="#" className="text-slate-100 hover:text-slate-300 transition-colors text-lg">
                    Contact
                  </a>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="outline" className="bg-slate-800/20 border-slate-700/30 text-slate-100 hover:bg-slate-800/30" asChild>
              <a href="http://app.localhost:3000">Open App</a>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 flex flex-col items-start justify-start h-full px-6 pt-20">
          <div className="max-w-xl w-full pl-16">
            {/* Hero Container */}
            <Card className="bg-slate-800/10 backdrop-blur-xs border-slate-700/20 mb-12">
              <div className="text-left px-6 py-6">
                <h1 className="text-5xl font-bold text-slate-100 mb-12">
                  Save in{" "}
                  <span className="text-5xl font-black transition-all duration-500 ease-in-out text-amber-400">
                    {cryptos[currentCrypto]}
                  </span>
                </h1>
                <h2 className="text-5xl font-bold text-slate-100">
                  Win up to{" "}
                  <span className="text-5xl font-black text-amber-400">
                    $233,152
                  </span>
                </h2>
              </div>
            </Card>
          </div>

          {/* Subtitle */}
          <div className="max-w-4xl pl-16">
            <Card className="bg-slate-800/15 border-slate-700/20 mb-8 hover:backdrop-blur-sm transition-all duration-300">
              <div className="text-left px-6 py-4">
                <p className="text-xl text-slate-200 mb-1 font-bold">
                  Keep exposure to your asset. Trade-off yield for a chance to win prizes.
                  <br />
                  Prizes are funded by pooled yield, generated via curated strategies.
                  <br />
                  <br />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help hover:text-slate-300 transition-colors">Savings are not at risk.</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 text-slate-100 max-w-sm p-4 shadow-2xl rounded-xl z-[9999]">
                      <p className="text-sm leading-relaxed">
                        Savings are not redistributed as prizes, but inherit strategy-specific risks. Refer to the curator for further information.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </p>
              </div>
            </Card>
          </div>

          {/* CTA Button */}
          <div className="pl-24">
            <Button size="lg" className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white px-16 py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-amber-500/30">
              DEPOSIT
            </Button>
          </div>
        </main>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 z-10 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-slate-100">
            <div className="text-sm text-slate-300 mb-4 md:mb-0">
              © 2025 saven. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-slate-300 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-slate-300 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-slate-300 transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}


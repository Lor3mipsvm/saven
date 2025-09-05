"use client";

import { Button } from "@saven/ui";
import { Badge } from "@saven/ui";
import { Progress } from "@saven/ui";
import { useState, useEffect } from "react";
import { usePrivy, useWallets } from '@privy-io/react-auth';

export default function AppPage() {
  const [timeToDraw, setTimeToDraw] = useState(23); // hours

  // Privy hooks with error handling
  let ready = false;
  let authenticated = false;
  let user = null;
  let login = () => { };
  let logout = () => { };
  let wallets: any[] = [];

  try {
    const privyData = usePrivy();
    const walletData = useWallets();
    ready = privyData.ready;
    authenticated = privyData.authenticated;
    user = privyData.user;
    login = privyData.login;
    logout = privyData.logout;
    wallets = walletData.wallets;
  } catch (error) {
    console.warn('Privy hooks not available:', error);
  }

  // User's actual saved assets (not rotating)
  const userAssets = ['ETH', 'BTC']; // Example: user has deposits in both ETH and BTC

  // Activity feed data for ticker
  const activityItems = [
    { type: 'deposit', message: 'Deposit received: +$500 in ETH', time: '2 hours ago', color: 'amber' },
    { type: 'yield', message: 'Yield earned: +$23.45 from BTC strategy', time: '4 hours ago', color: 'green' },
    { type: 'tier', message: 'Tier upgrade: Promoted to Silver tier', time: '1 day ago', color: 'blue' },
    { type: 'deposit', message: 'Deposit received: +$1,200 in BTC', time: '2 days ago', color: 'amber' },
    { type: 'yield', message: 'Yield earned: +$15.67 from ETH strategy', time: '3 days ago', color: 'green' },
    { type: 'card', message: 'Card pack opened: Received 3 new cards', time: '1 week ago', color: 'purple' },
  ];

  const handleConnectWallet = () => {
    if (authenticated) {
      logout();
    } else {
      login();
    }
  };

  // Get wallet address from connected wallet
  const walletAddress = wallets[0]?.address ?
    `${wallets[0].address.slice(0, 6)}...${wallets[0].address.slice(-4)}` : '';

  return (
    <div className="relative min-h-screen p-6 overflow-y-auto">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/ocean.mp4" type="video/mp4" />
        </video>
        {/* Subtle light overlay with blur */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-2xl font-bold text-slate-800">saven</div>
          <div className="flex items-center space-x-4">
            {authenticated && walletAddress && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-slate-700 text-sm font-medium">
                  {walletAddress}
                </span>
              </div>
            )}
            <Button
              variant="outline"
              className="bg-white/80 border-slate-300 text-slate-700 hover:bg-white/90"
              onClick={handleConnectWallet}
              disabled={!ready}
            >
              {!ready ? 'Loading...' : authenticated ? 'Disconnect' : 'Connect Wallet'}
            </Button>
          </div>
        </div>

        {/* Activity Ticker */}
        <div className="mb-6 bg-slate-900/90 backdrop-blur-sm rounded-lg overflow-hidden">
          <div className="flex items-center py-3 px-4">
            <div className="flex items-center space-x-2 mr-6">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-white font-semibold text-sm">LIVE ACTIVITY</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex space-x-8 animate-scroll">
                {[...activityItems, ...activityItems].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 whitespace-nowrap">
                    <div className={`w-2 h-2 rounded-full bg-${item.color}-500`}></div>
                    <span className="text-white text-sm font-medium">{item.message}</span>
                    <span className="text-slate-400 text-xs">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout with Left Sidebar */}
        <div className="flex gap-6 min-h-[calc(100vh-180px)] pb-6">
          {/* Left Sidebar - User Progression */}
          <div className="w-80 flex-shrink-0">
            <div className="space-y-6">
              {/* User Profile Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-slate-200/50">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">saven_user</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                      <span className="text-slate-600 text-sm font-medium">Silver</span>
                    </div>
                  </div>
                </div>

                {/* REP Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-700 font-medium text-sm">EXP</span>
                    <span className="text-slate-600 text-sm">1,250 / 2,000</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full" style={{ width: '62.5%' }}></div>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Next level EXP</p>
                </div>

                {/* Skill Rating */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-medium text-sm">SAVING STREAK</span>
                    <span className="text-slate-800 font-bold">28 days</span>
                  </div>
                </div>

                {/* Portfolio Value */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-medium text-sm">PORTFOLIO VALUE</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-800 font-bold">$12,450</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Objectives Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-slate-200/50">
                <h3 className="text-lg font-bold text-slate-800 mb-4">OBJECTIVES</h3>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-700 font-medium text-sm">Starter Objectives</span>
                    <span className="text-slate-600 text-sm">3/10 Complete</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                {/* Individual Objectives */}
                <div className="space-y-4">
                  {/* Objective 1 */}
                  <div className="p-3 bg-slate-50/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-slate-800 font-medium text-sm">"First Deposit"</h4>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-slate-600">100</span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs mb-2">Make your first deposit of $100+</p>
                    <div className="w-full bg-slate-200 rounded-full h-1">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-1 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  {/* Objective 2 */}
                  <div className="p-3 bg-slate-50/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-slate-800 font-medium text-sm">"Yield Hunter"</h4>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-slate-600">250</span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs mb-2">Earn $50+ in yield rewards</p>
                    <div className="w-full bg-slate-200 rounded-full h-1">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-1 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  {/* Objective 3 */}
                  <div className="p-3 bg-slate-50/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-slate-800 font-medium text-sm">"Diversified"</h4>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                        <span className="text-xs text-slate-600">500</span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs mb-2">Hold assets in 3+ different categories</p>
                    <div className="w-full bg-slate-200 rounded-full h-1">
                      <div className="bg-gradient-to-r from-slate-400 to-slate-500 h-1 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - 2x2 Grid */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            {/* Column 1, Row 1: Savings Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-slate-200/50">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-4">
                    You saved{" "}
                    <span className="text-3xl font-black text-amber-600">
                      $12,450
                    </span>{" "}
                    in{" "}
                    <span className="text-3xl font-black text-amber-600">
                      {userAssets.length === 1
                        ? userAssets[0]
                        : userAssets.join(' and ')
                      }
                    </span>
                  </h1>
                  <Button size="lg" className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white px-12 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-amber-500/30">
                    DEPOSIT
                  </Button>
                </div>
              </div>
            </div>

            {/* Column 2, Row 1: Saver Ranks */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-slate-200/50">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Saver Ranks</h2>
                  <Badge variant="secondary" className="bg-slate-200/80 text-slate-700 border-slate-300/50">
                    Silver Tier
                  </Badge>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  {/* Rank Tiers - Horizontal Progression */}
                  <div className="flex items-center justify-between relative">
                    {/* Bronze Tier */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-amber-600/20 border-2 border-amber-600 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-amber-600"></div>
                      </div>
                      <div className="text-center">
                        <div className="text-amber-700 font-bold text-sm">Bronze</div>
                        <div className="text-slate-500 text-xs">$0 - $1K</div>
                      </div>
                    </div>

                    {/* Arrow 1 */}
                    <div className="flex-1 flex items-center justify-center relative">
                      <div className="h-0.5 w-full bg-gradient-to-r from-amber-600 to-amber-500"></div>
                      <div className="absolute right-0 w-0 h-0 border-l-4 border-l-amber-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                    </div>

                    {/* Silver Tier (Current) */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-amber-500/30 border-2 border-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <div className="w-6 h-6 rounded-full bg-amber-500"></div>
                      </div>
                      <div className="text-center">
                        <div className="text-amber-600 font-bold text-sm">Silver</div>
                        <div className="text-amber-500 text-xs">$1K - $10K</div>
                      </div>
                    </div>

                    {/* Arrow 2 */}
                    <div className="flex-1 flex items-center justify-center relative">
                      <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 to-yellow-500"></div>
                      <div className="absolute right-0 w-0 h-0 border-l-4 border-l-yellow-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                    </div>

                    {/* Gold Tier */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
                      </div>
                      <div className="text-center">
                        <div className="text-yellow-600 font-bold text-sm">Gold</div>
                        <div className="text-slate-500 text-xs">$10K+</div>
                      </div>
                    </div>
                  </div>

                  {/* Saving Streak */}
                  <div className="mt-6 p-4 rounded-lg bg-slate-100/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-700 font-medium">Saving Streak</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-600 font-bold text-lg">47</span>
                        <span className="text-slate-600 text-sm">days</span>
                      </div>
                    </div>
                    {/* <Progress value={75} className="h-3 bg-slate-200/50" /> */}
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>0 days</span>
                      <span>60 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 1, Row 2: Win Chance & Next Draw */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-slate-200/50">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">
                    You have a 1 in{" "}
                    <span className="text-3xl font-black text-amber-600">2,847</span>{" "}
                    chance to win{" "}
                    <span className="text-3xl font-black text-amber-600">$233,152</span>
                  </h2>
                </div>
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-amber-500/30 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-slate-700 font-bold text-lg">Next draw</div>
                        <div className="text-amber-600 font-black text-2xl">{timeToDraw}h</div>
                      </div>
                    </div>
                    <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2, Row 2: Card Packs */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-slate-200/50">
              <div className="h-full flex flex-col">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Card Packs</h2>
                <div className="flex-1 flex items-end justify-center space-x-2">
                  {/* Stacked card packs */}
                  <div className="relative">
                    <div className="w-16 h-20 bg-gradient-to-b from-amber-500 to-amber-600 rounded-lg shadow-lg transform rotate-3"></div>
                    <div className="absolute top-0 left-0 w-16 h-20 bg-gradient-to-b from-amber-500 to-amber-600 rounded-lg shadow-lg transform rotate-1"></div>
                    <div className="absolute top-0 left-0 w-16 h-20 bg-gradient-to-b from-amber-500 to-amber-600 rounded-lg shadow-lg"></div>
                  </div>
                  <div className="relative">
                    <div className="w-16 h-20 bg-gradient-to-b from-slate-500 to-slate-600 rounded-lg shadow-lg transform -rotate-2"></div>
                    <div className="absolute top-0 left-0 w-16 h-20 bg-gradient-to-b from-slate-500 to-slate-600 rounded-lg shadow-lg transform -rotate-1"></div>
                  </div>
                  <div className="w-16 h-20 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-lg shadow-lg transform rotate-2"></div>
                </div>
              </div>
            </div>

            {/* Column 1, Row 3: Asset Allocations Pie Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-slate-200/50">
              <div className="h-full flex flex-col">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Asset Allocations</h2>
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Pie Chart - Using CSS to create segments */}
                    <div className="absolute inset-0 rounded-full border-8 border-slate-200"></div>

                    {/* ETH Segment - 60% */}
                    <div className="absolute inset-0 rounded-full border-8 border-amber-500"
                      style={{
                        background: `conic-gradient(from 0deg, #f59e0b 0deg 216deg, transparent 216deg)`
                      }}>
                    </div>

                    {/* BTC Segment - 30% */}
                    <div className="absolute inset-0 rounded-full border-8 border-transparent"
                      style={{
                        background: `conic-gradient(from 216deg, #374151 216deg 324deg, transparent 324deg)`
                      }}>
                    </div>

                    {/* USD Segment - 10% */}
                    <div className="absolute inset-0 rounded-full border-8 border-transparent"
                      style={{
                        background: `conic-gradient(from 324deg, #6b7280 324deg 360deg, transparent 360deg)`
                      }}>
                    </div>

                    {/* Center content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-slate-700 font-bold text-lg">Total</div>
                        <div className="text-amber-600 font-black text-2xl">$12,450</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                    <span className="text-slate-700 font-medium">ETH - 60% ($7,470)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-slate-600"></div>
                    <span className="text-slate-700 font-medium">BTC - 30% ($3,735)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-slate-400"></div>
                    <span className="text-slate-700 font-medium">USD - 10% ($1,245)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
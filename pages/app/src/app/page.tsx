"use client";

import { Button } from "@saven/ui";
import { Badge } from "@saven/ui";
import { Progress } from "@saven/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@saven/ui";
import React, { useState, useEffect } from "react";
import { useDynamicContext, DynamicWidget, DynamicConnectButton, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { VaultList } from '@/components/VaultList';
import { useVault, useAllUserVaultBalances } from '@generationsoftware/hyperstructure-react-hooks'
import { useVaults } from '@/providers/VaultsProvider';
import { DepositModal } from '@/components/DepositModal';
import { useAtom } from 'jotai';
import { depositModalOpenAtom } from '@/lib/atoms/depositAtoms';


export default function AppPage() {
  const [timeToDraw, setTimeToDraw] = useState(0); // hours - will be calculated from real data
  const [selectedExposureAsset, setSelectedExposureAsset] = useState<string>('ETH');

  // Dynamic wallet integration
  const dynamicContext = useDynamicContext()
  const primaryWallet = dynamicContext?.primaryWallet || null
  const walletAddress = primaryWallet?.address || null
  const isLoggedIn = useIsLoggedIn()

  // Deposit modal state
  const [isDepositModalOpen, setIsDepositModalOpen] = useAtom(depositModalOpenAtom)


  // Dynamic components handle wallet connection automatically

  // User's actual saved assets (not rotating) - will be populated from real vault data
  const userAssets: string[] = [] // Will be populated from connected vaults

  // Activity feed data for ticker - will be populated from real transaction data
  const activityItems: any[] = [
    { message: "Bob won $1.2k prize", time: "5m", color: "amber" },
    { message: "Charlie earned 8.5% APR", time: "7m", color: "blue" },
    { message: "Diana claimed $340", time: "12m", color: "purple" },
    { message: "Frank won $890 prize", time: "18m", color: "amber" },
    { message: "Grace earned 12.1% APR", time: "22m", color: "blue" },
    { message: "Ivy won $1.6k prize", time: "28m", color: "amber" },
    { message: "Jack claimed $520", time: "32m", color: "purple" }
  ]

  // Exposure asset options with yield sources, curators, and strategy info
  const exposureAssets = {
    'ETH': {
      yieldSource: 'Morpho',
      curator: 'Saven Foundation',
      strategies: ['Lending', 'Delta-neutral'],
      vaultAddress: '0x4200000000000000000000000000000000000006', // WETH vault address on Base
      appURI: 'https://app.morpho.org/vault?vault=0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1&network=base'
    },
    'BTC': {
      yieldSource: 'Aave',
      curator: 'Saven Foundation',
      strategies: ['Lending'],
      vaultAddress: '0x2Ae3F1Ec7F1F5012AFE8311057F5aDf5A2f5D97', // WBTC vault address on Base
      appURI: 'https://app.aave.com/reserve-overview/?underlyingAsset=0x2Ae3F1Ec7F1F5012AFE8311057F5aDf5A2f5D97&marketName=proto_base_v3'
    },
    'USD': {
      yieldSource: 'Moonwell',
      curator: 'Saven Foundation',
      strategies: ['Lending', 'Delta-neutral'],
      vaultAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC vault address on Base
      appURI: 'https://moonwell.fi/markets/supply/base/usdc'
    }
  };

  // Get selected vault address
  const selectedVaultAddress = exposureAssets[selectedExposureAsset as keyof typeof exposureAssets]?.vaultAddress;

  // Hook integrations with correct signatures
  const vault = useVault({
    chainId: 8453, // Base mainnet
    address: selectedVaultAddress as `0x${string}`
  });

  // Get the actual Cabana vault from VaultsProvider
  const vaults = useVaults();
  const selectedCabanaVault = vaults?.vaults ? Object.values(vaults.vaults)
    .find(v => v.chainId === 8453 && v.address.toLowerCase() === selectedVaultAddress?.toLowerCase()) : undefined;

  // Get user vault balances using the Vaults collection
  const userVaultBalances = useAllUserVaultBalances(
    vaults,
    primaryWallet?.address as `0x${string}`
  );

  // Dynamic components handle wallet connection/disconnection automatically

  return (
    <div className="min-h-screen">
      {/* Above the fold section with video background */}
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

        {/* Header - Above everything */}
        <div className="absolute top-6 left-6 right-6 z-30 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-slate-100">saven</div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="group flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-slate-800/40 to-slate-700/40 border border-slate-600/50 rounded-xl text-slate-100 hover:from-slate-700/50 hover:to-slate-600/50 hover:border-amber-500/30 transition-all duration-300 shadow-lg backdrop-blur-sm cursor-pointer hover:shadow-xl hover:shadow-amber-500/10">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-sm"></div>
                      <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <span className="text-sm font-semibold tracking-wide group-hover:text-amber-100 transition-colors">
                      {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connected'}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-slate-500/50 group-hover:bg-amber-500/30 transition-colors"></div>
                  <span className="text-xs text-slate-300 font-medium group-hover:text-amber-200 transition-colors">Connected</span>
                  <div className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ) : (
                <DynamicConnectButton>
                  <div className="group relative px-6 py-3 bg-gradient-to-r from-amber-600/90 to-yellow-600/90 hover:from-amber-500 hover:to-yellow-500 border border-amber-500/30 rounded-xl text-white font-semibold text-sm tracking-wide transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 transform">
                    <span className="relative z-10">Connect Wallet</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </DynamicConnectButton>
              )}
            </div>
          </div>
        </div>

        {/* Activity Ticker - Below header, directly on video */}
        <div className="absolute top-20 left-0 right-0 z-20">
          <div className="bg-slate-800/20 backdrop-blur-sm overflow-hidden border-t border-b border-slate-700/30">
            <div className="flex items-center py-4 px-6">
              <div className="flex-1 overflow-hidden">
                <div className="flex space-x-8 animate-scroll">
                  {[...activityItems, ...activityItems].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 whitespace-nowrap">
                      <div className={`w-2 h-2 rounded-full bg-${item.color}-400/70`}></div>
                      <span className="text-slate-300 text-base font-medium drop-shadow-sm">{item.message}</span>
                      <span className="text-slate-400 text-sm drop-shadow-sm">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Dark overlay for above the fold content */}
        <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-md" style={{
          maskImage: 'linear-gradient(to bottom, transparent 0px, transparent 140px, black 140px, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, transparent 140px, black 140px, black 100%)'
        }}></div>

        {/* Above the fold content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full" style={{ paddingTop: '140px' }}>

          {/* Main Layout with Left Sidebar */}
          <div className="flex gap-6 pb-6 pt-6">
            {/* Left Sidebar - User Progression */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-slate-800/10 backdrop-blur-xs border border-slate-700/20 rounded-lg transition-all duration-300 hover:bg-slate-800/20 hover:border-slate-600/30">
                {/* User Profile Section */}
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">saven_user</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                        <span className="text-slate-200 text-sm font-medium">Silver</span>
                      </div>
                    </div>
                  </div>

                  {/* REP Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-200 font-medium text-sm">EXP</span>
                      <span className="text-slate-300 text-sm">1,250 / 2,000</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full" style={{ width: '62.5%' }}></div>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">Next level EXP</p>
                  </div>

                  {/* Skill Rating */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 font-medium text-sm">SAVING STREAK</span>
                      <span className="text-slate-100 font-bold">28 days</span>
                    </div>
                  </div>

                  {/* Portfolio Value */}
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 font-medium text-sm">YOUR SAVINGS</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-100 font-bold">$12,450</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="border-t border-slate-700/30"></div>

                {/* Objectives Section */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-100 mb-4">OBJECTIVES</h3>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-200 font-medium text-sm">Starter Objectives</span>
                      <span className="text-slate-300 text-sm">3/10 Complete</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>

                  {/* Individual Objectives */}
                  <div className="space-y-4">

                    {/* Objective 2 */}
                    <div className="p-3 bg-slate-700/20 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-slate-100 font-medium text-sm">"Yield Hunter"</h4>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="text-xs text-slate-300">250</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs mb-2">Earn $50+ in yield rewards</p>
                      <div className="w-full bg-slate-700/50 rounded-full h-1">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-1 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>

                    {/* Objective 3 */}
                    <div className="p-3 bg-slate-700/20 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-slate-100 font-medium text-sm">"Diversified"</h4>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                          <span className="text-xs text-slate-300">500</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs mb-2">Hold assets in 3+ different categories</p>
                      <div className="w-full bg-slate-700/50 rounded-full h-1">
                        <div className="bg-gradient-to-r from-slate-400 to-slate-500 h-1 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Grid Layout */}
            <div className="flex-1 space-y-6">
              {/* First Row - Extended Deposit Section */}
              <div className="bg-slate-800/10 backdrop-blur-xs border border-slate-700/20 rounded-lg transition-all duration-300 hover:bg-slate-800/20 hover:border-slate-600/30">
                <div className="h-full flex flex-col justify-center p-6">
                  <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-100 mb-4">
                      Save more, win more.
                      <span className="text-4xl font-black text-amber-400">
                        {userAssets.length === 1
                          ? userAssets[0]
                          : userAssets.join(' and ')
                        }
                      </span>
                    </h1>
                    <p className="text-lg text-slate-200 mb-6 max-w-2xl mx-auto">
                      Keep exposure to your assets. Give up yield for prizes.
                    </p>
                  </div>

                  {/* Exposure Asset Selection */}
                  <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {Object.entries(exposureAssets).map(([asset, details]) => (
                        <Card
                          key={asset}
                          className={`cursor-pointer transition-all duration-300 ${selectedExposureAsset === asset
                            ? 'bg-amber-500/20 border-amber-500/50 shadow-lg shadow-amber-500/20'
                            : 'bg-slate-800/20 border-slate-700/30 hover:bg-slate-800/30 hover:border-slate-600/40'
                            }`}
                          onClick={() => setSelectedExposureAsset(asset)}
                        >
                          <CardHeader className="pb-2 px-4 pt-4">
                            <CardTitle className="text-center text-xl font-bold text-slate-100">
                              {asset}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 px-4 pb-4">
                            <div className="text-center space-y-2">
                              <div className="text-amber-400 font-semibold text-sm">
                                {details.yieldSource}
                              </div>

                              {/* Curator Pill */}
                              <div className="flex justify-center">
                                <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-600/20 text-blue-300 rounded-full border border-blue-500/30">
                                  {details.curator}
                                </span>
                              </div>

                              {/* Strategy Pills */}
                              <div className="flex flex-wrap justify-center gap-1">
                                {details.strategies.map((strategy, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-0.5 text-[10px] font-medium bg-slate-700/50 text-slate-300 rounded-full border border-slate-600/30"
                                  >
                                    {strategy}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>


                    {/* Deposit Section */}
                    <div className="text-center space-y-4">
                      <Button
                        onClick={() => {
                          if (vault) {
                            setIsDepositModalOpen(true)
                          } else {
                            console.warn('Cannot open deposit modal: vault not available')
                          }
                        }}
                        disabled={!vault}
                        className="px-8 py-4 bg-gradient-to-r from-amber-600/90 to-yellow-600/90 hover:from-amber-500 hover:to-yellow-500 border border-amber-500/30 rounded-xl text-white font-semibold text-lg tracking-wide transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Deposit {selectedExposureAsset}
                      </Button>
                      <p className="text-slate-400 text-sm">
                        Deposit {selectedExposureAsset} to start earning rewards and prizes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Row - Win Chance & Card Packs */}
              <div className="grid grid-cols-2 gap-6">
                {/* Column 1, Row 1: Win Chance & Next Draw */}
                <div className="bg-slate-800/10 backdrop-blur-xs border border-slate-700/20 rounded-lg transition-all duration-300 hover:bg-slate-800/20 hover:border-slate-600/30">
                  <div className="h-full flex flex-col justify-between p-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100 mb-4">
                        You have a 1 in{" "}
                        <span className="text-3xl font-black text-amber-400">0</span>{" "}
                        chance to win{" "}
                        <span className="text-3xl font-black text-amber-400">$0.00</span>
                      </h2>
                    </div>
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-amber-500/30 bg-slate-800/50 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-slate-200 font-bold text-lg">Next draw</div>
                            <div className="text-amber-400 font-black text-2xl">{timeToDraw}h</div>
                          </div>
                        </div>
                        <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2, Row 1: Card Packs */}
                <div className="bg-slate-800/10 backdrop-blur-xs border border-slate-700/20 rounded-lg transition-all duration-300 hover:bg-slate-800/20 hover:border-slate-600/30">
                  <div className="h-full flex flex-col p-6">
                    <h2 className="text-2xl font-bold text-slate-100 mb-4">Card Packs</h2>
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
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Below the fold content - Asset Allocation & Vault List */}
      <div className="bg-slate-900 min-h-screen transition-all duration-500 ease-in-out">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-fade-in-up space-y-12">
            {/* Asset Allocations Section */}
            <div className="bg-slate-800/10 backdrop-blur-xs border border-slate-700/20 rounded-lg transition-all duration-300 hover:bg-slate-800/20 hover:border-slate-600/30">
              <div className="p-8">
                <h2 className="text-3xl font-bold text-slate-100 mb-8 text-center">Asset Allocations</h2>
                <div className="flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    {/* Pie Chart - Using CSS to create segments */}
                    <div className="absolute inset-0 rounded-full border-8 border-slate-600"></div>

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
                        <div className="text-slate-200 font-bold text-xl">Total</div>
                        <div className="text-amber-400 font-black text-3xl">$12,450</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-8 flex justify-center">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-amber-500"></div>
                      <span className="text-slate-200 font-medium text-lg">ETH - 60% ($7,470)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-slate-600"></div>
                      <span className="text-slate-200 font-medium text-lg">BTC - 30% ($3,735)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-slate-400"></div>
                      <span className="text-slate-200 font-medium text-lg">USD - 10% ($1,245)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vault List Section */}
            <VaultList 
              selectedExposureAsset={selectedExposureAsset} 
              onDeposit={(vaultAddress) => {
                // Find the vault by address and open modal
                if (vaults?.vaults) {
                  const vault = Object.values(vaults.vaults)
                    .find(v => v.address.toLowerCase() === vaultAddress.toLowerCase());
                  if (vault) {
                    setIsDepositModalOpen(true);
                  }
                }
              }}
            />
          </div>
        </div>
      </div>


      {/* Dynamic Widget for wallet connection modal */}
      {React.createElement(DynamicWidget as any)}

      {/* Deposit Modal */}
      <DepositModal
        vault={selectedCabanaVault}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccessfulDeposit={(chainId, txHash) => {
          console.log('Deposit successful:', { chainId, txHash })
          // Handle successful deposit
        }}
        onSuccessfulDepositWithZap={(chainId, txHash) => {
          console.log('Zap deposit successful:', { chainId, txHash })
          // Handle successful zap deposit
        }}
      />
    </div >
  );
}
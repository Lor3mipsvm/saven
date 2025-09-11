// Shared types for the Saven application

export interface User {
    id: string;
    email?: string;
    walletAddress?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Wallet {
    address: string;
    chainId: number;
    isConnected: boolean;
}

export interface Asset {
    symbol: string;
    name: string;
    balance: number;
    value: number;
    allocation: number; // percentage
}

export interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal' | 'prize' | 'yield';
    amount: number;
    asset: string;
    timestamp: Date;
    status: 'pending' | 'completed' | 'failed';
}

export interface Prize {
    id: string;
    name: string;
    value: number;
    description: string;
    drawDate: Date;
    isWon: boolean;
}

export type LoginMethod = 'email' | 'wallet';
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type TransactionType = 'deposit' | 'withdrawal' | 'prize' | 'yield';

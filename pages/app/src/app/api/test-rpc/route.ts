import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        // Check environment variables
        const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_RPC_KEY
        const baseRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL
        const infuraRpcUrl = 'https://base-mainnet.infura.io/v3/516cb578170e4a128c3526bd6a3b2ee7'
        const publicRpcUrl = 'https://mainnet.base.org'

        const rpcUrl = alchemyKey
            ? `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`
            : baseRpcUrl || infuraRpcUrl || publicRpcUrl

        // Determine which provider will be used
        let provider = 'Unknown'
        if (alchemyKey) provider = 'Alchemy'
        else if (baseRpcUrl) provider = 'Custom Base RPC'
        else if (rpcUrl === infuraRpcUrl) provider = 'Infura'
        else if (rpcUrl === publicRpcUrl) provider = 'Public Base RPC'

        return NextResponse.json({
            alchemyKey: alchemyKey ? 'Set' : 'Not set',
            baseRpcUrl: baseRpcUrl || 'Not set',
            provider: provider,
            rpcUrl: rpcUrl,
            fallbacks: {
                infura: infuraRpcUrl,
                public: publicRpcUrl
            },
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to check RPC configuration', details: error },
            { status: 500 }
        )
    }
}

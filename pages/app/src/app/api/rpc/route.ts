import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { method, params, id } = body

        // Get the RPC URL from environment variables with fallbacks
        const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_RPC_KEY
        const baseRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL
        const infuraRpcUrl = 'https://base-mainnet.infura.io/v3/516cb578170e4a128c3526bd6a3b2ee7'
        const publicRpcUrl = 'https://mainnet.base.org'

        const rpcUrl = alchemyKey
            ? `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`
            : baseRpcUrl || infuraRpcUrl || publicRpcUrl

        // Forward the request to the RPC endpoint
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method,
                params: params || [],
                id: id || 1
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            return NextResponse.json(
                { error: `RPC error: ${response.status}`, details: errorText },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

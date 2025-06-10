import { NextResponse } from 'next/server'

const ALCHEMY_TOKEN_PRICE_API_URL =
  'https://api.g.alchemy.com/prices/v1/tokens/by-symbol?symbols=WLD&symbols=ETH&symbols=POOLTOGETHER'

const getDate = () => {
  var now = new Date()
  return (
    now.getFullYear() +
    '-' +
    ('0' + (now.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + now.getDate()).slice(-2)
  )
}

const TOKEN_ADDRESSES = {
  WLD: '0x2cfc85d8e48f8eab294be644d9e25c3030863003'.toLowerCase(),
  POOL: '0x7077c71b4af70737a08287e279b717dcf64fdc57'.toLowerCase()
}

export async function GET(): Promise<NextResponse> {
  try {
    const result = await getWorldchainTokenPrice()

    // Format our result to match the PoolTogether TokenPriceApi created by @ncookie
    // This matches what's expected from the Cabana app (prices denominated in ETH, etc)
    const tokenPriceApiOutput = {
      [TOKEN_ADDRESSES.WLD]: [
        {
          date: getDate(),
          price: Number(result.prices[TOKEN_ADDRESSES.WLD])
        }
      ],
      [TOKEN_ADDRESSES.POOL]: [
        {
          date: getDate(),
          price: Number(result.prices[TOKEN_ADDRESSES.POOL])
        }
      ]
    }

    return NextResponse.json(tokenPriceApiOutput, { status: 200 })
  } catch {
    return NextResponse.json({ message: 'Could not fetch token price data' }, { status: 500 })
  }
}

const getWorldchainTokenPrice = async (): Promise<{
  prices: Record<string, number>
  error: unknown
}> => {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.ALCHEMY_PRICES_API_KEY}`
  }

  async function fetchData() {
    let error
    let prices: Record<string, number> = {}
    try {
      const response = await fetch(ALCHEMY_TOKEN_PRICE_API_URL, {
        method: 'GET',
        headers: headers
      })
      if (response.status === 200) {
        const json = await response.json()

        const ethUsd = json.data.find((obj: any) => obj.symbol === 'ETH').prices[0].value
        const wldUsd = json.data.find((obj: any) => obj.symbol === 'WLD').prices[0].value
        const poolUsd = json.data.find((obj: any) => obj.symbol === 'POOLTOGETHER').prices[0].value

        prices[TOKEN_ADDRESSES.WLD] = Number(wldUsd) / Number(ethUsd)
        prices[TOKEN_ADDRESSES.POOL] = Number(poolUsd) / Number(ethUsd)

        error = undefined
      } else {
        const e = await response.text()
        console.log(e)
        error = e
      }
    } catch (e) {
      console.log('e')
      console.log(e)
      error = e
    }

    return {
      prices,
      error
    }
  }

  return await fetchData()
}

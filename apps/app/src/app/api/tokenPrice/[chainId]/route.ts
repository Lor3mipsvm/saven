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

// On Staging it expects a checksummed address while on localhost / dev it wants lowercase
// I'm not sure why nor do I have time to figure it out
const TOKEN_ADDRESSES = {
  WLD: '0x2cFc85d8E48F8EAB294be644d9E25C3030863003'.toLowerCase(),
  WLDCHECKSUMMED: '0x2cFc85d8E48F8EAB294be644d9E25C3030863003',
  POOL: '0x7077C71B4AF70737a08287E279B717Dcf64fdC57'.toLowerCase(),
  POOLCHECKSUMMED: '0x7077C71B4AF70737a08287E279B717Dcf64fdC57'
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
      [TOKEN_ADDRESSES.WLDCHECKSUMMED]: [
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
      ],
      [TOKEN_ADDRESSES.POOLCHECKSUMMED]: [
        {
          date: getDate(),
          price: Number(result.prices[TOKEN_ADDRESSES.POOL])
        }
      ]
    }
    console.log('result')
    console.log(result)
    console.log('tokenPriceApiOutput')
    console.log(tokenPriceApiOutput)

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

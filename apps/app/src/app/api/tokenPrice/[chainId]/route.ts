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

export async function GET(): Promise<NextResponse> {
  try {
    const result = await getWldTokenPrice()
    console.log('result')
    console.log(result)

    // Format our result to match the PoolTogether TokenPriceApi created by @ncookie
    // This matches what's expected from the Cabana app (prices denominated in ETH, etc)
    const tokenPriceApiOutput = {
      '0x2cfc85d8e48f8eab294be644d9e25c3030863003': [
        {
          date: getDate(),
          price: Number(result.prices['0x2cfc85d8e48f8eab294be644d9e25c3030863003'])
        }
      ],
      '0x7077C71B4AF70737a08287E279B717Dcf64fdC57': [
        {
          date: getDate(),
          price: Number(result.prices['0x7077C71B4AF70737a08287E279B717Dcf64fdC57'])
        }
      ]
    }
    console.log('tokenPriceApiOutput')
    console.log(tokenPriceApiOutput)

    return NextResponse.json(tokenPriceApiOutput, { status: 200 })
  } catch {
    return NextResponse.json({ message: 'Could not fetch token price data' }, { status: 500 })
  }
}

const getWldTokenPrice = async () => {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.ALCHEMY_PRICES_API_KEY}`
  }

  async function fetchData() {
    let error
    let prices = {
      '0x2cfc85d8e48f8eab294be644d9e25c3030863003': 0,
      '0x4200000000000000000000000000000000000006': 0,
      '0x7077C71B4AF70737a08287E279B717Dcf64fdC57': 0
    }
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

        prices['0x2cfc85d8e48f8eab294be644d9e25c3030863003'] = Number(wldUsd) / Number(ethUsd)
        prices['0x7077C71B4AF70737a08287E279B717Dcf64fdC57'] = Number(poolUsd) / Number(ethUsd)

        // const j = {
        //   prices: {
        //     '0x2cfc85d8e48f8eab294be644d9e25c3030863003': {
        //       symbol: 'WLD',
        //       prices: [
        //         { currency: 'usd', value: '1.1424535964', lastUpdatedAt: '2025-06-10T16:41:56Z' }
        //       ]
        //     },
        //     '0x4200000000000000000000000000000000000006': {
        //       symbol: 'ETH',
        //       prices: [
        //         { currency: 'usd', value: '2738.8957927048', lastUpdatedAt: '2025-06-10T16:41:13Z' }
        //       ]
        //     },
        //     '0x7077C71B4AF70737a08287E279B717Dcf64fdC57': {
        //       symbol: 'POOLTOGETHER',
        //       prices: [
        //         { currency: 'usd', value: '0.2758534204', lastUpdatedAt: '2025-06-10T16:39:44Z' }
        //       ]
        //     }
        //   }
        // }
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

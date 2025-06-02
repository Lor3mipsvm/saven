import { NextResponse } from 'next/server'

const WORLD_TOKEN_PRICE_API_URL = 'https://api.g.alchemy.com/prices/v1/tokens/by-symbol?symbols=WLD'

export async function GET(): Promise<NextResponse> {
  try {
    const priceData = await getWldTokenPrice()

    var now = new Date()
    const tokenPriceApiOutput = {
      '0x2cfc85d8e48f8eab294be644d9e25c3030863003': {
        date: now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate(),
        price: JSON.parse(priceData).usd
      }
    }

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
    let usd, error
    try {
      const response = await fetch(WORLD_TOKEN_PRICE_API_URL, {
        method: 'GET',
        headers: headers
      })
      if (response.status === 200) {
        usd = (await response.json()).data[0].prices[0].value
        error = undefined
      } else {
        const e = await response.text()
        console.log(e)
        error = e
      }
    } catch (e) {
      console.log('e')
      console.log(e)
      usd = undefined
      error = e
    }

    return { usd, error }
  }

  const response = await fetchData()
  return JSON.stringify(response)
}

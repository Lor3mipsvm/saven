import { SECONDS_PER_DAY } from '@shared/utilities'
import { GetStaticProps } from 'next'
import { useState } from 'react'
import { getMessages } from 'src/utils'
import { CheckPrizesBanner } from '@components/Account/CheckPrizesBanner'
import { Layout } from '@components/Layout'
import { PrizePoolDisplay } from '@components/Prizes/PrizePoolDisplay'
import { PrizesHeader } from '@components/Prizes/PrizesHeader'

interface PrizesPageProps {
  messages: IntlMessages
}

export const getStaticProps: GetStaticProps<PrizesPageProps> = async ({ locale }) => {
  const messages = await getMessages(locale)

  return {
    props: { messages },
    revalidate: SECONDS_PER_DAY
  }
}

export default function PrizesPage() {
  const [_network, setNetwork] = useState<number | undefined>(undefined)

  return (
    <Layout className='gap-8'>
      <CheckPrizesBanner />
      <PrizesHeader />
      <PrizePoolDisplay onNetworkChange={setNetwork} className='mt-4' />
    </Layout>
  )
}

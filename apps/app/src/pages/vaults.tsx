import { SECONDS_PER_DAY } from '@shared/utilities'
import { GetStaticProps } from 'next'
import { getMessages } from 'src/utils'
import { Layout } from '@components/Layout'
import { VaultFilters } from '@components/Vault/VaultFilters'
import { VaultsDisplay } from '@components/Vault/VaultsDisplay'
import { VaultsHeader } from '@components/Vault/VaultsHeader'

interface VaultsPageProps {
  messages: IntlMessages
}

export const getStaticProps: GetStaticProps<VaultsPageProps> = async ({ locale }) => {
  const messages = await getMessages(locale)

  return {
    props: { messages },
    revalidate: SECONDS_PER_DAY
  }
}

export default function VaultsPage() {
  return (
    <Layout className='gap-6 lg:gap-8'>
      <VaultsHeader />
      <VaultFilters />
      <VaultsDisplay />
    </Layout>
  )
}

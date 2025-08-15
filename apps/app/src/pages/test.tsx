import { getMessages } from 'src/utils'
import { Layout } from '@components/Layout'

export const getStaticProps = async (props: any) => {
  const messages = await getMessages(props.locale)

  return {
    props: { messages }
  }
}

export default function VaultsPage() {
  return (
    <Layout>
      <div>Hello!</div>
    </Layout>
  )
}

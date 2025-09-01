import { useComposeCast } from '@coinbase/onchainkit/minikit'
import { SocialIcon } from '@shared/ui'
import { DOMAINS } from '@shared/utilities'

export interface ComposeCastButtonProps {
  text?: string
}

// When I implemented this it was not working in my beta Base app, however I followed the docs precisely
// so I assume it should start working soon. If not I will update it when it's properly implemented by Coinbase
export const ComposeCastButton = (props: ComposeCastButtonProps) => {
  const { composeCast } = useComposeCast()
  const { text } = props

  const handleComposeWithEmbed = () => {
    composeCast({
      text,
      embeds: [DOMAINS.app]
    })
  }

  return (
    <div className='text-md group flex h-min items-center justify-center p-0.5 text-center font-medium border focus:z-10 text-pt-purple-100 bg-pt-transparent border-pt-transparent hover:bg-pt-purple-50/20 focus:ring-pt-purple-50 rounded-lg w-full focus:ring-2 capitalize'>
      <span className='flex items-center transition-all duration-200 rounded-md text-xs px-2 py-1'>
        <SocialIcon platform={'base'} className='w-4 h-auto shrink-0 mr-1' />

        <button onClick={handleComposeWithEmbed}>Base</button>
      </span>
    </div>
  )
}

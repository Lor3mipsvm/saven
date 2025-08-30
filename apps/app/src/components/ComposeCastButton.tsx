import { useComposeCast } from '@coinbase/onchainkit/minikit'
import { SocialIcon } from '@shared/ui'
import { DOMAINS } from '@shared/utilities'

export interface ComposeCastButtonProps {
  text?: string
}

export const ComposeCastButton = (props: ComposeCastButtonProps) => {
  const { composeCast } = useComposeCast()
  const { text } = props

  // const handleCompose = () => {
  //   composeCast({ text })
  // }

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

        {/* <button onClick={handleCompose}>Share</button> */}
        <button onClick={handleComposeWithEmbed}>Base</button>
      </span>
    </div>
  )
}

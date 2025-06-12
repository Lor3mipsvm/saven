import { Bars3Icon } from '@heroicons/react/24/outline'
import { useAccount } from '@shared/generic-react-hooks'
import { MODAL_KEYS, useIsModalOpen } from '@shared/generic-react-hooks'
import classNames from 'classnames'
import { Navbar as FlowbiteNavbar } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import './navbar.css'
import { SignInButton } from './SignInButton'
import { UserAccountInfo } from './UserAccountInfo'

interface NavbarLink {
  href: string
  name: string
  svg: ReactNode
}

export const Navbar = () => {
  const t_nav = useTranslations('Navigation')

  const { address: userAddress } = useAccount()

  const { setIsModalOpen: setIsSettingsModalOpen } = useIsModalOpen(MODAL_KEYS.settings)

  const navLinks: NavbarLink[] = [
    {
      href: '/prizes',
      name: t_nav('prizes'),
      svg: (
        <svg
          className='md:hidden'
          viewBox='0 0 25 25'
          height='24'
          width='24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M19.5483 3.3167C19.6175 2.60874 19.6175 1.96998 19.6175 1.1875H5.42638C5.42638 1.96998 5.42638 2.60874 5.49558 3.3167H1.16797V4.02466C1.16797 10.3431 9.18442 14.8144 11.1007 15.8098V18.2211C11.1007 19.4295 10.1798 20.3503 8.9715 20.3503H7.55558V23.1875H17.4883V20.3503H16.0724C14.8641 20.3503 13.9432 19.4295 13.9432 18.2211V15.8098C15.8595 14.8144 23.8759 10.3431 23.8759 4.02466V3.3167H19.5483ZM2.65841 4.73795H5.6393C5.92142 7.93175 6.7039 10.1994 7.55558 11.8335C5.28265 10.061 2.94053 7.57511 2.65841 4.73795ZM17.5628 11.8335C18.4145 10.1994 19.1917 7.93175 19.4791 4.73795H22.46C22.1034 7.57511 19.7612 10.061 17.5628 11.8335Z' />
        </svg>
      )
    },
    {
      href: '/vaults',
      name: t_nav('vaults'),
      svg: (
        <svg
          className='md:hidden'
          viewBox='0 0 18 25'
          height='24'
          width='24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M7.94072 22.0594C8.52666 22.6453 9.47822 22.6453 10.0642 22.0594L17.5642 14.5594C18.1501 13.9734 18.1501 13.0219 17.5642 12.4359C16.9782 11.85 16.0267 11.85 15.4407 12.4359L10.5001 17.3812V3C10.5001 2.17031 9.82979 1.5 9.0001 1.5C8.17041 1.5 7.5001 2.17031 7.5001 3V17.3766L2.55947 12.4406C1.97354 11.8547 1.02197 11.8547 0.436035 12.4406C-0.149902 13.0266 -0.149902 13.9781 0.436035 14.5641L7.93604 22.0641L7.94072 22.0594Z'
            fill='black'
          />
        </svg>
      )
    },
    {
      href: '/account',
      name: t_nav('account'),
      svg: (
        <svg
          className='md:hidden'
          viewBox='0 0 22 22'
          height='24'
          width='24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M19.2113 20.2086C19.2113 21.6382 18.0537 22.7971 16.6241 22.7971H3.68276C2.25316 22.7971 1.09424 21.6382 1.09424 20.2086C1.09424 15.9198 4.57089 12.4431 8.85969 12.4431H11.4482C15.7357 12.4444 19.2113 15.9211 19.2113 20.2086Z'
            fill='black'
          />
          <path
            d='M10.1528 11.15C7.29354 11.15 4.97559 8.83226 4.97559 5.97286C4.97559 3.11492 7.29337 0.796997 10.1528 0.796997C13.0122 0.796997 15.33 3.11478 15.33 5.97418C15.33 8.83213 13.0122 11.15 10.1528 11.15Z'
            fill='black'
          />
        </svg>
      )
    }
  ]

  return (
    <>
      <FlowbiteNavbar
        fluid={true}
        theme={{
          root: {
            base: 'bg-pt-purple-700 text-pt-purple-50 px-4 py-4 border-b-2 border-b-pt-purple-700 border-opacity-0 isolate z-50'
          }
        }}
        className='font-averta'
      >
        {/* Left Side Branding */}
        <a href='/'>
          <img src='/pooltogether-white-mark.svg' alt='PoolTogether' />
        </a>

        {/* Middle Content */}
        <div className='hidden grow pl-8 gap-8 z-10 md:flex lg:absolute lg:w-full lg:justify-center lg:pr-16 lg:pl-0'>
          <NavbarLinks links={navLinks} />
        </div>

        {/* Right Side Content */}
        <div className='flex gap-2 items-center z-20'>
          {!!userAddress ? <UserAccountInfo /> : <SignInButton />}

          <Bars3Icon
            className='h-6 w-6 text-pt-purple-50 hover:text-pt-purple-200 cursor-pointer'
            onClick={() => setIsSettingsModalOpen(true)}
          />
        </div>
      </FlowbiteNavbar>
      <MobileNavbar className='z-50'>
        {/* <NavbarLinks links={[{ href: '/', name: t_nav('home') }, ...navLinks]} /> */}
        <NavbarLinks links={navLinks} />
      </MobileNavbar>
    </>
  )
}

interface NavbarLinksProps {
  links: NavbarLink[]
}

const NavbarLinks = (props: NavbarLinksProps) => {
  const { links } = props

  const router = useRouter()

  return (
    <>
      {links.map((link, i) => (
        <Link
          key={`nav-${i}-${link.name.toLowerCase()}`}
          href={link.href}
          className={classNames(
            'block nav-link flex flex-col items-center text-base font-medium hover:text-pt-purple-200',
            {
              '!text-pt-teal': link.href === router.pathname,
              'active': link.href === router.pathname
            }
          )}
        >
          {link.svg} {link.name}
        </Link>
      ))}
    </>
  )
}

interface MobileNavbarProps {
  children?: ReactNode
  className?: string
}

const MobileNavbar = (props: MobileNavbarProps) => {
  const { children, className } = props

  return (
    <div
      className={classNames(
        'fixed bottom-0 flex w-full pb-6 pt-4 justify-center items-center gap-10 md:hidden',
        'bg-pt-purple-600 border-t-2 border-pt-purple-500',
        className
      )}
      style={{
        boxShadow: `0 -3px 10px rgba(40, 30, 80, 0.3)`
      }}
    >
      {children}
    </div>
  )
}

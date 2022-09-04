import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { NextPage } from 'next'
import { createContext, ReactElement, ReactNode } from 'react'
import {FaGithub, FaInstagram} from 'react-icons/fa'

export type NextPageWithLayout<P = {}> = NextPage<P> & {
  getLayout?: (page: ReactElement<P>) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  return getLayout(<Component {...pageProps} />)
}

export default MyApp

export interface AppConfig {
  mainMenu: {name: string, href: string}[],
  socialLinks: {name: string, icon: ReactNode, href: string}[],
  siteName: string,
}

export const config: AppConfig = {
  mainMenu: [
    {name: `Home`, href: `/`},
    {name: `Blog`, href: `/blog`},
    {name: `Simulation`, href: `/simulation`},
  ],
  socialLinks: [
    {name: `GitHub`, href: 'https://github.com/signal32', icon: <div><FaGithub/></div>},
    {name: `Instagram`, href: 'https://www.instagram.com/hamishweirphoto/', icon: <div><FaInstagram/></div>}
  ],
  siteName: `Hamish Weir Blog!`
}

export interface PageDetails {
  title: string,
  image: string,
  update(title: string): void,
}

export const PageContext = createContext<PageDetails>({
  title: "oh",
  image: "",
  update: function (title: string) {
    this.title = title;
    console.log('updated title');
   },
})
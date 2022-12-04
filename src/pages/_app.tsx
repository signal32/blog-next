import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { NextPage } from 'next'
import { createContext, ReactElement, ReactNode } from 'react'
import {FaGithub, FaInstagram} from 'react-icons/fa'
import create from 'zustand'
import ModalContext from '../components/common/Modal'

export type NextPageWithLayout<P = {}> = NextPage<P> & {
  getLayout?: (page: ReactElement<P>, props: P) => ReactNode,
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  // return getLayout(<Component {...pageProps} />, pageProps);
  return (
    <div>
      {getLayout(<Component {...pageProps} />, pageProps)}
    </div>
  )
}

export default MyApp

export interface AppConfig {
  mainMenu: {name: string, href: string}[],
  socialLinks: {name: string, icon: ReactNode, href: string}[],
  siteName: string,
}

export const config: AppConfig = {
  mainMenu: [
    {name: `Blog`, href: `/blog`},
    {name: `Design`, href: `/design`},
    {name: `Simulation`, href: `/simulation`},
    {name: `About`, href: `/about`},
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

interface AppStore {
  mainImage?: string,
  setMainImage: (url: string) => void,
  headerTitle?: string,
  setTitle: (title: string) => void,
}

/**
 * Store for information shared by many aspects of the application
 */
export const useAppStore = create<AppStore>()(set => ({
  setMainImage: (url) => set({mainImage: url}),
  setTitle: (title) => set({headerTitle: title}),
}));
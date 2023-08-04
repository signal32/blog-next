import '../styles/globals.css'
import { ReactNode } from 'react'
import {FaGithub, FaInstagram} from 'react-icons/fa'
import LayoutApp from '../components/app/LayoutApp'

export default LayoutApp

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

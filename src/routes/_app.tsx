import { Github, Instagram } from 'lucide-react'
import { ReactNode } from 'react'
import LayoutApp from '../components/app/LayoutApp'

export default LayoutApp

export interface AppConfig {
    mainMenu: { name: string, href: string }[],
    socialLinks: { name: string, icon: ReactNode, href: string }[],
    siteName: string,
}

export const websiteConfig: AppConfig = {
    mainMenu: [
        { name: `Blog`, href: `/blog` },
        { name: `Simulation`, href: `/simulation` },
        { name: `About`, href: `/about` },
        // { name: `Shop`, href: `/shop` },
    ],
    socialLinks: [
        { name: `GitHub`, href: 'https://github.com/signal32', icon: <div><Github /></div> },
        { name: `Instagram`, href: 'https://www.instagram.com/hamishweirphoto/', icon: <div><Instagram /></div> }
    ],
    siteName: `Hamish Weir Blog`,
}

import { Github, Instagram } from 'lucide-react'
import { ReactNode } from 'react'
import LayoutApp from '../components/app/LayoutApp'

export default LayoutApp

export interface AppConfig {
    mainMenu: { name: string, href: string }[],
    socialLinks: { name: string, icon: ReactNode, href: string }[],
    siteName: string,
    personalDescription: string,
    personalTagline: string,
}

export const websiteConfig: AppConfig = {
    mainMenu: [
        { name: `Blog`, href: `/blog` },
        { name: `Simulation`, href: `/simulation` },
        { name: `Contact`, href: `/contact` },
        { name: `Shop`, href: `/shop` },
    ],
    socialLinks: [
        { name: `GitHub`, href: 'https://github.com/signal32', icon: <div><Github /></div> },
        { name: `Instagram`, href: 'https://www.instagram.com/hamishweirphoto/', icon: <div><Instagram /></div> }
    ],
    siteName: `Hamish Weir Blog`,
    personalTagline: 'Creative Technologist',
    personalDescription: 'I am Hamish, a software engineer and creative technologist floating around on the British canal system. From developing all sorts of software and building detailed rail simulations through to installing off-grid electrical systems and practicing photography, I enjoy creative problem solving in many different forms.'
}

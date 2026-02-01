// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/router";
import { cloneElement, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { websiteConfig } from "../../routes/_app";
import Breadcrumbs from "../common/Breadcrumbs";
import ModalContext from "../common/Modal";
import { useLocation, useNavigation } from "react-router";
import { Link } from "react-router";
import { H1, H2 } from "../common/typography";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "src/lib/utils";

export function debounce<Args extends unknown[]>(
    fn: (...args: Args) => void,
    delay: number
): (...args: Args) => void {
    let timer: ReturnType<typeof setTimeout>

    return (...args: Args): void => {
        if (timer !== undefined) {
            clearTimeout(timer)
        }

        timer = setTimeout(() => {
            fn(...args)
        }, delay)
    }
}

const DEMO_IMAGE = "https://images.pexels.com/photos/4215110/pexels-photo-4215110.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

export interface MainLayoutProps {
    children: ReactNode,
    header?: { type: 'image', href: string } | { type: 'component', component: JSX.Element },
    headerTitle?: string,
    breadcrumbs?: boolean,
}

export type LayoutConfig = Omit<MainLayoutProps, 'children'>

export interface LayoutRequestProps {
    updateLayout(config: LayoutConfig): void,
}

//const AppBaseLayout = ({children, header: defaultHeaderImage, headerTitle: defaultHeaderTitle, breadcrumbs}: MainLayoutProps) => {
const AppBaseLayout = (props: MainLayoutProps) => {
    const router = useNavigation();
    const location = useLocation();
    const headerRef = useRef<HTMLDivElement>(null);
    const [title, setTitle] = useState(props.headerTitle);
    const [header, setHeader] = useState(props.header);
    const [showHeader, setShowHeader] = useState(true);
    const [showContent, setShowContent] = useState(true);

    // useEffect(() => {
    //     if (typeof window === 'undefined') return

    //     const hideHeaderWhenScrolled = () => {
    //         const headerImageHeight = headerRef.current?.scrollHeight ?? 500

    //         if (window.scrollY > headerImageHeight && showHeader) setShowHeader(false)
    //         else if (window.scrollY <= headerImageHeight && !showHeader) setShowHeader(true)
    //     }

    //     window.addEventListener('scroll', hideHeaderWhenScrolled, { passive: true })
    //     return () => void window.removeEventListener('scroll', hideHeaderWhenScrolled)
    // }, [showHeader])

    // const showAnimatedContent = debounce(() => {
    //     setTitle(props.headerTitle);
    //     setHeader(props.header);
    //     setShowHeader(true);
    //     setShowContent(true);
    // }, 300);

    // const hideAnimatedContent = debounce(() => {
    //     setShowHeader(false);
    //     setShowContent(false);
    // }, 0);

    // useEffect(() => {
    //     hideAnimatedContent()
    //     setTimeout(showAnimatedContent, 400)
    //     // Will cause infinite loop
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [router.location?.pathname])

    const Navigation = (props: {
        column?: boolean
    }) => (
        <div className={cn('flex gap-2 text-lg', props.column && 'flex-col')}>
            {
                websiteConfig.mainMenu.map((item, i) => (
                    <Link
                        className={cn(
                            "grow p-2 rounded-lg text-center ring-air",
                            location.pathname === item.href
                                ? 'bg-air'
                                : cn('hover:ring-2', props.column && 'bg-air/20')

                        )}
                        key={i}
                        to={item.href}>
                        {item.name}
                    </Link>
                ))
            }

            {/* Extra links (i.e. external social media) */}
            <div className={cn("flex flex-wrap justify-center sm:justify-end items-center border-air sm:pl-4", props.column && "border-t-2")}>
                {
                    websiteConfig.socialLinks.map((link, i) => (
                        <div className="p-2" key={i}>
                            <a className="text-slate-300 hover:text-white transition-all" href={link.href} target="_blank">{link.icon}</a>
                        </div>
                    ))
                }
            </div>
        </div >
    )

    const [showNav, setShowNav] = useState(false)

    return (
        <div className="dark:bg-gray-900 bg-gray-300 bg-repeat flex flex-col min-h-screen h-full md:px-3">
            <header className="mb-5 top-0 sticky bg-gradient-to-t from-transparent dark:to-gray-900 to-gray-300 z-40">
                <div className="max-w-4xl mx-auto px-2 sm:px-6 mt-0 md:mt-2 rounded-b-lg md:rounded-lg shadow-lg bg-ocean">
                    <div className="flex flex-wrap gap-2 justify-between items-center pb-1 px-4">
                        <Link
                            to={'/'}
                            className="flex-auto max-w-xs p-2">
                            <h1 className='text-white/85 hover:text-white text-3xl py-2 font-black font-handwritten sm:text-left'>Hamish Weir</h1>
                        </Link>
                        <Button className="sm:hidden cursor-pointer" variant='outline' onClick={() => setShowNav(!showNav)}>{showNav ? <X /> : <Menu />}</Button>
                        <div className="not-sm:hidden"><Navigation /></div>
                    </div>
                    <div className={cn('sm:hidden', !showNav && 'hidden')}><Navigation column /></div>
                </div>
            </header>
            {((props.breadcrumbs ?? true) && showHeader) && <Breadcrumbs />}

            {props.children}

            <footer className="align-bottom dark:text-gray-300 text-gray-700">
                <div className="max-w-4xl mx-auto -z-20">
                    <div className="px-2 sm:px-6 mb-2 rounded-lg shadow-lg dark:bg-gray-800 bg-gray-200">
                        <div className="mx-auto flex justify-between items-center">

                            <div className="w-1/5 dark:invert">
                                {/*<MyLogo />*/}
                            </div>

                            <div className="w-1/5 hame-markdown">
                                <p className=" dark:text-gray-300 text-gray-600 text-xs italic">Copyright &#169; Hamish Weir {new Date().getFullYear()}</p>
                            </div>

                        </div>
                    </div>

                    <div className="relative -top-3 pt-0 mt-0 left-0 right-0 max-w-4xl sm:px-6 mb-2 rounded-b-lg shadow-lg bg-ocean mx-auto">

                        <div className="py-3 mx-auto flex justify-start items-center gap-2">
                            <div className="flex-none basis-1/5 dark:bg-gray-800 bg-gray-200 p-1 rounded-lg text-center shadow-lg">
                                <h1 className="text-sm"> {"Other sites"} </h1>
                            </div>

                            {/* {% for site in config.extra.other_sites_list %} */}
                            <div className="flex text-sm text-gray-300 hover:text-gray-50 hover:underline text-center">
                                {/*<a href="{{site.href}}">{"title placeholder"}</a>*/}
                            </div>
                            <div className="flex text-sm text-gray-300 text-center">
                                <p>|</p>
                            </div>
                            {/* {% endfor %} */}
                        </div>
                    </div>

                </div>
            </footer>

            <ModalContext />

        </div>
    );
}

export default AppBaseLayout;

export function defineLayout<P = {}>(
    config: Omit<MainLayoutProps, 'children'> | ((props: P) => Omit<MainLayoutProps, 'children'>) = {}
) {
    // eslint-disable-next-line react/display-name
    return (page: ReactElement, props: P) => (
        <AppBaseLayout {...(typeof config === 'function' ? config(props) : config)}>
            {page}
        </AppBaseLayout>
    )
}

export function ContentLayout(props: MainLayoutProps) {
    const headerRef = useRef<HTMLDivElement>(null);
    const [title, setTitle] = useState(props.headerTitle);
    const [header, setHeader] = useState(props.header);


    return (
        <>
            <div ref={headerRef} className={header !== undefined ? '-mt-10' : '-mt-5'}>
                <div className={`p-0 max-w-4xl mx-auto relative transition-all ease-in-out overflow-clip rounded-xl opacity-100`}>
                    {
                        header?.type === 'image'
                            ? <div className='w-full rounded-b-lg h-64'>
                                <img
                                    src={header.href ?? DEMO_IMAGE}
                                    className='w-full h-64'
                                    alt=''
                                    sizes='100vw'
                                    // fill
                                    style={{ objectFit: 'cover' }}
                                />
                                {title &&
                                    <div className="absolute bottom-0 left-0 bg-black/80 backdrop-blur-sm py-1 px-3 rounded-tr-lg">
                                        <H2 className="text-white">{title}</H2>
                                    </div>
                                }
                            </div>
                            : header?.component
                    }
                </div>
            </div>

            <main className="p-2 max-w-4xl mx-auto w-full flex-grow">
                <div>
                    {props.children}
                </div>
            </main>
        </>
    )
}

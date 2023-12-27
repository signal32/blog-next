import { debounce } from "lodash";
import Image from "next/image";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { cloneElement, ReactElement, useEffect, useState } from "react";
import { websiteConfig } from "../../pages/_app";
import MyLogo from "../../resources/images/logo.svg";
import Breadcrumbs from "../common/Breadcrumbs";
import ModalContext from "../common/Modal";

const DEMO_IMAGE = "https://images.pexels.com/photos/4215110/pexels-photo-4215110.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

export interface MainLayoutProps {
    children: ReactElement<LayoutRequestProps>,
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

    const router = useRouter();
    const [title, setTitle] = useState(props.headerTitle);
    const [header, setHeader] = useState(props.header);
    const [showHeader, setShowHeader] = useState(true);
    const [showContent, setShowContent] = useState(true);

    const resetState = () => {
        console.log('state reset')
        setTitle(props.headerTitle);
        setHeader(props.header);
    }

    // Layout should be reset when route changes
    // This ensures that changes made to layout do not persist between pages
    useEffect(resetState, [props.header, props.headerTitle, router.asPath]);

    const showAnimatedContent = debounce(() => {
        setShowHeader(true);
        setShowContent(true);
    }, 300);

    const hideAnimatedContent = debounce(() => {
        setShowHeader(false);
        setShowContent(false);
    }, 0);

    Router.events.on('routeChangeComplete', () => setTimeout(showAnimatedContent, 200));
    Router.events.on('routeChangeStart', hideAnimatedContent);

    return (
        <div className="dark:bg-gray-900 bg-gray-300 bg-repeat flex flex-col min-h-screen h-full md:px-3">
            <header className="mb-5 top-0 sticky bg-gradient-to-t from-transparent dark:to-gray-900 to-gray-300 z-20">
                <div className="max-w-4xl mx-auto px-2 sm:px-6 mt-0 md:mt-2 rounded-b-lg md:rounded-lg shadow-lg bg-ocean">
                    <div className="flex flex-wrap gap-2 justify-center items-center pb-1 md:pb-0">

                        {/* Main logo */}
                        <Link
                            href={'/'}
                            className="flex-auto basis-full sm:basis-1/8 max-w-xs p-2 invert">

                            <MyLogo className="dark:block h-12"/>

                        </Link>

                        {/* Main navigation */}
                        <div className="flex-auto basis-3/4 sm:basis-auto">
                            <div className="flex grow flex-wrap justify-center sm:justify-end py-0">
                                {
                                    websiteConfig.mainMenu.map((item, i) => (
                                        <div className="flex" key={i}>
                                            <Link
                                                href={item.href}
                                                className={`p-1 mx-1 rounded border-2 border-transparent hover:border-air transition-all text-slate-300 ${router.asPath == item.href? 'bg-air': ''}`}>

                                                {item.name}

                                            </Link>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Extra links (i.e. external social media) */}
                        <div className="flex-none sm:basis-auto">
                            <div className="flex flex-wrap justify-center sm:justify-end items-center">
                                {
                                    websiteConfig.socialLinks.map((link, i) => (
                                        <div className="flex" key={i}>
                                            <a className="text-slate-300 hover:text-white transition-all px-2" href={link.href}>{link.icon}</a>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className={ header !== undefined ? '-mt-10' : ' -mt-5'}>
                <div className={`p-0 max-w-4xl mx-auto relative transition-all ease-in-out overflow-clip rounded-xl ${showHeader ? ' max-h-screen opacity-100' : ' max-h-4 opacity-0'}`}>
                    {
                        header?.type === 'image' 
                            ? <div className='w-full rounded-b-lg h-64'>
                                <Image
                                    src={header.href ?? DEMO_IMAGE}
                                    className='w-full h-64'
                                    alt=''
                                    sizes='100vw'
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                                { title &&
                                    <div className="absolute bottom-0 left-0 right-0  text-white">
                                        <p className="text-white text-2xl w-fit bottom-0 z-30 bg-black bg-opacity-50 backdrop-blur-[1px] p-2 rounded-tr-lg">{title}</p>
                                    </div> 
                                }
                            </div>
                            : header?.component
                    }
                </div> 
            </div>

            <main className="p-2 max-w-4xl mx-auto w-full flex-grow">

                { (props.breadcrumbs ?? true) && <Breadcrumbs/> }
                {/* { title && 
                    <div className="w-full h-10 bottom-0 left-0">
                        <p className="text-white text-2xl bottom-0 z-30">{title}</p>
                    </div>      
                } */}

                <div className={`transition-all duration-500 ${showContent? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    { showContent &&
                        cloneElement(
                            props.children, 
                            {
                                updateLayout: (details: LayoutConfig) => {
                                    if (details.headerTitle) setTitle(details.headerTitle);
                                    if (details.header) setHeader(details.header);
                                },
                            }
                        )
                    }
                </div>

            </main>

            <footer className="align-bottom dark:text-gray-300 text-gray-700">
                <div className="max-w-4xl mx-auto -z-20">
                    <div className="px-2 sm:px-6 mb-2 rounded-lg shadow-lg dark:bg-gray-800 bg-gray-200">
                        <div className="mx-auto flex justify-between items-center">

                            <div className="w-1/5 dark:invert">
                                <MyLogo/>
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
                                <a href="{{site.href}}">{"title placeholder"}</a>
                            </div>
                            <div className="flex text-sm text-gray-300 text-center">
                                <p>|</p>
                            </div>
                            {/* {% endfor %} */}
                        </div>
                    </div>

                </div>
            </footer>

            <ModalContext/>

        </div>
    );
}

export default AppBaseLayout;

export function defineLayout<P = {}>(
    config: Omit<MainLayoutProps, 'children'> | ((props: P) => Omit<MainLayoutProps, 'children'>) = {}
) {
    // eslint-disable-next-line react/display-name
    return (page: ReactElement, props: P) => (
        <AppBaseLayout { ...(typeof config === 'function' ? config(props) : config) }>
            {page}
        </AppBaseLayout>
    )
} 
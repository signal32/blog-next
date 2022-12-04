import { debounce } from "lodash";
import Image from "next/image";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import React, { cloneElement, ReactElement, useContext, useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { config, PageContext, useAppStore } from "../../pages/_app";
import MyLogo from "../../resources/images/logo.svg";
import Breadcrumbs from "../common/Breadcrumbs";
import ModalContext from "../common/Modal";

const DEMO_IMAGE = "https://images.pexels.com/photos/4215110/pexels-photo-4215110.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

export interface MainLayoutProps {
    children: ReactElement<LayoutRequestProps>,
    defaultHeaderImage?: string,
    defaultHeaderTitle?: string,
}

interface LayoutConfigRequest {
    title?: string,
    image?: string,
    hidden?: boolean,
    reset?: boolean,
}

export interface LayoutRequestProps {
    requestLayout(request: LayoutConfigRequest): void,
}

const AppBaseLayout = ({children, defaultHeaderImage, defaultHeaderTitle}: MainLayoutProps) => {

    const router = useRouter();
    const [title, setTitle] = useState(defaultHeaderTitle);
    const [headerImage, setHeaderImage] = useState(defaultHeaderImage);
    const [showHeaderImage, setShowHeaderImage] = useState(true);
    const [showContent, setShowContent] = useState(true);


    //HACK Changes made to layout should not persist between different pages
    const resetState = () => {
        setTitle(defaultHeaderTitle);
        setHeaderImage(defaultHeaderImage);
    }
    useEffect(resetState, [router.asPath]);


    const showAnimatedContent = debounce(() => {
        setShowHeaderImage(true);
        setShowContent(true);
    }, 300);

    const hideAnimatedContent = debounce(() => {
        setShowHeaderImage(false);
        setShowContent(false);
    }, 300);

    Router.events.on('routeChangeComplete', showAnimatedContent);
    Router.events.on('routeChangeStart', hideAnimatedContent);

    return (
        <div className="dark:bg-gray-900 bg-gray-300 bg-repeat flex flex-col min-h-screen h-full">
            <header className="mb-5 top-0 sticky bg-gradient-to-t from-transparent dark:to-gray-900 to-gray-300 z-20">
                <div className="max-w-4xl mx-auto px-2 sm:px-6 mt-2 rounded-lg shadow-lg bg-ocean">
                    <div className="flex flex-wrap gap-2 justify-center items-center">

                        {/* Main logo */}
                        <Link href={'/'}>
                            <a className="flex-auto basis-full sm:basis-1/8 max-w-xs p-2 dark:invert">
                                <MyLogo className="dark:block h-12"/>
                            </a>
                        </Link>

                        {/* Main navigation */}
                        <div className="flex-auto basis-3/4 sm:basis-auto">
                            <div className="flex grow flex-wrap justify-center sm:justify-end py-0">
                                {
                                    config.mainMenu.map((item, i) => (
                                        <div className="flex" key={i}>
                                            <Link href={item.href}>
                                                <a className={`p-1 mx-1 rounded border-2 border-transparent hover:border-air transition-all text-slate-300 ${router.asPath == item.href? 'bg-air': ''}`}>
                                                    {item.name}
                                                </a>
                                            </Link>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Extra links (i.e. external social media) */}
                        <div className="flex-none sm:basis-auto">
                            <div className="flex flex-wrap justify-center sm:justify-end">
                                <div className="flex">
                                        {
                                            config.socialLinks.map((link, i) => (
                                                <div className="flex" key={i}>
                                                    <a className="text-slate-300 hover:text-white transition-all w-8 h-8 px-2" href={link.href}>{link.icon}</a>
                                                </div>
                                            ))
                                        }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="-mt-10">
                    <div className={`p-2 max-w-4xl mx-auto relative bg-gray-900 transition-all ease-in-out ${headerImage && showHeaderImage? 'h-60 opacity-100' : 'h-0 opacity-0'}`}>
                        {/* <img src={headerImage} className={`w-full max-h-64 rounded-lg object-cover border-0 transition-all duration-200 ease-in-out -z-20 ${headerImage? 'h-60 opacity-100' : 'h-0 opacity-0'}`} /> */}
                        {/* {headerImage && */}
                            <Image 
                                src={headerImage || DEMO_IMAGE} 
                                layout="fill" 
                                objectFit="cover" 
                                className={`w-full max-h-64 rounded-b-lg transition-opacity ease-in-out duration-500 ${headerImage ? 'opacity-100' : 'opacity-0'}`}
                            />
                        {/*  */}
                        <div className="w-full h-10 bottom-0 left-0">
                        <p className="text-white text-lg bottom-0 z-30">{title}</p>

                        </div>
                    </div> 
            </div>

            <main className="p-2 max-w-4xl mx-auto w-full flex-grow">

                <Breadcrumbs/>

                <div className={`transition-all duration-500 ${showContent? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    { showContent &&
                        cloneElement(
                            children, 
                            {
                                requestLayout: (details: LayoutConfigRequest) => {
                                    if (details.title) setTitle(details.title);
                                    if (details.image) setHeaderImage(details.image);
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
                                <p className=" dark:text-gray-300 text-gray-600 text-xs italic">Copyright&#169; Hamish Weir 2022</p>
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
    )
}

export default AppBaseLayout;

export const defineAppBaseLayout = (page: ReactElement) => {
    return(
      <AppBaseLayout>
        {page}
      </AppBaseLayout>
    )
}

export const defineAppBaseLayoutParams = (headerImage?: string) => {
    // eslint-disable-next-line react/display-name
    return (page: ReactElement) => (
        <AppBaseLayout defaultHeaderImage={headerImage}>
        {page}
        </AppBaseLayout>
    )
}

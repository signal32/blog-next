import Head from 'next/head'
import { defineLayout } from '../components/app/BaseLayout'
import { PageWithLayout } from '../components/app/LayoutApp'
import Button from '../components/common/Button'
import { useModalStore } from '../components/common/Modal'
import PostList from '../components/posts/PostList'
import { getAllPosts, Post, posts as yeet } from '../lib/posts'
import { Product, products } from '../lib/products'
import styles from './_styles/index.module.scss'
import Image from "next/image";

import { useState } from 'react'
import AboutHamish from '../components/AboutHamish'

interface BlogProps {
  posts: Post[],
  products: Product[],
  allContent: Post[],
  encodedEmail: string,
}

const Home: PageWithLayout<BlogProps> = (props) => {
    const modalStore = useModalStore();

    return (
        <div className='h-full w-full'>

            <Head>
                <title>Hamish Weir Blog: Home</title>
                <meta name="description" content="test"/>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div>
                <h3 className='text-center text-xl pb-3'>Latest Updates</h3>
                <PostList posts={props.allContent}/>
                <div className = { styles.columnContainer }>

                    {/* About */}
                    <AboutHamish encodedEmail={props.encodedEmail}/>

                    {/* Recent posts */}
                    <div className={styles.recentPostsCol}>
                        {/* <PostList posts={allContent}/> */}
                        <Image 
                            className='rounded-lg'
                            src='/graphics/hamish_weir_portrait.jpg' 
                            alt='me!' 
                            width='300' 
                            height='300'
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}

const HomeHero = () => (
    <div className={styles.heroContainer}>
        <div className={styles.heroLeftCol}>
            <Image 
                style={{ width: '70%', borderRadius: '1000px', marginBottom: '1.5rem', border: 'solid 2px white'}}
                objectFit='contain'
                src='/graphics/hamish_weir_portrait_square.jpg'
                width='100'
                height='100'
                alt='Portrait of Hamish Weir'
            />                
        </div>
        <div className={styles.heroRightCol}>
            <h1 className='sm:text-air text-white text-5xl font-semibold' style={{fontFamily: 'caveat'}}>Hamish Weir</h1>
            <h1 className='text-white text-xl font-medium'>Digital content creator</h1>

            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem'}}>
                <Button text='Software' href='/design'></Button>
                <Button text='Games' href='/simulation'></Button>
                <Button text='Photo'></Button>
            </div>
        </div>
    </div>
)

Home.layout = defineLayout({
    breadcrumbs: false,
    header: {
        type: 'component',
        component: <HomeHero/>
    }
})

export default Home

export const getStaticProps = async () => {
    const allPosts = await yeet.getAllDetailed()
    const allProducts = await products.getAllDetailed()
    const allContent = [...allPosts, ...allProducts]
        .filter(content => !!content.created)
        .sort((a, b) => {
            if (!a.created || !b.created) return 0
            return new Date(a.created).getTime() - new Date(b.created).getTime()
        })
        .reverse()
        //.slice(0,4)

    return ({
        props: {
            posts: allPosts,
            products: allProducts,
            allContent: allContent,
            encodedEmail: Buffer.from('hdweir@outlook.com', 'utf8').toString('base64')
        }
    })
}

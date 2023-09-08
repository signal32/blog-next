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

interface BlogProps {
  posts: Post[],
  products: Product[],
  allContent: Post[],
  encodedEmail: string,
}

const Home: PageWithLayout<BlogProps> = (props) => {
    const modalStore = useModalStore();

    const [emailText, setEmailText] = useState({
        hidden: true,
        text: `If you would like to get in touch with me for any reason, please click here to reveal my email.`
    }
        
    )

    const revealEmail = () => setEmailText({
        hidden: false,
        text: `If you would like to get in touch with me for any reason, please email me at ${atob(props.encodedEmail)}`
    })

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
                {/* Column container */}
                <div className = { styles.columnContainer }>

                    {/* About */}
                    <div className={ styles.aboutCol }>

                        <div>
                            <div style={{fontFamily: 'caveat'}} className='float-left pr-6'>
                                <p className=' font-bold text-5xl'>Hello!</p>
                            </div>
                            <p>I am Hamish, programmer, photographer, and general technology nerd from Scotland. Here you can find things I have created, discovered or otherwise found interesting. Aute dolor incididunt nulla nostrud ullamco eu laborum minim Lorem commodo anim pariatur.Sit proident esse deserunt eu proident ullamco ex labore non.Magna non reprehenderit eiusmod Lorem ipsum.
                            </p>
                        </div>

                    
                        <div>
                            <h3 className='text-lg font-semibold pt-2'>👋 Get in touch!</h3>
                            <p className={emailText.hidden ? 'cursor-pointer' : ''} onClick={revealEmail}>{emailText.text}</p>
                            <p>You can also find me on <a href='https://github.com/signal32'>Github</a> and <a>Instrgram</a></p>
                        </div>

                    </div>

                    

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
                style={{ width: '70%', borderRadius: '1000px', paddingBottom: '1.5rem'}}
                objectFit='contain'
                src='/graphics/hamish_weir_portrait_square.jpg'
                width='500'
                height='500'
                alt='Portrait of Hamish Weir'
            />                
        </div>
        <div className={styles.heroRightCol}>
            <h1 className='text-white text-5xl font-semibold' style={{fontFamily: 'caveat'}}>Hamish Weir</h1>
            <h1 className='text-white text-xl font-medium' >Digital content creator</h1>

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

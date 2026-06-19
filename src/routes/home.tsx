import { ContentLayout } from '../components/app/BaseLayout'
import PostList from '../components/posts/PostList'
import { posts as yeet } from '../lib/posts.server'
import { products } from '../lib/products.server'
import type { Route } from './+types/home'

import { A, H3 } from '#src/components/common/typography.tsx'
import { Link } from 'react-router'
import { websiteConfig } from './_app'

export default function Home({ loaderData }: Route.ComponentProps) {
    const props = loaderData.props

    return <ContentLayout header={{ type: 'component', component: <HomeHero /> }}>
        <div className='h-full w-full'>
            {/*<Head>
                <title>Hamish Weir Blog: Home</title>
                <meta name="description" content="test" />
                <meta name="darkreader-lock" />
                <link rel="icon" href="/favicon.ico" />
            </Head>*/}

            <div>
                <h3 className='text-center text-xl pb-3'>Latest Updates</h3>
                <PostList posts={props.allContent} />
                <div className={'flex gap-2'}>

                    {/* About */}
                    <div className='basis-2/3 grow text-lg'>
                        <div>
                            <div className='float-left pr-6'>
                                <p className='font-bold font-handwritten text-5xl'>Hello!</p>
                            </div>
                            <p>{websiteConfig.personalDescription}</p>
                            <p>On this site you can find some of my published projects, as well as updates on things I am currently working on.</p>
                        </div>
                        <div>
                            <H3 className='mt-4'>👋 Get in touch!</H3>
                            <p>If you would like to get in touch, please send me an e-mail and I shall be happy to hear from you. My contact details are <A><Link to={'/contact'}>here</Link></A>.</p>
                        </div>
                    </div>

                    {/* Recent posts */}
                    <div className={'not-sm:hidden'}>
                        {/*<PostList posts={props.allContent} />*/}
                        <img
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
    </ContentLayout>
}

const HomeHero = () => (
    <div
        style={{
            padding: '2.2rem',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundImage: `url('/graphics/hero_landscape.jpg')`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
        }}
    >
        <div
            className='flex flex-col sm:flex-row justify-center items-center text-center'
        >
            <img
                className='w-3/4 max-w-sm rounded-full mb-2 border-3 border-white shadow-2xl'
                // objectFit='contain'
                src='/graphics/hamish_weir_portrait_square.jpg'
                width='100'
                height='100'
                alt='Portrait of Hamish Weir'
            />
        </div>
        <div
            style={{
                flex: '1 0',
                // textAlign: 'right',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
            }}
        >
            <h1 className=' text-white text-5xl font-black font-handwritten'>Hamish Weir</h1>
            <h1 className='text-white text-xl font-medium'>{websiteConfig.personalTagline}</h1>

            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem' }}>
                {/*<Button text='Software' href='/design'></Button>
                <Button text='Games' href='/simulation'></Button>
                <Button text='Photo'></Button>*/}
            </div>
        </div>
    </div>
)

export const loader = async () => {
    // throw new Error('ahh')
    const allPosts = await yeet.getAllDetailed()
    const allProducts = await products.getAllDetailed()
    const allContent = [...allPosts, ...allProducts]
        .filter(content => !!content.created && content.public)
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
        }
    })
}

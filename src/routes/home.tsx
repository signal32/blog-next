import { ContentLayout } from '../components/app/BaseLayout'
import { useModalStore } from '../components/common/Modal'
import PostList from '../components/posts/PostList'
import { Post, posts as yeet } from '../lib/posts'
import { Product, products } from '../lib/products'
import type { Route } from './+types/home'

import AboutHamish from '../components/AboutHamish'

interface BlogProps {
    posts: Post[],
    products: Product[],
    allContent: Post[],
    encodedEmail: string,
}

export default function Home({ loaderData }: Route.ComponentProps) {
    const modalStore = useModalStore();
    const props = loaderData.props

    // return <div className='bg-red-700'>hi</div>

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
                    <AboutHamish encodedEmail={props.encodedEmail} />

                    {/* Recent posts */}
                    <div className={'flex-1'}>
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
            backgroundImage: `url('/graphics/hero_landscape.jpg');`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
        }}
    >
        <div
            style={{
                flex: '1 0 40%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
            }}
        >
            <img
                style={{ width: '70%', borderRadius: '1000px', marginBottom: '1.5rem', border: 'solid 2px white' }}
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
            <h1 className='sm:text-air text-white text-5xl font-semibold' style={{ fontFamily: 'caveat' }}>Hamish Weir</h1>
            <h1 className='text-white text-xl font-medium'>Digital content creator</h1>

            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem' }}>
                {/*<Button text='Software' href='/design'></Button>
                <Button text='Games' href='/simulation'></Button>
                <Button text='Photo'></Button>*/}
            </div>
        </div>
    </div>
)

export const loader = async () => {
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

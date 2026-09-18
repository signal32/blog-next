import { ContentLayout } from '../components/app/BaseLayout'
import PostList from '../components/posts/PostList'
import { posts as yeet } from '../lib/posts.server'
import { products } from '../lib/products.server'
import type { Route } from './+types/home'

import { A, H1, H3, H4 } from '#src/components/common/typography.tsx'
import { Button } from '#src/components/ui/button.tsx'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '#src/components/ui/carousel.tsx'
import { cn } from 'cn'
import Autoplay from "embla-carousel-autoplay"
import { Link } from 'react-router'
import { websiteConfig } from './_app'


export default function Home({ loaderData }: Route.ComponentProps) {
    const props = loaderData.props

    return <ContentLayout
        header={{ type: 'component', component: <HomeHero />, noClip: true }}
        headerTitle='Software and railway simulation developer'
    >
        <div className='h-full w-full'>
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

const CAROSEL_ITEMS = [
    {
        background: 'https://s3.finch.hamishweir.uk/public/rails_north_east/dava/dev/scenery_stream_01.jpg',
        textBackgroundColour: '#293126da',
        heading: 'The Dava Railway',
        subheading: 'Rugged and remote. A challenge for the most seasoned driver. Coming soon to Train Simulator.',
        actions: [{
            title: 'Read the latest update',
            href: '/posts/dava-dev-update-01'
        }]
    },
    {
        background: 'https://s3.finch.hamishweir.uk/shop-public/sign_images/signs_all_1-small.jpg',
        heading: 'Custom Station Signs',
        subheading: 'Instantly create your own station signage for Train Simulator.',
        actions: [
            {
                title: 'Build now!',
                href: '/products/Train-Simulator-Classic-Custom-Signage'
            },
            {
                title: 'Bespoke asset creation',
                href: '/simulation#bespoke-scenery'
            }
        ]
    },
    {
        background: '/graphics/speyside_line/Screenshot_SB-The-Speyside-Line_57.24829-3.75247_14-01-56-1920x1080.jpg',
        heading: 'The Speyside Line',
        subheading: "Travel back in time to revisit the sights and sounds of Scotland's Whisky country by train.",
        actions: [{
            title: 'Go to downloads',
            href: '/products/speyside_line'
        }]
    },
]

const HomeHero = () => (
    <Carousel opts={{loop: true }} plugins={[Autoplay({delay: 7000})]}>
        <CarouselContent className='gap-5'>
            {CAROSEL_ITEMS.map(item => <CarouselItem>
                <div
                    className='h-96 flex rounded-2xl overflow-clip'
                    style={{
                        // padding: '2.2rem',
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundImage: `url('${item.background}')`,
                    }}
                >
                    <div
                        className={cn(
                            'flex flex-col justify-center text-white p-4 bg-ocean/80',
                            'self-end basis-full',
                            'sm:h-full sm:self-start sm:basis-sm'
                        )}
                        style={{ backgroundColor: item.textBackgroundColour }}>
                        <H1 className='pt-0'>{item.heading}</H1>
                        <H4>{item.subheading}</H4>

                        <div className='flex gap-2 pt-4'>
                            {item.actions?.map((action, index) => <Button key={index} variant={index === 0 ? 'outline' : 'link'}>
                                <Link to={action.href}>{ action.title }</Link>
                            </Button>)}
                        </div>
                    </div>
                </div>
            </CarouselItem>)}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
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

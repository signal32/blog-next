import Head from 'next/head'
import { defineLayout } from '../components/app/BaseLayout'
import { PageWithLayout } from '../components/app/LayoutApp'
import Button from '../components/common/Button'
import { useModalStore } from '../components/common/Modal'
import PostList from '../components/posts/PostList'
import { getAllPosts, Post } from '../lib/posts'
import { Product, products } from '../lib/products'
import styles from './_styles/index.module.scss'

interface BlogProps {
  posts: Post[],
  products: Product[],
}

const Home: PageWithLayout<BlogProps> = (props) => {
    const modalStore = useModalStore();

    const allContent = [
        ...props.posts,
        ...props.products,
    ].sort((a, b) => {
        if (!a.created && !b.created) return 0
        if (!a.created) return 1
        if (!b.created) return -1
        else return a.created?.getTime() - b.created?.getDate()
    }).slice(0,4)

    return (
        <div className='h-full w-full'>

            <Head>
                <title>Hamish Weir Blog: Home</title>
                <meta name="description" content="test"/>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div>
                {/* Hero images */}
                <div className = { styles.heroContainer }>
                    {/* TODO */}
                </div>

                {/* Column container */}
                <div className = { styles.columnContainer }>

                    {/* About */}
                    <div className={ styles.aboutCol }>
                        <p>About</p>
                        <div className={ styles.contactDetailsContainer }>
                            <h3>Get in touch</h3>
                        </div>
                    </div>

                    {/* Recent posts */}
                    <div className={styles.recentPostsCol}>
                        <PostList posts={allContent}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

Home.layout = defineLayout({
    breadcrumbs: false,
})

export default Home

export const getStaticProps = async () => {

    const allPosts = getAllPosts()

    const allProducts = await Promise.all(products.getAll()
        .slice(0,20)
        .map(async descriptor => await products.getById(descriptor.id))
    )

    return ({
        props: {
            posts: allPosts,
            products: allProducts,
        }
    })
}

import Head from 'next/head'
import { defineLayout } from '../components/app/BaseLayout'
import { PageWithLayout } from '../components/app/LayoutApp'
import Button from '../components/common/Button'
import { useModalStore } from '../components/common/Modal'
import PostList from '../components/posts/PostList'
import { getAllPosts, Post } from '../lib/posts'
import { Product, products } from '../lib/products'
import styles from './_styles/index.scss'

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
  })

  return (
    <div className='h-full w-full'>

      <Head>
        <title>Hamish Weir Blog: Home</title>
        <meta name="description" content="test"/>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <h1 className='text-white' onClick={() => modalStore.pushModal(<Button text='hello world'/>)}>Content placeholder</h1>
        
        <PostList posts={props.posts}/>
        <div>{ allContent.map(item => (
          <div key={item.slug}>hello{item.slug}{item.fileName}</div>
        ))}</div>
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

  const allProducts = products.getAll()
    .slice(0,20)
    .map(descriptor => products.getById(descriptor.id))
    .filter(product => product === undefined)

  return ({
    props: {
      posts: allPosts,
      products: allProducts,
    }
  })
}

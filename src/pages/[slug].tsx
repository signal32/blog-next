import Markdown from 'react-markdown';
import { LayoutRequestProps, defineLayout } from "../components/app/BaseLayout";
import { PageWithLayout } from '../components/app/LayoutApp';
import DateDisplay from "../components/common/DateDisplay";
import { pages } from '../lib/pages';
import { Post, posts } from "../lib/posts";
import markdownStyles from '../styles/md.module.scss';

interface PostProps extends LayoutRequestProps {
    post: Post
    morePosts: Post[]
    preview?: boolean
}

const SimplePage: PageWithLayout<PostProps> = ({post}) => {

    return (
        <div className="text-white">
            <div className="mb-4 p-3 mx-auto dark:bg-gray-900 bg-gray-300 bg-opacity-75 rounded-xl">
                { post.created && <DateDisplay date={post.created.toString()}/> }
                <Markdown className={markdownStyles.markdown}>{post.content}</Markdown>
            </div>
        </div>
    )
}

SimplePage.layout = defineLayout(props => ({
    headerTitle: props.post.name,
    header: props.post.coverImage
        ? {
            type: 'image',
            href: props.post.coverImage ?? ''
        }
        : undefined
}))

export default SimplePage;

type Params = {
    params: {
      slug: string
    }
}

export async function getStaticProps({ params }: Params) {
    const post = await posts.getBySlug(params.slug)

    return {
        props: {
            post,
            morePosts: [],
            preview: false,
        }
    }
}
    
export async function getStaticPaths() {
    const pageDescriptors = pages.getAll()

    return {
        paths: pageDescriptors.map((post) => ({
            params: {
                slug: post.slug,
            },
        })),
        fallback: false,
    }
}

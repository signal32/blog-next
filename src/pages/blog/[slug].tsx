import Markdown from 'react-markdown';
import { LayoutRequestProps, defineLayout } from "../../components/app/BaseLayout";
import { PageWithLayout } from '../../components/app/LayoutApp';
import DateDisplay from "../../components/common/DateDisplay";
import { Post, posts } from "../../lib/posts";
import markdownStyles from '../../styles/md.module.scss';

interface PostProps extends LayoutRequestProps {
    post: Post
    morePosts: Post[]
    preview?: boolean
}

const BlogPost: PageWithLayout<PostProps> = ({post}) => {

    return (
        <div className="text-white">
            { post.created && <DateDisplay date={new Date(post.created)}/> }
            <Markdown className={markdownStyles.markdown}>{post.content}</Markdown>
        </div>
    )
}

BlogPost.layout = defineLayout(props => ({
    headerTitle: props.post.name,
    header: props.post.coverImage
        ? {
            type: 'image',
            href: props.post.coverImage ?? ''
        }
        : undefined
}))

export default BlogPost;

type Params = {
    params: {
      slug: string
    }
}

export async function getStaticProps({ params }: Params) {
    const post = await posts.getBySlug(params.slug)

    return {
        props: {
            post: {
                ...post,
            },
            morePosts: [],
            preview: false,
        }
    }
}

export async function getStaticPaths() {
    const allPosts = posts.getAll()

    return {
        paths: allPosts.map((post) => {
            return {
                params: {
                    slug: post.slug,
                },
            }
        }),
        fallback: false,
    }
}


import { LayoutRequestProps, defineLayout } from "../../components/app/BaseLayout";
import { PageWithLayout } from '../../components/app/LayoutApp';
import DateDisplay from "../../components/common/DateDisplay";
import { Markdown } from '../../components/common/Markdown';
import { Text } from '../../components/common/Text';
import { Post, posts } from "../../lib/posts";
import markdownStyles from '../../styles/md.module.scss';

interface PostProps extends LayoutRequestProps {
    post: Post
    morePosts: Post[]
    preview?: boolean
}

const BlogPost: PageWithLayout<PostProps> = ({post}) => {
    return (
        <Text>
            { post.created && <DateDisplay date={new Date(post.created)}/> }
            <Markdown content={post.content ?? ''} />
        </Text>
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

import { useEffect } from "react";
import DateDisplay from "../../components/common/DateDisplay";
import { LayoutRequestProps, defineLayout } from "../../components/app/BaseLayout";
import markdownToHtml from "../../lib/markdown";
import { getAllPosts, getPostBySlug, Post, posts } from "../../lib/posts";
import { PageWithLayout } from '../../components/app/LayoutApp';

interface PostProps extends LayoutRequestProps {
    post: Post
    morePosts: Post[]
    preview?: boolean
}

const BlogPost: PageWithLayout<PostProps> = ({post}) => {

    return (
        <div className="text-white">
            {
                post.created && <DateDisplay date={new Date(post.created)}/>
            }
            <div className="text-slate-200 hame-markdown" dangerouslySetInnerHTML={{__html: post.content || ''}} />
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
    const content = await markdownToHtml(post?.content || '')

    return {
        props: {
            post: {
                ...post,
                content,
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

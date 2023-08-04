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
            <div className="mb-4 p-3 mx-auto dark:bg-gray-900 bg-gray-300 bg-opacity-75 rounded-xl">
                <h1 className=" dark:text-gray-100 text-gray-800 text-2xl">{ post.title }</h1>
                {
                    post.date && <DateDisplay date={post.date}/>
                }
                <div className="text-slate-200 hame-markdown" dangerouslySetInnerHTML={{__html: post.content || ''}} />
            </div>
        </div>
    )
}

BlogPost.layout = defineLayout(props => ({
    headerTitle: props.post.title,
    headerImage: props.post.coverImage,
}));

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

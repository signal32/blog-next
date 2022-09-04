import { useEffect } from "react";
import DateDisplay from "../../components/common/DateDisplay";
import { LayoutRequestProps, useAppBaseLayoutParams } from "../../components/layouts/AppBaseLayout";
import markdownToHtml from "../../lib/markdown";
import { getAllPosts, getPostBySlug, Post } from "../../lib/posts";
import { NextPageWithLayout } from "../_app";

interface PostProps extends LayoutRequestProps {
    post: Post
    morePosts: Post[]
    preview?: boolean
}

const BlogPost: NextPageWithLayout<PostProps> = ({post, requestLayout: update}) => {
    useEffect(() => update({title: post.title, image: post.coverImage}));

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

BlogPost.getLayout = useAppBaseLayoutParams();
export default BlogPost;

type Params = {
    params: {
      slug: string
    }
}

export async function getStaticProps({ params }: Params) {
    const post = getPostBySlug(params.slug, [
        'title',
        'date',
        'slug',
        'author',
        'content',
        'ogImage',
        'coverImage',
    ]);

    const content  = await markdownToHtml(post?.content || '');
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
    const posts = getAllPosts(['slug']);
    return {
        paths: posts.map((post) => {
          return {
            params: {
              slug: post.slug,
            },
          }
        }),
        fallback: false,
    }
}

import Button from "../../components/common/Button";
import { useAppBaseLayout } from "../../components/layouts/AppBaseLayout";
import PostList from "../../components/posts/PostList";
import { getAllPosts, Post } from "../../lib/posts";
import { NextPageWithLayout } from "../_app";

const POSTS_PER_PAGE = 10;

interface BlogProps {
    posts: Post[],
}

const Blog: NextPageWithLayout<BlogProps> = (props) => {
    return (
        <div className="text-white">
            <PostList posts={props.posts}/>
            <Button text="Older posts" href="/"/>
        </div>
    )
}

Blog.getLayout = useAppBaseLayout;

export async function getStaticProps() {
    const posts = await getAllPosts();

    return {
        props: {
            posts: posts
        }
    }
}

// export async function getStaticPaths() {
//     const postsCount = getAllPosts([]).length;
//     const pageCount = postsCount / POSTS_PER_PAGE;
//     const paths = [];

//     for (let i = 0; i < pageCount; i++) {
//         paths.push({
//             params: {
//                 index: i
//             }
//         })
//     }

//     return {
//         paths,
//         fallback: false,
//     }
// }

export default Blog;
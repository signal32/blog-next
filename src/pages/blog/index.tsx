import Button from "../../components/common/Button";
import { defineLayout } from "../../components/app/BaseLayout";
import PostList from "../../components/posts/PostList";
import { getAllPosts, Post } from "../../lib/posts";
import { PageWithLayout } from '../../components/app/LayoutApp';

const POSTS_PER_PAGE = 10;

interface BlogProps {
    posts: Post[],
}

const Blog: PageWithLayout<BlogProps> = (props) => {
    return (
        <div className="text-white">
            <PostList posts={props.posts}/>
            <Button text="Older posts" href="/"/>
        </div>
    )
}

Blog.layout = defineLayout();

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
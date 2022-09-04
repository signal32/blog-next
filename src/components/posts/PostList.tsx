import { Post } from "../../lib/posts";
import PostItem from "./PostItem";

export interface PostListProps {
    posts: Post[],
}

const PostList = (props: PostListProps) => {
    return (
        <div className="text-white">
            {
                props.posts.map((item, i) => {
                    return (
                        <PostItem post={item} key={i}/>
                    )
                })
            }
        </div>
    )
}

export default PostList;

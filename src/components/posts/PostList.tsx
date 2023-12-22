import { Post } from "../../lib/posts";
import HorizontalScrollList from '../common/HorizontalScrollList';
import PostItem from "./PostItem";

export interface PostListProps {
    posts: Post[],
}

const PostList = (props: PostListProps) => {
    return (
        <div>
            <HorizontalScrollList>
                {
                    props.posts.map((item, i) => {
                        return (
                            <div key={i} className=' w-72 flex-shrink-0'>
                                <PostItem post={item} />
                            </div>
                        )
                    })
                }
            </HorizontalScrollList>
        </div>
    )
}

export default PostList;

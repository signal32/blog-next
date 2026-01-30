import { useNavigate } from "react-router";
import { Post } from "../../lib/posts";
import { Card } from "../card";
import HorizontalScrollList from '../common/HorizontalScrollList';
import PostItem from "./PostItem";

export interface PostListProps {
    posts: Post[],
}

const PostList = (props: PostListProps) => {
    const navigate = useNavigate()

    return (
        <div>
            <HorizontalScrollList>
                {
                    props.posts.map((item, i) => {
                        return (
                            <div key={i} className=' w-72 shrink-0'>
                                <PostItem post={item} />
                            </div>
                        )
                    })
                }
                <div className="w-72 shrink-0 cursor-pointer hover:underline" onClick={() => navigate('/blog')}>
                    <Card>{{
                        content: <p className="text-center font-bold text-xl h-full mt-40">See more posts</p>
                    }}</Card>
                </div>

            </HorizontalScrollList>
        </div>
    )
}

export default PostList;

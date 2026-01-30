import { Link } from "react-router";
import { Post as Content } from "../../lib/posts";
import DateDisplay from "../common/DateDisplay";
import { useModalStore } from '../common/Modal';
import { Button } from "../ui/button";
import { Card } from "../card";

const TEMP_IMAGE = `https://images.pexels.com/photos/4215110/pexels-photo-4215110.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`;

interface PostItemProps {
    post: Content,
    showImage?: boolean;
}

const PostItem = ({ post, showImage = true }: PostItemProps) => {
    const modals = useModalStore()

    return <Card>{{
        content: <>
            {
                showImage && post.coverImage &&
                <img className="object-cover h-40 w-full overflow-clip rounded-xl mt-1" src={post.coverImage}
                    onClick={() => modals.pushModal(<img className="object-cover overflow-clip rounded-xl w-full p-0" src={post.coverImage} />)}
                />
            }

            <div className="flex justify-between items-start sm:flex-col">
                <div className="w-full text-xl font-medium dark:text-slate-100 text-slate-800">{post.name}</div>
                {
                    post.created &&
                    <div className="">
                        <DateDisplay date={new Date(post.created)} />
                    </div>
                }

            </div>

            {
                post.excerpt &&
                <p className="dark:text-slate-300 text-slate-700">{(post.excerpt)}</p>
            }
        </>,
        footer: <Button asChild className="w-full">
            <Link to={`${post.baseUrl}/${post.slug}`}>
                Read more
            </Link>
        </Button>
    }}</Card>
}

export default PostItem;

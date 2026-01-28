import { Post as Content } from "../../lib/posts";
import { Button } from "../ui/button";
import DateDisplay from "../common/DateDisplay";
import { useModalStore } from '../common/Modal';
import { Link } from "react-router";

const TEMP_IMAGE = `https://images.pexels.com/photos/4215110/pexels-photo-4215110.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`;

interface PostItemProps {
    post: Content,
    showImage?: boolean;
}

const PostItem = ({ post, showImage = true }: PostItemProps) => {
    const modals = useModalStore()

    return (
        <div className="h-full w-full dark:bg-gray-800 bg-gray-200 rounded-xl shadow-lg flex flex-col justify-between">


            <div className="px-1 pt-0 pb-1 max-h-80 overflow-clip">

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

            </div>


            <Button asChild className="m-1 bottom-0 left-0">
                <Link to={`${post.baseUrl}/${post.slug}`}>
                    Read more
                </Link>
            </Button>
        </div>
    )
}

export default PostItem;

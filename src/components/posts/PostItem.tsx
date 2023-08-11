import Link from "next/link";
import { Post as Content } from "../../lib/posts";
import {FaCalendar} from 'react-icons/fa'
import Button from "../common/Button";
import DateDisplay from "../common/DateDisplay";
import { useModalStore } from '../common/Modal';

const TEMP_IMAGE = `https://images.pexels.com/photos/4215110/pexels-photo-4215110.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`;

interface PostItemProps {
    post: Content,
    showImage?: boolean;
}

const PostItem = ({post, showImage = true}: PostItemProps) => {
    const modals = useModalStore()

    return (
        <div className="mb-4 mx-auto dark:bg-gray-800 bg-gray-200 rounded-xl shadow-lg">

            {
                showImage && post.coverImage &&
                <img className="object-cover h-40 w-full overflow-clip rounded-xl p-2" src={post.coverImage} 
                    onClick={() => modals.pushModal(<img className="object-cover h-4/5 w-4/5 overflow-clip rounded-xl p-2" src={post.coverImage}  />)}
                />
            }

            <div className="px-3 pt-0 pb-1">

                <div className="flex justify-between items-center sm:justify-start">
                    <div className="w-3/4 text-xl font-medium dark:text-slate-100 text-slate-800">{post.title}</div>

                    {
                        post.created &&
                        <div className="mr-0 ml-auto">
                            <DateDisplay date={post.created.toString()}/>
                        </div>
                    }

                </div>

                {
                    post.excerpt &&
                    <p className="dark:text-slate-300 text-slate-700">{(post.excerpt)}</p>
                }

                <div className="bottom-0 left-0 cursor-pointer">
                    <Button text="Read More" href={`${post.baseUrl}/${post.slug}`}/>
                </div>


            </div>
        </div>
    )
}

export default PostItem;
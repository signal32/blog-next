import { Link } from "react-router";
import DateDisplay from "../common/DateDisplay";
import { useModalStore } from '../common/Modal';
import { Button } from "../ui/button";
import { Card } from "../card";
import { Content } from "#src/lib/content.server.ts";
import { formatCurrency } from "#src/lib/utils.ts";
import { isProduct, useProductPrice } from "#src/routes/product/product.tsx";
import { Loader2 } from "lucide-react";

interface PostItemProps {
    post: Content,
    showImage?: boolean;
}

const PostItem = ({ post, showImage = true }: PostItemProps) => {
    const postIsProduct = isProduct(post)
    const modals = useModalStore()
    const productPrice = useProductPrice(postIsProduct ? post : undefined)

    return <Card>{{
        content: <>
            {
                showImage && post.coverImage &&
                <img className="object-cover w-full max-h-40 overflow-clip rounded-xl mt-1" src={post.coverImage}
                    onClick={() => modals.pushModal(<img className="object-cover overflow-clip rounded-xl w-full p-0" src={post.coverImage} />)}
                />
            }

            <div className="flex justify-between items-start flex-col">
                <div className="w-full text-xl font-medium dark:text-slate-100 text-slate-800 pb-1">{post.name}</div>
                {
                    post.created &&
                    <DateDisplay date={new Date(post.created)} />
                }

            </div>

            {
                post.excerpt &&
                <p className="dark:text-slate-300 text-slate-700">{(post.excerpt)}</p>
            }
        </>,
        footer: <Button asChild className="w-full">
            <Link to={`${post.baseUrl}/${post.slug}`}>
                {postIsProduct
                    ? <div className="w-full flex justify-between">
                        <p>More information</p>
                        {
                            productPrice !== undefined
                                ? <p className="font-semibold">{productPrice.available ? formatCurrency(productPrice.price) : 'Unavailable'}</p>
                                : <Loader2 className="animate-spin" />
                        }
                    </div>
                    : 'Read more'}
            </Link>
        </Button>
    }}</Card>
}

export default PostItem;

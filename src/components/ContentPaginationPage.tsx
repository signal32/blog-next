import { Content, ListPageContent } from "#src/lib/content.server.ts"
import { Link } from "react-router"
import PostItem from "./posts/PostItem"
import { Button } from "./ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

export function ContentPaginationPage<T extends Content>(props: ListPageContent<T>) {
    return <div>
        {
            props.content.map((item, i) => {
                return (
                    <div key={i} className='w-full pb-2'>
                        <PostItem post={item} />
                    </div>
                )
            })
        }

        <div className="flex justify-between">
            <Button
                variant='link'
                disabled={!props.prevPagePath}
            >
                {props.prevPagePath &&
                    <Link
                        to={props.prevPagePath}
                        className="inline-flex gap-2"
                    >
                        <ArrowLeft /> Newer posts
                    </Link>
                }
            </Button>
            <p>Page {props.page} of {props.totalPages}</p>
            <Button
                variant='link'
                disabled={props.page === props.totalPages}
            >
                {props.nextPagePath &&
                    <Link
                        to={props.nextPagePath}
                        className="inline-flex gap-2"
                    >
                        Older posts <ArrowRight />
                    </Link>
                }
            </Button>
        </div>
    </div>
}

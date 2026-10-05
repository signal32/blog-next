import { Content, ListPageContent } from "#src/lib/content.server.ts"
import { ArrowLeft, ArrowRight, X } from "lucide-react"
import { Link } from "react-router"
import { A, H2, H4 } from "./common/typography"
import PostItem from "./posts/PostItem"
import { Button } from "./ui/button"

export function ContentPaginationPage<T extends Content>(props: { content: ListPageContent<T>, title: string }) {
    return <div>
        <H2 className="py-0">{props.title}</H2>
        {props.content.currentTag &&
            <div className="inline-flex gap-2 items-center">
                <H4>Tagged with <u>{props.content.currentTag}</u></H4>
                <Button size="icon-xs" variant="outline"><Link to={props.content.basePath}><X /></Link></Button>
            </div>
        }

        <div className="flex gap-4 pt-4">
            <div className="basis-2/3">

                {
                    props.content.content.map((item, i) => {
                        return (
                            <div key={i} className='w-full pb-2'>
                                <PostItem post={item} />
                            </div>
                        )
                    })
                }

                <div className="flex justify-between items-center">
                    <Button
                        variant='link'
                        disabled={!props.content.prevPagePath}
                    >
                        {props.content.prevPagePath &&
                            <Link
                                to={props.content.prevPagePath}
                                className="inline-flex gap-2"
                            >
                                <ArrowLeft /> Newer posts
                            </Link>
                        }
                    </Button>
                    <p>Page {props.content.page} of {props.content.totalPages}</p>
                    <Button
                        variant='link'
                        disabled={props.content.page === props.content.totalPages}
                    >
                        {props.content.nextPagePath &&
                            <Link
                                to={props.content.nextPagePath}
                                className="inline-flex gap-2"
                            >
                                Older posts <ArrowRight />
                            </Link>
                        }
                    </Button>
                </div>
            </div>

            <div>
                <H4>Tags</H4>
                <ul>
                    {props.content.tags.map(({ tag, path, count }) => <li><A><Link to={path}>{`${tag} (${count})`}</Link></A></li>)}
                </ul>

                {/*TODO: <H4 className="pt-4">Content</H4>
                <ul>
                    <li><A><Link to={'/'}>All</Link></A></li>
                    <li><A><Link to={'/'}>Posts</Link></A></li>
                    <li><A><Link to={'/'}>Products</Link></A></li>
                </ul>*/}
            </div>
        </div>
    </div>
}

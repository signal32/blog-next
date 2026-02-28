import { useSearchParams } from "react-router";
import PostItem from "#src/components/posts/PostItem";
import { Button } from "#src/components/ui/button";
import { ContentLayout } from "../../components/app/BaseLayout";
import { posts as p } from "../../lib/posts.server";
import { Route } from "./+types/index";
import { ArrowLeft, ArrowRight } from "lucide-react";

function parseParams(params: URLSearchParams) {
    const pageParam = params.get('page')
    const sizeParam = params.get('size')

    const page = pageParam !== null ? +pageParam : 0
    const size = sizeParam !== null ? +sizeParam : 3

    return { page, size }
}

export default function ({ loaderData }: Route.ComponentProps) {
    const [_, setParams] = useSearchParams()

    const incrementPage = (d: number) => {
        setParams(prev => {
            prev.set('page', (loaderData.page + d).toString())
            return prev
        })
    }

    return <ContentLayout>
        <div>
            {
                loaderData.posts.map((item, i) => {
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
                    onClick={() => incrementPage(-1)}
                    disabled={loaderData.page === 0}
                >
                    <div className="inline-flex gap-2"><ArrowLeft /> Newer posts</div>
                </Button>
                <p>Page {loaderData.page + 1} of {loaderData.totalPages}</p>
                <Button
                    variant='link'
                    onClick={() => incrementPage(+1)}
                    disabled={loaderData.page === loaderData.totalPages - 1}
                >
                    <div className="inline-flex gap-2">Older posts <ArrowRight /></div>
                </Button>
            </div>
        </div>
    </ContentLayout>
}

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url)
    const { page, size } = parseParams(url.searchParams)

    const allPosts = await p.getAllDetailed()
    const totalPosts = allPosts.length
    const totalPages = Math.round(totalPosts / size)

    const startIndex = page * size
    const endIndex = startIndex + size
    const posts = allPosts.slice(startIndex, endIndex)

    return { posts, totalPosts, totalPages, page, size }
}

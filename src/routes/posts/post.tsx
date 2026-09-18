
import { redirect } from "react-router";
import { ContentLayout } from "../../components/app/BaseLayout";
import DateDisplay from "../../components/common/DateDisplay";
import { Markdown } from '../../components/common/Markdown';
import { type Post, posts } from "../../lib/posts.server";
import { Route } from "./+types/post";
import { P } from "#src/components/common/typography.tsx";

export default function Post({ loaderData: { post } }: Route.ComponentProps) {
    return <ContentLayout
        headerTitle={post.name}
        header={post.coverImage ? { type: 'image', href: post.coverImage } : undefined}
    >
        <P>
            {post.created && <DateDisplay date={new Date(post.created)} />}
            <Markdown content={post.content ?? ''} />
        </P>
    </ContentLayout>
}

export async function loader({ params }: Route.LoaderArgs) {
    const slug = params['slug']
    if (!slug) return redirect("/posts/page", { status: 302 })

    const post = await posts.getBySlug(slug)
    if (!post) throw new Response("Not Found", { status: 404 })

    return {
        post: post,
        morePosts: [],
        preview: false,
    }
}

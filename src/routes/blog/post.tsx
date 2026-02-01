
import { redirect } from "react-router";
import { ContentLayout, LayoutRequestProps } from "../../components/app/BaseLayout";
import DateDisplay from "../../components/common/DateDisplay";
import { Markdown } from '../../components/common/Markdown';
import { Text } from '../../components/common/Text';
import { type Post, posts } from "../../lib/posts.server";
import { Route } from "./+types/post";
// import markdownStyles from '../../styles/md.module.scss';

interface PostProps extends LayoutRequestProps {
    post: Post
    morePosts: Post[]
    preview?: boolean
}

export default function Post({ loaderData: { post } }: Route.ComponentProps) {
    return <ContentLayout
        headerTitle={post.name}
        header={post.coverImage ? { type: 'image', href: post.coverImage } : undefined}
    >
        <Text>
            {post.created && <DateDisplay date={new Date(post.created)} />}
            <Markdown content={post.content ?? ''} />
        </Text>
    </ContentLayout>
}

export async function loader({ params }: Route.LoaderArgs) {
    const post = await posts.getBySlug(params.slug)
    if (!post) return redirect("/", 404)

    return {
        post: post,
        morePosts: [],
        preview: false,
    }
}

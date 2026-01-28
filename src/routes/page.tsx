import { redirect } from 'react-router';
import { ContentLayout } from "../components/app/BaseLayout";
import DateDisplay from "../components/common/DateDisplay";
import { Markdown } from '../components/common/Markdown';
import { Text } from '../components/common/Text';
import { posts } from "../lib/posts";
import { Route } from './+types/page';

export default function Page({ loaderData: { post } }: Route.ComponentProps) {
    return <ContentLayout
        headerTitle={post.name}
        header={post.coverImage
            ? {
                type: 'image',
                href: post.coverImage ?? ''
            }
            : undefined}
    >
        <Text>{post.created && <DateDisplay date={post.created.toString()} />}</Text>
        <Markdown content={post.content ?? ''} />
    </ContentLayout>
}

export async function loader({ params }: Route.LoaderArgs) {
    const post = await posts.getBySlug(params.slug)
    if (!post) return redirect('/', 404)
    return { post }
}

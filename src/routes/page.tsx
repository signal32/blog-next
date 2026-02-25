import { pages } from 'src/lib/pages.server';
import { ContentLayout } from "../components/app/BaseLayout";
import DateDisplay from "../components/common/DateDisplay";
import { Markdown } from '../components/common/Markdown';
import { Text } from '../components/common/Text';
import { Route } from './+types/page';

export default function Page({ loaderData: { page } }: Route.ComponentProps) {
    return <ContentLayout
        headerTitle={page.name}
        header={page.coverImage
            ? {
                type: 'image',
                href: page.coverImage ?? ''
            }
            : undefined}
    >
        <Text>{page.created && <DateDisplay date={page.created.toString()} />}</Text>
        <Markdown content={page.content ?? ''} />
    </ContentLayout>
}

export async function loader({ params }: Route.LoaderArgs) {
    const slug = params['slug']
    if (!slug) throw new Response("No slug", { status: 404 })
    const page = await pages.getBySlug(slug)
    if (!page) throw new Response("Not found", { status: 404 })
    return {
        page
    }
}

import { ContentPaginationPage } from "#src/components/ContentPaginationPage.tsx";
import { ContentLayout } from "../../components/app/BaseLayout";
import { postRouting } from "../../lib/posts.server";
import { Route } from "./+types/list";

export default function ({ loaderData }: Route.ComponentProps) {
    return <ContentLayout headerTitle="Blog">
        <ContentPaginationPage title="Blog Posts" content={loaderData} />
    </ContentLayout>
}

export async function loader(args: Route.LoaderArgs) {
    return postRouting.loadPage(args)
}

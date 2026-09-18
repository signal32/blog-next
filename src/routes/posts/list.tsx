import { ContentPaginationPage } from "#src/components/ContentPaginationPage.tsx";
import { ContentLayout } from "../../components/app/BaseLayout";
import { posts } from "../../lib/posts.server";
import { Route } from "./+types/list";

export default function ({ loaderData }: Route.ComponentProps) {
    return <ContentLayout headerTitle="Blog">
        <ContentPaginationPage {...loaderData} />
    </ContentLayout>
}

export async function loader(args: Route.LoaderArgs) {
    return posts.loadPage(args)
}

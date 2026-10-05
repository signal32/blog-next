import { ContentPaginationPage } from "#src/components/ContentPaginationPage.tsx"
import { all } from "#src/lib/all.server.ts"
import { ContentLayout } from "../../components/app/BaseLayout"
import { Route } from "./+types/list"

export default function ({ loaderData }: Route.ComponentProps) {
    return <ContentLayout headerTitle="All Content">
        <ContentPaginationPage title="All Content" content={loaderData} />
    </ContentLayout>
}

export async function loader(args: Route.LoaderArgs) {
    return all.loadPage(args)
}

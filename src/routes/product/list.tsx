import { ContentPaginationPage } from "#src/components/ContentPaginationPage.tsx";
import { products } from "#src/lib/products.server.ts";
import { ContentLayout } from "../../components/app/BaseLayout";
import { Route } from "./+types/list";

export default function ({ loaderData }: Route.ComponentProps) {
    return <ContentLayout>
        <ContentPaginationPage {...loaderData} />
    </ContentLayout>
}

export async function loader(args: Route.LoaderArgs) {
    return products.loadPage(args)
}

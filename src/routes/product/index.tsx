import { ContentLayout } from '#src/components/app/BaseLayout'
import PostItem from '#src/components/posts/PostItem'
import { products } from '#src/lib/products.server'
import { Route } from './+types/index'


export default function Products({ loaderData }: Route.ComponentProps) {
    return <ContentLayout headerTitle='My Shop'>

        <div className='flex flex-row flex-wrap gap-2'>
            {loaderData.products?.map((product, i) => <div key={i} className='basis-1/3 grow pb-2'>
                <PostItem post={product} />
            </div>)}
        </div>

    </ContentLayout>

}

export async function loader({ params }: Route.LoaderArgs) {
    return { products: await products.getAllDetailed() }
}

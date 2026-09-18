import { ContentLayout } from '#src/components/app/BaseLayout'
import { H3 } from '#src/components/common/typography.tsx'
import PostItem from '#src/components/posts/PostItem'
import { Button } from '#src/components/ui/button.tsx'
import { products } from '#src/lib/products.server'
import { Link } from 'react-router'
import { Route } from './+types/index'


export default function Products({ loaderData }: Route.ComponentProps) {
    return <ContentLayout headerTitle='Shop'>

        <div className='flex justify-between items-center'>
            <H3>Featured:</H3>
            <Button variant={'link'}><Link to='/products/page/1'>See all</Link></Button>
        </div>
        <div className='flex flex-row flex-wrap gap-2'>
            {loaderData.products?.map((product, i) => <div key={i} className='basis-1/3 grow pb-2'>
                <PostItem post={product} />
            </div>)}
        </div>

    </ContentLayout>

}

export async function loader() {
    return { products: await products.getAllDetailed() }
}

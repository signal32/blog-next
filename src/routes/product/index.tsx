import { Card } from 'src/components/card'
import { Route } from './+types/index'
import { createClient } from 'store'
import { H2 } from 'src/components/common/typography'
import { fromSelect, createSelect } from 'store/src/product'

const shopClient = createClient('http://localhost:3000')

export default function Products({ loaderData }: Route.ComponentProps) {
    return <>
        {loaderData.products?.map(product => <Card>{{

            content: <>
                <img className="object-cover w-full max-h-40 overflow-clip rounded-xl mt-1" src={product.meta.headerImageUrl} />
                <H2>{product.name}</H2>
            </>
        }}</Card>)}
    </>

}

export async function loader({ params }: Route.LoaderArgs) {
    const products = await createSelect(shopClient).then(fromSelect)
    return { products }
}

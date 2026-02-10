import { Route } from './+types/index'
import { createClient } from 'store'

const shopClient = createClient('http://localhost:3000')

export default function Products({ loaderData }: Route.ComponentProps) {
    return <ul>
        {loaderData.products.data?.map(product => <li>{product.name}</li>)}
    </ul>

}

export async function loader({ params }: Route.LoaderArgs) {
    const products = await shopClient.from('products').select('*')
    return { products }
}

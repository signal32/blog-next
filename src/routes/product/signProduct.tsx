import { Markdown } from "#src/components/common/Markdown.tsx";
import { products } from "#src/lib/products.server";
import { ConfigurationOptions } from "store/src/product";
import { Route } from './+types/signProduct';
import { ProductLayout, ProductSidebar } from "./product";

export const CUSTOM_SIGN_PRODUCT_ID = '5bb0a699-f964-431e-9605-0d896b642108'

export default function SignProduct({ loaderData }: Route.ComponentProps) {

    return <ProductLayout product={loaderData.product}>{{
        main: <>
            <Markdown content={loaderData.product.description ?? ''} />
            <ConfigurationOptions configurationOptions={loaderData.product.storeProduct?.configurationOptions ?? {}} />
        </>,
        sidebar: <ProductSidebar product={loaderData.product} />
    }}</ProductLayout>
}

export async function loader({ params }: Route.LoaderArgs) {
    const product = await products.getById(CUSTOM_SIGN_PRODUCT_ID);
    if (!product) throw new Response(undefined, { status: 404 })
    return { product }
}

function ConfigurationOptions(props: { configurationOptions: ConfigurationOptions }) {
    return Object
        .entries(props.configurationOptions ?? {})
        .map(([id, option]) => {
            if (option.type === 'input') return <input type="text" />
            if (option.type === 'number') return <input type="number" />
            if (option.type === 'select') return <p>{JSON.stringify(option.values)}</p>
        })
}

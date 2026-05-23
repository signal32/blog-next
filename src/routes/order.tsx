import { ContentLayout } from '#src/components/app/BaseLayout.tsx'
import { InfoCard } from '#src/components/common/InfoCard.tsx'
import { H2, H4, H6, P } from '#src/components/common/typography.tsx'
import PostItem from '#src/components/posts/PostItem.tsx'
import { Skeleton } from '#src/components/ui/skeleton.tsx'
import { useBasket } from '#src/lib/basket.ts'
import type { Content } from '#src/lib/content.server.ts'
import { SHOP } from '#src/shop.ts'
import { FileDownIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { Route } from './+types/order'

export default function Order({ loaderData: { order, orderId }, params }: Route.ComponentProps) {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const allFulfilled = order.products.every(product => product.fulfillmentStatus !== 'pending')
        let timeout: ReturnType<typeof setTimeout>
        if (order.paid && !allFulfilled) {
            timeout = setTimeout(() => navigate(location.pathname + location.search), 10000)
        }
        () => clearTimeout(timeout)
    }, [order])

    const [searchParams] = useSearchParams()
    const success = searchParams.has('success')

    const basket = useBasket()
    useEffect(() => {
        if (success && basket.size()) {
            basket.clear();
        }
    }, [])

    return <ContentLayout>
        {success && <>
            <div className="text-center py-10">
                <H2>Your order has been placed!</H2>
                <H6>Thank you for your custom ❤️</H6>
                {/*<P className="mt-5">Write a thank you message here :)</P>*/}
            </div>
        </>}

        {!order.paid && <InfoCard>{{
            body: <P>
                This order has not been processed because no payment has been received.
                If you think this is an error, please get in touch.
            </P>
        }}</InfoCard>}

        <H2>Order Details</H2>
        <table className='table-auto w-full text-sm mb-5 '>
            <tbody>
                <tr>
                    <td>Order ID</td>
                    <td>{orderId}</td>
                </tr>
                <tr>
                    <td>Paid</td>
                    <td>{order.paid.toString()}</td>
                </tr>
            </tbody>
        </table>

        <H2>Products</H2>
        <div className='flex flex-col gap-2'>
            {order.products.map(product =>
                <div className='w-full bg-card shadow rounded-md p-2 flex flex-row gap-4'>
                    <div>
                        {/* TODO: add option to load product with the purchased config */}
                        <ContentItem library='products' id={product.productId} />

                    </div>
                    <div className='flex flex-col gap-2'>
                        {Object.keys(product.options).length && <div>
                            <H4>Options:</H4>
                            {
                                Object
                                    .entries(product.options)
                                    .map(([key, { value }]) =>
                                        <P><b className='capitalize'>{key}</b>: {value}</P>
                                    )
                            }
                        </div>}

                        {
                            product.fulfillmentStatus === 'fulfilled'
                                ? <div>
                                    <H4>Files:</H4>
                                    {product.files.map(file => <div className='flex flex-row gap-2'>
                                        <FileDownIcon />
                                        <a className='hover:underline' href={file.url} download>{file.name}</a>
                                    </div>)

                                    }
                                </div>
                                : product.fulfillmentStatus === 'failed'
                                    ? <InfoCard>{{
                                        body: <P>
                                            Something went wrong while processing your order.
                                        </P>
                                    }}</InfoCard>
                                    : <InfoCard>{{
                                        body: <P>
                                            Waiting for fulfillment to complete.
                                            This usually take a few minutes.
                                        </P>
                                    }}</InfoCard>

                        }

                    </div>


                </div>)}
        </div>
    </ContentLayout>

}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const orderId = params['orderId']
    if (!orderId) throw new Error("Order ID required")

    const order = await SHOP.getOrder({ orderId })

    return { order, orderId }
}


function ContentItem(props: {
    library: string,
    id: string,
}) {
    const [content, setContent] = useState<Content>()

    useEffect(() => {
        fetch(`/api/content/${props.library}/${props.id}`)
            .then(res => res.json())
            .then(setContent)
    }, [props.id])

    return content
        ? <PostItem post={content} showImage />
        : <Skeleton className='w-full h-48' />
}

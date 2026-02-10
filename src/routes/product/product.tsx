import { ExternalLink, FileDown } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from 'src/components/ui/button';
import { preRenderCache } from 'src/lib/preRenderCache.server';
import { ContentLayout } from "../../components/app/BaseLayout";
import Drawer from "../../components/common/Drawer";
import { Markdown } from '../../components/common/Markdown';
import { useModalStore } from "../../components/common/Modal";
import { type FileDetails, files } from "../../lib/file.server";
import { type Product, type Requirement, products } from "../../lib/products.server";
import { Route } from './+types/product';
import { Product as x } from 'store'

const x: X = {
    done: true,

}

export default function Product({ loaderData }: Route.ComponentProps) {

    const modals = useModalStore();
    const props = loaderData

    const openGallery = (img: string) => {
        modals.pushModal(
            <div className=" h-full">
                <img
                    src={img}
                    alt='product image'
                    sizes="100vw"
                    style={{
                        objectFit: "contain"
                    }} />
            </div>
        )
    }

    return <ContentLayout
        headerTitle={props.product?.name}
        header={
            props.product?.media?.banner
                ? { type: 'image', href: props.product.media.banner }
                : undefined}
        breadcrumbs
    >
        <div>
            <div className="flex flex-wrap-reverse gap-5">

                {/* Main content */}
                <div className=" flex-grow basis-80">
                    <Markdown content={props.product.description ?? ''} cache={props.cache} />

                    <Drawer title="Requirements">
                        {props.product.requirements?.map((item, i) => <RequirementItem key={i} requirement={item} products={props.dependencyProducts ?? []} />)}
                    </Drawer>
                </div>

                {/* Sidebar */}
                <div className="flex-grow basis-20">
                    <div className='p-2 rounded-lg shadow-lg bg-slate-200 dark:bg-slate-800'>
                        {/* TODO images */}
                        <div className="flex gap-3 flex-wrap">
                            {props.product.media?.gallery?.map((item, i) => (
                                <div key={i} className="flex-auto w-24 h-24 rounded-lg shadow-md bg-cover hover:shadow-xl hover:scale-105 transition-transform" style={{ backgroundImage: `url(${item})` }} onClick={() => openGallery(item)}></div>
                            ))}
                        </div>
                        {/* TODO basic info */}
                        <ProductDetails product={props.product} />
                        {/* TODO download links */}
                        {props.mainFile
                            ? <>
                                {/*<Button text="Download" icon={<FaInfoCircle />} href={props.mainFile.href} target='_blank' />*/}
                                <Button asChild className='w-full'>
                                    <a href={props.mainFile.href} target='_blank'>
                                        <FileDown />
                                        Download
                                    </a>
                                </Button>
                                <p className="italic text-sm text-right">{props.mainFile.fileName}</p>
                            </>
                            : <p>Sorry, this file is currently unavailable.</p>
                        }

                        {/* <p className="italic text-sm text-right">Details: {JSON.stringify(props.mainFile)}</p> */}
                    </div>
                </div>
            </div>
        </div>
    </ContentLayout>
}

export async function loader({ params }: Route.LoaderArgs) {
    const product = await products.getBySlug(params['slug'] ?? '');
    if (!product) throw new Response(undefined, { status: 404 })

    // Fetch internal products for dependencies
    // TODO do this for children, parent & related products
    const dependencyProducts = await Promise.all(product?.requirements?.filter(item => item.type == 'internal')
        .map(async (item) => {
            if (item.type == 'internal') {
                const product = (await products.getBySlug(item.id));
                const file = product?.files?.primary ? await files.getBySlug(product?.files?.primary) : undefined;
                return { product, file }
            }
            else return {}
        }) || []);

    const mainFile = product?.files?.primary ? (await files.getBySlug(product.files.primary)) ?? null : null
    const otherFiles = product?.files?.other.map(item => ({
        file: files.getBySlug(item.slug),
        ...item,
    })) || []

    return {
        product,
        dependencyProducts,
        mainFile,
        otherFiles,
        cache: await preRenderCache()
    }
}

const ProductDetails = (props: { product: Product }) => {
    const details = [
        { name: 'Published', value: props.product.published?.toDateString() },
        { name: 'Product ID', value: props.product.id },
        { name: 'Product name', value: props.product.name },
        { name: 'Has requirements', value: !props.product.requirements == undefined }
    ];
    return (
        <div>
            {details.map((detail, i) => detail.value ? (
                <div key={i} className="flex gap-2 font-extralight">
                    <div className="flex-auto text-left">{detail.name}</div>
                    <div className="flex-auto text-right">{detail.value}</div>
                </div>
            ) : '')}
        </div>
    )
}

const RequirementItem = (props: { requirement: Requirement, products: { product?: Product, file?: FileDetails }[] }) => (
    <div className="flex justify-between gap-2 p-2 my-2 rounded shadow bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors">
        {props.requirement.type == 'internal' && [
            <div key={1}>{props.products.find((p) => p.product?.id === props.requirement.id)?.product?.name}</div>,
            <div key={2} className="flex items-center gap-2"> </div>,
            <div key={3} className="flex items-center gap-2">
                <div key={2} className="flex items-center gap-2">
                    <Button asChild variant={'link'} className='cursor-pointer'>
                        <Link to={'/product/' + props.requirement.id}>Details</Link>
                    </Button>
                </div>
                <Button asChild variant={'outline'} className='cursor-pointer'>
                    <a href={props.products.find((p) => p.product?.id === props.requirement.id)?.file?.href} target='_blank'>
                        <FileDown />
                        Download
                    </a>
                </Button>
            </div>
        ]}
        {
            props.requirement.type == 'external' && [
                <div key={1} className="">{props.requirement.id}</div>,
                <div key={2} className="flex items-center gap-2">
                    <Button asChild variant={'outline'} className='text-xs'>
                        <a
                            href={props.requirement.href[0]} target="_blank">
                            <ExternalLink />
                            {props.requirement.site ?? new URL(props.requirement.href[0]).hostname}
                        </a>
                    </Button>
                </div>
            ]
        }
    </div >
)

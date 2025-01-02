import Image from "next/image";
import Link from "next/link";
import { FaDownload, FaExternalLinkAlt, FaInfoCircle } from 'react-icons/fa';
import { Markdown } from '../../components/common/Markdown';
import { LayoutRequestProps, defineLayout } from "../../components/app/BaseLayout";
import { PageWithLayout } from '../../components/app/LayoutApp';
import Button from "../../components/common/Button";
import Drawer from "../../components/common/Drawer";
import { useModalStore } from "../../components/common/Modal";
import { FileDetails, files } from "../../lib/file";
import { Product, Requirement, products } from "../../lib/products";
import markDownStyles from '../../styles/md.module.scss';

interface ProductPageProps extends LayoutRequestProps {
    product: Product,
    dependencyProducts: {product: Product, file: FileDetails}[],
    mainFile: FileDetails,
    otherFiles: {slug: string, label: string, file: FileDetails}[],
}

const ProductPage: PageWithLayout<ProductPageProps> = (props) => {
    const modals = useModalStore();

    const openGallery = (img: string) => {
        modals.pushModal(
            <div className=" h-full">
                <Image
                    src={img}
                    alt='product image'
                    onLoadingComplete={(e) => console.log(e)}
                    fill
                    sizes="100vw"
                    style={{
                        objectFit: "contain"
                    }} />
            </div>
        )
    }

    return (
        <div>
            <h1>Product: {props.product.name}</h1>
            <div className="flex gap-3">

                {/* Main content */}
                <div className="flex-auto w-80 p-2">
                    <Markdown content={props.product.description ?? ''} />

                    <Drawer title="Requirements">
                        {props.product.requirements?.map((item, i) => <RequirementItem key={i} requirement={item} products={props.dependencyProducts} />)}
                    </Drawer>
                </div>

                {/* Sidebar */}
                <div className="flex-auto w-24 p-2 rounded-lg shadow-lg bg-slate-200 dark:bg-slate-800">
                    {/* TODO images */}
                    <div className="flex gap-3 flex-wrap">
                        {props.product.media?.gallery?.map((item, i) => (
                            <div key={i} className="flex-auto w-24 h-24 rounded-lg shadow-md bg-cover hover:shadow-xl hover:scale-105 transition-transform" style={{backgroundImage: `url(${item})`}} onClick={() => openGallery(item)}></div>
                        ))}
                    </div>
                    {/* TODO basic info */}
                    <ProductDetails product={props.product}/>
                    {/* TODO download links */}
                    { props.mainFile
                        ? <>
                            <Button text="Download" icon={<FaInfoCircle/>} href={props.mainFile.href} target='_blank'/>
                            <p className="italic text-sm text-right">{props.mainFile.fileName}</p>
                        </>
                        : <p>Sorry, this file is currently unavailable.</p>
                    }

                    {/* <p className="italic text-sm text-right">Details: {JSON.stringify(props.mainFile)}</p> */}
                </div>
            </div>
        </div>
    )
}

ProductPage.layout = defineLayout((props) => ({
    headerTitle: props.product.name,
    header: props.product.media?.banner
        ? { type: 'image', href: props.product.media.banner }
        : undefined,
    breadcrumbs: true,
}))

export default ProductPage;

type Params = {
    params: { slug: string }
}

export async function getStaticProps({params}: Params) {
    const product = await products.getBySlug(params.slug);

    // Fetch internal products for dependencies
    // TODO do this for children, parent & related products
    const dependencyProducts = await Promise.all(product?.requirements?.filter(item => item.type == 'internal')
        .map( async (item) => {
            if (item.type == 'internal') {
                const product = (await products.getBySlug(item.id)) || null;
                const file = product?.files?.primary ? await files.getBySlug(product?.files?.primary) : null;
                return {product, file}
            }
        }) || []);

    const mainFile = product?.files?.primary ?  (await files.getBySlug(product.files.primary)) ?? null : null
    const otherFiles = product?.files?.other.map(item => ({
        file: files.getBySlug(item.slug),
        ...item,
    })) || []

    return {
        props: {
            product,
            dependencyProducts,
            mainFile,
            otherFiles,
        }
    }
}

export async function getStaticPaths() {
    const paths = products.getAll().map(product => ({
        params: {slug: product.slug}
    }));

    return {
        paths,
        fallback: false,
    }
}

const ProductDetails = (props: {product: Product}) => {
    const details = [
        {name: 'Published', value: props.product.public?.toDateString()},
        {name: 'Product ID', value: props.product.id},
        {name: 'Product name', value: props.product.name},
        {name: 'Has requirements', value: !props.product.requirements == undefined}
    ];
    return (
        <div>
            { details.map((detail, i) => detail.value? (
                <div key={i} className="flex gap-2 font-extralight">
                    <div className="flex-auto text-left">{detail.name}</div>
                    <div className="flex-auto text-right">{detail.value}</div>
                </div>
            ) : '')}
        </div>
    )
}

const RequirementItem = (props: {requirement: Requirement, products: {product:Product, file: FileDetails}[]}) => (
    <div className="flex justify-between gap-2 p-2 my-2 rounded shadow bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors">
        { props.requirement.type == 'internal' && [
            <div key={1}>{props.products.find((p) => p.product.id = props.requirement.id)?.product.name}</div>,
            <div key={2} className="flex items-center gap-2"> <Link href={'/product/' + props.requirement.id}>Details</Link></div>,
            <div key={3} className="flex items-center gap-2">
                <Button text="Download" size="small" style="text" icon={<FaDownload/>} href={props.products.find((p) => p.product.id = props.requirement.id)?.file?.href}/>
            </div>
        ]}
        { props.requirement.type == 'external' && [
            <div key={1} className="">{props.requirement.id}</div>,
            <div key={2} className="flex items-center gap-2">
                <p className="text-xs px-2 rounded-full bg-amber-200 dark:bg-amber-600">third party</p>
                <Button text={props.requirement.site} size="small" style="text" icon={<FaExternalLinkAlt />} href={props.requirement.href[0]} target="_blank" rel="noreferrer"/>
            </div>
        ]}
    </div>
)

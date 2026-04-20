import { InfoCard } from "#src/components/common/InfoCard.tsx";
import { Markdown } from "#src/components/common/Markdown.tsx";
import { H5, P } from "#src/components/common/typography.tsx";
import { Button } from "#src/components/ui/button.tsx";
import { Field, FieldDescription, FieldLabel } from "#src/components/ui/field.tsx";
import { Input } from "#src/components/ui/input.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "#src/components/ui/popover.tsx";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "#src/components/ui/select.tsx";
import { Switch } from "#src/components/ui/switch.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#src/components/ui/tabs.tsx";
import { useBasket } from "#src/lib/basket.ts";
import { CUSTOM_SIGN_PRODUCT_ID, products } from "#src/lib/products.server";
import { SHOP } from "#src/shop.ts";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Check, MoveVertical, Save, Trash, X } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { HexAlphaColorPicker } from 'react-colorful';
import { useSearchParams } from "react-router";
import { Config, configId as getConfigId } from "store";
import * as THREE from "three";
import { Route } from './+types/signProduct';
import { ProductLayout, ProductSidebar } from "./product";
import { OnAddToBasketCb } from "#src/components/AddToCartButton.tsx";

type SignConfig = {
    signId: string,
    textureWidth: number,
    textureHeight: number,
    useCustomTexture: boolean,
    backgroundColour: string,
    borderColour: string,
    borderThickness: number,
    customTextureUrl?: string,
    primaryText: TextConfig,
    secondaryText: TextConfig,
    provider: string,
    product: string,
    assetName: string,
}

type TextConfig = {
    textValue?: string,
    textSize: number,
    textFont: string,
    textColour: string
    verticalOffset: number
}

type TextureData = {
    asBlob: () => Promise<Blob>,
    dataUrl: string
}

const FONTS = [
    { name: 'Raleway', fontFace: 'Raleway' },
    { name: 'Caveat', fontFace: 'Caveat' },
    { name: 'Sans Serif', fontFace: 'sans-serif' }
]

const SIGN_BOARD_MESH_NAME = '1_0500_board'
const SIGN_BOARD_MATERIAL_NAME = 'Main'

function createTextureFromConfig(config: SignConfig): TextureData {
    const canvas = document.createElement('canvas')
    canvas.width = config.textureWidth //512
    canvas.height = config.textureHeight// 512
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error('Could not get canvas context')

    ctx.fillStyle = config.backgroundColour
    ctx.lineWidth = config.borderThickness;
    ctx.strokeStyle = config.borderColour
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeRect(0, 0, canvas.width, canvas.height)


    const drawText = (config: TextConfig, x: number, y: number, width: number) => {
        ctx.fillStyle = config.textColour
        ctx.font = `bold ${config.textSize}px ${config.textFont}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(config.textValue ?? 'Your text here', x, y + config.verticalOffset, width);
    }

    drawText(config.primaryText, canvas.width / 2, canvas.height / 2, canvas.width - 10 - (config.borderThickness * 2))
    drawText(config.secondaryText, canvas.width / 2, (canvas.height / 2) + (config.primaryText.textSize / 2), canvas.width - 10 - (config.borderThickness * 2))

    return {
        dataUrl: canvas.toDataURL('image/png'),
        asBlob: () => new Promise((resolve, reject) => {
            canvas.toBlob((blob) => blob !== null ? resolve(blob) : reject(), "image/png");
        })
    }
}

export default function SignProduct({ loaderData, params }: Route.ComponentProps) {
    const [config, setConfig] = useState<SignConfig>({
        signId: Object.keys(loaderData.signs)[0] ?? '',
        provider: 'HamishWeir',
        product: 'CustomSigns',
        assetName: '',
        useCustomTexture: false,
        backgroundColour: '#0099ff',
        primaryText: {
            textSize: 72,
            textFont: 'Raleway',
            textColour: '#ffffff',
            verticalOffset: 0,
        },
        secondaryText: {
            textSize: 36,
            textFont: 'Raleway',
            textColour: '#ffffff',
            verticalOffset: 15
        },
        textureHeight: 512,
        textureWidth: 512,
        borderColour: '#ffffff00',
        borderThickness: 25,
    })

    const [searchParams] = useSearchParams()
    const basket = useBasket()

    useEffect(() => {
        const configId = searchParams.get('configId')
        if (!configId) return

        const config = basket.order.products[loaderData.product.id]?.configs[configId]
        const signConfig = config?.meta['signConfig']
        if (signConfig) setConfig(JSON.parse(signConfig))

    }, [params, basket])

    const [texture, setTexture] = useState<TextureData>()
    const [productConfig, setProductConfig] = useState<Config>({ quantity: 1, options: {}, meta: {} })
    useEffect(() => {
        setTexture(createTextureFromConfig(config))
        setProductConfig({
            quantity: 1,
            options: {
                name: {
                    value: config.assetName
                },
                provider: {
                    value: config.provider
                },
                product: {
                    value: config.product
                },
            },
            meta: {
                textureFilename: `${config.provider}-${config.product}-${config.assetName}`,
                signConfig: JSON.stringify(config),
            }
        })
    }, [config])

    const updateBasketRequired = useMemo(() => {
        const config = basket.order.products[loaderData.product.id]?.configs[getConfigId(productConfig)]
        if (!config) return false
        return config?.meta['signConfig'] !== productConfig.meta['signConfig']
    }, [productConfig, basket])

    const updateBasket = () => {
        const signConfig = productConfig.meta['signConfig']
        const config = basket.order.products[loaderData.product.id]?.configs[getConfigId(productConfig)]
        if (!config || !signConfig) return

        basket.updateProduct(
            loaderData.product.id,
            currentConfig => ({
                ...currentConfig,
                meta: {
                    ...currentConfig.meta,
                    signConfig,
                }
            }),
            getConfigId(productConfig),
        )
    }

    const restoreFromBasket = () => {
        const config = basket.order.products[loaderData.product.id]?.configs[getConfigId(productConfig)]
        const signConfig = config?.meta['signConfig']
        if (signConfig) {
            setProductConfig(config)
            setConfig(JSON.parse(signConfig))
        }
    }

    const handleAddToBasket: OnAddToBasketCb = async (config: Config) => {
        if (!config.options['name']?.value.length) {
            alert('Asset name must be at least 5 characters in length.')
            return false
        }
        if (!config.options['product']?.value.length) {
            alert('Product name must be at least 5 characters in length.')
            return false
        }
        if (!config.options['provider']?.value.length) {
            alert('Provider name must be at least 5 characters in length.')
            return false
        }

        await uploadTexture()
    }

    const uploadTexture = async () => {
        if (!texture) throw new Error('Texture is required.')
        const body = await texture.asBlob()
        const filename = productConfig.meta['textureFilename']
        if (!filename) throw new Error('No texture filename')
        const { url } = await SHOP.generatePreSignedUploadUrl({ filename, type: 'image/png' })

        await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'image/png',
            },
            body,
        });
    }

    return <ProductLayout product={loaderData.product}>{{
        main: <>
            <Markdown content={loaderData.product.description ?? ''} />

            <div className="p-2 bg-accent/50 rounded-lg shadow">
                <div className="h-96 bg-accent rounded-lg shadow">
                    <ClientOnly>
                        {() => loaderData.signs[config.signId] ? <Viewer
                            model={`${SHOP.url}${loaderData.signs[config.signId]?.previewModelUrl}`}
                            texture={texture?.dataUrl}
                            textureDimensions={(textureWidth, textureHeight) => setConfig(c => ({ ...c, textureWidth, textureHeight }))}
                        /> : <p>no sign :( {config.signId}</p>}
                    </ClientOnly>
                </div>

                <form className="pt-2">
                    <div className="flex justify-between border-air/50 border-b-2 pt-2">
                        <H5>Asset Config</H5>
                    </div>

                    <Field className="w-full" orientation="horizontal">
                        <FieldLabel htmlFor="input-field-provider">Provider</FieldLabel>
                        <Input
                            id="input-field-provider"
                            type="text"
                            placeholder="Hamish Weir"
                            value={config.provider}
                            onChange={ev => setConfig(c => ({ ...c, provider: ev.currentTarget?.value }))}
                        />
                    </Field>

                    <Field className="w-full" orientation="horizontal">
                        <FieldLabel htmlFor="input-field-product">Product</FieldLabel>
                        <Input
                            id="input-field-product"
                            type="text"
                            placeholder="Signs"
                            value={config.product}
                            onChange={ev => setConfig(c => ({ ...c, product: ev.currentTarget?.value }))}
                        />
                    </Field>

                    <Field className="w-full" orientation="horizontal">
                        <FieldLabel htmlFor="input-field-asset-name">Name</FieldLabel>
                        <Input
                            id="input-field-asset-name"
                            type="text"
                            placeholder="My custom sign"
                            value={config.assetName}
                            onChange={ev => setConfig(c => ({ ...c, assetName: ev.currentTarget?.value }))}
                        />
                    </Field>

                    <div className="flex justify-between border-air/50 border-b-2 pt-2">
                        <H5>Sign Style</H5>
                    </div>
                    <Field className="w-full" orientation="horizontal">
                        <FieldLabel>Model</FieldLabel>
                        <FieldDescription>Select a style for the base 3D model.</FieldDescription>
                        <Select value={config.signId} onValueChange={signId => setConfig(c => ({ ...c, signId: signId || c.signId }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {Object.entries(loaderData.signs).map(([id, sign]) => <SelectItem value={id}>{sign.name}</SelectItem>)}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>

                    <div className="flex justify-between border-air/50 border-b-2 pt-2">
                        <H5>Board Design</H5>
                        <Field orientation="horizontal" className="w-fit">
                            <FieldLabel htmlFor="2fa">Use custom texture</FieldLabel>
                            <Switch checked={config.useCustomTexture} onCheckedChange={checked => setConfig(c => ({ ...c, useCustomTexture: checked }))} id="2fa" />
                        </Field>
                    </div>

                    <div className="flex gap-2 py-2">
                        <div className="basis-2/3">
                            {
                                config?.useCustomTexture
                                    ? <>
                                        <P className="text-sm">
                                            <b>Warning:</b> Each sign model has a different texture resolution.<br />
                                            Please chose the model you wish to use before uploading custom textures.
                                        </P>
                                        <Button variant="outline" size="sm" className="w-full p-4">
                                            Upload texture
                                        </Button>
                                        <P>Resolution: {config.textureWidth}px x {config.textureHeight}px</P>

                                    </>
                                    : <>
                                        <Tabs defaultValue="background">
                                            <TabsList>
                                                <TabsTrigger value="background">Background</TabsTrigger>
                                                <TabsTrigger value="primary-text">Primary Text</TabsTrigger>
                                                <TabsTrigger value="secondary-text">Secondary Text</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="background">
                                                <Field className="w-full" orientation="horizontal">
                                                    <FieldLabel>Colour</FieldLabel>
                                                    <SignColourPicker
                                                        currentColour={config.backgroundColour}
                                                        onChange={backgroundColour => setConfig(c => ({ ...c, backgroundColour }))}
                                                    />
                                                </Field>

                                                <Field className="w-full" orientation="horizontal">
                                                    <FieldLabel>Border colour</FieldLabel>
                                                    <SignColourPicker
                                                        currentColour={config.borderColour}
                                                        onChange={borderColour => setConfig(c => ({ ...c, borderColour }))}
                                                    />
                                                </Field>

                                                <Field className="w-full" orientation="horizontal">
                                                    <FieldLabel>Border thickness</FieldLabel>
                                                    <Input
                                                        type="number"
                                                        defaultValue={25}
                                                        value={config.borderThickness}
                                                        onChange={e => setConfig(c => ({ ...c, borderThickness: +e.target.value }))}
                                                    />
                                                </Field>

                                            </TabsContent>

                                            <TabsContent value="primary-text">
                                                <TextConfigFields
                                                    config={config.primaryText}
                                                    onChange={primaryText => setConfig(config => ({ ...config, primaryText }))}
                                                />
                                            </TabsContent>

                                            <TabsContent value="secondary-text">
                                                <TextConfigFields
                                                    config={config.secondaryText}
                                                    onChange={secondaryText => setConfig(config => ({ ...config, secondaryText }))}
                                                />
                                            </TabsContent>

                                        </Tabs>
                                    </>
                            }
                        </div>
                        <div className="basis-2/3">
                            {texture && <img src={texture.dataUrl} className="border-blue-50 border-2" />}
                        </div>
                    </div>

                    {updateBasketRequired && <InfoCard>{{
                        body: <P className="text-sm">
                            <b>You have modified a sign which is already in your basket.</b><br />
                            If you would like to add a new sign, please change either the <i>Provider</i>, <i>Product</i>, or <i>Name</i> fields and then select <i>Add to basket</i>.<br />
                        </P>,
                        footer: <>
                            <Button className="grow" variant='outline' onClick={updateBasket}><Save /> Update Basket</Button>
                            <Button className="grow" variant='outline' onClick={restoreFromBasket}><Trash /> Discard changes</Button>
                        </>
                    }}</InfoCard>}

                </form>
            </div>
        </>,
        sidebar: <ProductSidebar product={loaderData.product} config={productConfig} onAddToBasket={handleAddToBasket} />
    }}</ProductLayout >
}

export async function loader({ }: Route.LoaderArgs) {
    const product = await products.getById(CUSTOM_SIGN_PRODUCT_ID);
    if (!product) throw new Response(undefined, { status: 404 })
    const { signs } = await SHOP.listSigns({})

    return { product, signs: Object.fromEntries(signs.map(sign => [sign.id, sign])) }
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
    const { signs } = await SHOP.listSigns({})

    return {
        ...await serverLoader(),
        signs: Object.fromEntries(signs.map(sign => [sign.id, sign]))
    }
}

clientLoader.hydrate = true as const;

const originalMaterials: Record<string, ImageBitmap> = {}

function Viewer(props: {
    model: string,
    texture?: string,
    textureDimensions?: (width: number, height: number) => void
}) {
    const { scene, materials, meshes } = useGLTF(props.model)

    // TODO: This code isn't good enough. I need to get to the bottom of how THREE manages resources so they can be unloaded at the right time.
    useEffect(() => {
        const mainTexMaterial = materials[SIGN_BOARD_MATERIAL_NAME] as THREE.MeshStandardMaterial
        if (!mainTexMaterial) return
        if (mainTexMaterial.map?.image instanceof ImageBitmap && !originalMaterials[props.model]) {
            originalMaterials[props.model] = mainTexMaterial.map.image
        }

        const baseTexture = originalMaterials[props.model]
        if (!baseTexture || !props.texture) return

        const canvas = document.createElement('canvas')
        canvas.width = baseTexture.width
        canvas.height = baseTexture.height

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(baseTexture, 0, 0)

        const overlay = new Image()
        let disposed = false
        let newTexture: THREE.CanvasTexture | null = null
        overlay.onload = () => {
            if (disposed) return

            ctx.drawImage(overlay, 0, 0, overlay.width, overlay.height)

            newTexture = new THREE.CanvasTexture(canvas)
            newTexture.flipY = false

            mainTexMaterial.map = newTexture
            mainTexMaterial.needsUpdate = true
        }
        overlay.src = props.texture

        return () => {
            disposed = true
            // Delay cleanup to avoid flickering
            // Most cleanup is handled by useGLTF, only need to consider what we created
            setTimeout(() => {
                if (newTexture) {
                    newTexture.dispose()
                    newTexture.image = null as any
                    newTexture = null
                }
                if (mainTexMaterial?.map) {
                    mainTexMaterial.map.dispose?.()
                    mainTexMaterial.map = null
                }
            }, 500)

        }
    }, [props.texture, materials])

    useEffect(() => {
        const signBoardMesh = meshes[SIGN_BOARD_MESH_NAME]
        const uvAttr = signBoardMesh?.geometry.attributes['uv']
        if (!uvAttr) {
            console.log('no uv')
            return
        }

        let minU = Infinity, minV = Infinity
        let maxU = -Infinity, maxV = -Infinity

        for (let i = 0; i < uvAttr.count; i++) {
            const u = uvAttr.getX(i)
            const v = uvAttr.getY(i)

            minU = Math.min(minU, u)
            minV = Math.min(minV, v)
            maxU = Math.max(maxU, u)
            maxV = Math.max(maxV, v)
        }

        const uvWidth = maxU - minU
        const uvHeight = maxV - minV

        // Convert to pixel dimensions
        const pixelWidth = Math.round(uvWidth * 1024) //tex.image.width
        const pixelHeight = Math.round(uvHeight * 1024) //tex.image.height

        console.log("UV bounds:", { minU, minV, maxU, maxV })
        console.log("Pixel dimensions:", { pixelWidth, pixelHeight })

        props.textureDimensions?.(pixelWidth, pixelHeight)
    }, [meshes])

    return (
        <Canvas camera={{ position: [-3, 2, -1], fov: 45 }}>
            <ambientLight intensity={0.6} />
            {/*<directionalLight position={[10, 10, 5]} />*/}
            <primitive object={scene} scale={1} />
            <OrbitControls target={[0, 0.5, 0]} />
            <Environment preset="studio" backgroundIntensity={0.1} environmentIntensity={0.1} />
        </Canvas>
    )
}

function SignColourPicker(props: {
    currentColour: string,
    onChange?: (colour: string) => void
}) {
    const [pickerColour, setPickerColour] = useState<string>(props.currentColour)
    const [popoverOpen, setPopoverOpen] = useState(false)

    const onSelect = () => {
        if (!pickerColour) return
        props.onChange?.(pickerColour)
        setPopoverOpen(false)
    }

    const onCancel = () => {
        setPopoverOpen(false)
    }

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline">{props.currentColour} <div className="w-5 aspect-square" style={{ backgroundColor: props.currentColour }}></div></Button>
            </PopoverTrigger>
            <PopoverContent className="w-59">
                <HexAlphaColorPicker color={pickerColour} onChange={setPickerColour} />

                <Input className="w-50 mt-4" value={pickerColour} onChange={e => setPickerColour(e.target.value)} />

                <div className="w-50 flex flex-row gap-2 pt-4">
                    <Button className="grow" variant="outline" onClick={onSelect}>Select <Check /></Button>
                    <Button className="grow" variant="outline" onClick={onCancel}>Cancel <X /></Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

function TextConfigFields(props: {
    config: TextConfig,
    onChange: (config: TextConfig) => void
}) {
    return <>
        <Field className="w-full" orientation="horizontal">
            <FieldLabel htmlFor="input-field-primary-text">Text</FieldLabel>
            <Input
                id="input-field-primary-text"
                type="text"
                placeholder="Your text here"
                value={props.config.textValue}
                onChange={ev => props.onChange({ ...props.config, textValue: ev.currentTarget?.value })}
            />
        </Field>
        <Field className="w-full" orientation="horizontal">
            <FieldLabel>Font</FieldLabel>
            <Select value={props.config.textFont} onValueChange={textFont => props.onChange({ ...props.config, textFont })}>
                <SelectTrigger>
                    <SelectValue placeholder="Choose font" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {FONTS.map(font => <SelectItem value={font.fontFace} style={{ fontFamily: font.fontFace }}>{font.name}</SelectItem>)}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </Field>
        <Field orientation="horizontal">
            <FieldLabel>Size</FieldLabel>
            <Input
                type="number"
                defaultValue={12}
                value={props.config.textSize}
                onChange={e => props.onChange({ ...props.config, textSize: +e.target.value })}
            />
        </Field>

        <Field orientation="horizontal">
            <FieldLabel>Colour</FieldLabel>
            <SignColourPicker
                currentColour={props.config.textColour}
                onChange={textColour => props.onChange({ ...props.config, textColour })}
            />
        </Field>

        <Field className="w-full" orientation="horizontal">
            <FieldLabel>Offset <MoveVertical scale={0.25} /></FieldLabel>
            <Input
                type="number"
                value={props.config.verticalOffset}
                onChange={e => props.onChange({ ...props.config, verticalOffset: +e.target.value })}
            />
        </Field>

    </>
}

function ClientOnly({ children, fallback = null }: {
    children(): React.ReactNode;
    fallback?: React.ReactNode;
}) {
    return useHydrated() ? children() : fallback;
}

function useHydrated() {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
}

function subscribe() {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: Mock function
    return () => { };
}

// okay the uv coords are a bit fucked up. solution
// deal with just one texture - 'maintex'
// sign board mesh is uv mapped onto this
// we then load this texture into the background of the canvas
// and then insert our sign texture above it at the right position
//

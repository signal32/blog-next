import { OnAddToBasketCb } from "#src/components/AddToBasketButton.tsx";
import { InfoCard } from "#src/components/common/InfoCard.tsx";
import { Markdown } from "#src/components/common/Markdown.tsx";
import { H5, P } from "#src/components/common/typography.tsx";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "#src/components/ui/alert-dialog.tsx";
import { Button } from "#src/components/ui/button.tsx";
import { Field, FieldError, FieldLabel } from "#src/components/ui/field.tsx";
import { Input } from "#src/components/ui/input.tsx";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "#src/components/ui/popover.tsx";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "#src/components/ui/select.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#src/components/ui/tabs.tsx";
import { useBasket } from "#src/lib/basket.ts";
import { products } from "#src/lib/products.server";
import { SHOP } from "#src/shop.ts";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import merge from 'deepmerge';
import { Check, CircleQuestionMark, Info, Palette, Rotate3D, Save, Trash, X } from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { HexAlphaColorPicker } from 'react-colorful';
import { useSearchParams } from "react-router";
import sanitize from "sanitize-filename";
import { Config, configId as getConfigId } from "store";
import * as THREE from "three";
import { create, UseBoundStore } from "zustand";
import { Route } from './+types/signProduct';
import { ProductLayout, ProductSidebar } from "./product";

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

const SIGN_BOARD_MESH_NAME = '_board'
const SIGN_BOARD_MATERIAL_NAME = 'Main'
const CAMERA_TARGET_MESH_NAME = '_camera_target'

const fieldClasses = 'w-full pt-2 flex flex-wrap'
const fieldInputClasses = 'basis-1/2'

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

function validateConfig(config: SignConfig): {
    [K in keyof SignConfig]?: { valid: boolean, message?: string }
} {
    const isSafeFilePath = (path: string) => path !== sanitize(path)
        ? { valid: false, message: 'Must contain no spaces or special characters' }
        : hasLength(path)
    const hasLength = (name: string, min = 3) => name.length < 3
        ? { valid: false, message: `Must contain at least ${min} characters` }
        : { valid: true }

    return {
        provider: isSafeFilePath(config.provider),
        product: isSafeFilePath(config.product),
        assetName: hasLength(config.assetName, 5)
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
            verticalOffset: 15,
            textValue: '', // Prevents 'your text here' being rendered on sign at load
        },
        textureHeight: 512,
        textureWidth: 512,
        borderColour: '#dedede',
        borderThickness: 0,
    })

    const configValidation = useMemo(() => validateConfig(config), [config])

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
    const currentProductConfig = basket.order.products[loaderData.product.id]?.configs[getConfigId(productConfig)]

    const updateBasketRequired = useMemo(() => {
        const config = currentProductConfig
        if (!config) return false
        return config?.meta['signConfig'] !== productConfig.meta['signConfig']
    }, [productConfig, basket])


    const updateBasket = async () => {
        const signConfig = productConfig.meta['signConfig']
        const config = basket.order.products[loaderData.product.id]?.configs[getConfigId(productConfig)]
        if (!config || !signConfig) return


        basket.updateProduct(
            loaderData.product.id,
            {
                ...config,
                meta: {
                    ...config.meta,
                    signConfig,
                }
            },
            getConfigId(productConfig),
        )

        try {
            await uploadTexture()
        }
        catch (err) {
            console.error(err)
            alert('Could not update basket. Texture was not uploaded. Reverting to previous configuration.')
            basket.updateProduct(
                loaderData.product.id,
                {
                    ...config,
                    meta: config.meta
                },
                getConfigId(productConfig),
            )
        }
    }

    const restoreFromBasket = () => {
        const config = currentProductConfig
        const signConfig = config?.meta['signConfig']
        if (signConfig) {
            setProductConfig(config)
            setConfig(JSON.parse(signConfig))
        }
    }

    const handleAddToBasket: OnAddToBasketCb = async (config: Config) => {
        try {
            const signConfig = config.meta['signConfig']
            if (!signConfig) return false

            for (const { valid } of Object.values(validateConfig(JSON.parse(signConfig)))) {
                if (!valid) {
                    setShowAlertDialog({
                        title: 'Invalid configuration',
                        message: <p>
                            <b>The sign could not be added to your basket due to an invalid field.</b><br />
                            Please return and correct before proceeding.<br /><br />
                        </p>
                    })
                    return false
                }
            }

            await uploadTexture()
        }
        catch (err) {
            console.error(err)
            setShowAlertDialog({
                title: 'Something went wrong',
                message: <p>
                    An error occurred while adding the sign to your basket.<br />
                    Please try again and get in touch if this continues.
                </p>
            })
            return false
        }
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

    const [showAlertDialog, setShowAlertDialog] = useState<{ title: string, message: ReactNode }>()

    return <ProductLayout product={loaderData.product}>{{
        main: <>
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

                <Tabs defaultValue="config" className="pt-2">
                    <TabsList className="w-full">
                        <TabsTrigger value="config"><Palette />Editor</TabsTrigger>
                        <TabsTrigger value="description"><Info />About</TabsTrigger>
                    </TabsList>

                    <TabsContent value="config">
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
                        <form className="">
                            <div className="flex justify-between border-air/50 border-b-2 pt-2">
                                <H5>Asset Config</H5>
                            </div>

                            <Field className={fieldClasses} orientation="horizontal">
                                <FieldLabel htmlFor="input-field-provider">Provider</FieldLabel>
                                <Input
                                    className={fieldInputClasses}
                                    id="input-field-provider"
                                    type="text"
                                    placeholder="Hamish Weir"
                                    value={config.provider}
                                    onChange={ev => setConfig(c => ({ ...c, provider: ev.currentTarget?.value }))}
                                />
                                <HelpPopover title="Provider">
                                    <Markdown content={PROVIDER_MARKDOWN} />
                                </HelpPopover>
                                {configValidation.provider?.valid === false && <FieldError className="text-right basis-full mb-2">{configValidation.provider.message}</FieldError>}

                            </Field>

                            <Field className={fieldClasses} orientation="horizontal">
                                <FieldLabel htmlFor="input-field-product">Product</FieldLabel>
                                <Input
                                    className={fieldInputClasses}
                                    id="input-field-product"
                                    type="text"
                                    placeholder="Signs"
                                    value={config.product}
                                    onChange={ev => setConfig(c => ({ ...c, product: ev.currentTarget?.value }))}
                                />
                                <HelpPopover title="Product">
                                    <Markdown content={PRODUCT_MARKDOWN} />
                                </HelpPopover>
                                {configValidation.product?.valid === false && <FieldError className="text-right basis-full mb-2">{configValidation.product.message}</FieldError>}

                            </Field>

                            <Field className={fieldClasses} orientation="horizontal">
                                <FieldLabel htmlFor="input-field-asset-name">Name</FieldLabel>
                                <Input
                                    className={fieldInputClasses}
                                    id="input-field-asset-name"
                                    type="text"
                                    placeholder="My custom sign"
                                    value={config.assetName}
                                    onChange={ev => setConfig(c => ({ ...c, assetName: ev.currentTarget?.value }))}
                                />
                                <HelpPopover title="Name">
                                    <Markdown content={NAME_MARKDOWN} />
                                </HelpPopover>
                                {configValidation.assetName?.valid === false && <FieldError className="text-right basis-full mb-2">{configValidation.assetName.message}</FieldError>}

                            </Field>

                            <div className="flex justify-between border-air/50 border-b-2 pt-2">
                                <H5>Sign Style</H5>
                            </div>
                            <Field className={fieldClasses} orientation="horizontal">
                                <FieldLabel>Model</FieldLabel>
                                <Select
                                    value={config.signId}
                                    onValueChange={signId => setConfig(
                                        c => ({
                                            ...merge(c, (loaderData.signs[signId]?.defaultConfig as SignConfig) ?? {}),
                                            signId: signId || c.signId,
                                        }))}>
                                    <SelectTrigger className={fieldInputClasses}>
                                        <SelectValue placeholder="Choose model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {Object.entries(loaderData.signs).map(([id, sign]) => <SelectItem value={id}>{sign.name}</SelectItem>)}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <HelpPopover title="Model">
                                    This is the base 3D model onto which your custom design will be applied.
                                </HelpPopover>
                            </Field>

                            {/*<div className="pt-4 flex justify-between">
                                <P className="text-sm"><b>Try before you buy</b><br />This sample asset can be used in game.</P>
                                <Button variant={"secondary"}><FileDown />Download sample</Button>
                            </div>*/}

                            <div className="flex justify-between border-air/50 border-b-2 pt-2">
                                <H5>Board Design</H5>
                                {/*<Field orientation="horizontal" className="w-fit">
                                    <FieldLabel htmlFor="2fa">Use custom texture</FieldLabel>
                                    <Switch checked={config.useCustomTexture} onCheckedChange={checked => setConfig(c => ({ ...c, useCustomTexture: checked }))} id="2fa" />
                                </Field>*/}
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
                                                        <Field className={fieldClasses} orientation="horizontal">
                                                            <FieldLabel>Colour</FieldLabel>
                                                            <SignColourPicker
                                                                currentColour={config.backgroundColour}
                                                                onChange={backgroundColour => setConfig(c => ({ ...c, backgroundColour }))}
                                                            />
                                                        </Field>

                                                        <Field className={fieldClasses} orientation="horizontal">
                                                            <FieldLabel>Border colour</FieldLabel>
                                                            <SignColourPicker
                                                                currentColour={config.borderColour}
                                                                onChange={borderColour => setConfig(c => ({ ...c, borderColour }))}
                                                            />
                                                        </Field>

                                                        <Field className={fieldClasses} orientation="horizontal">
                                                            <FieldLabel>Border thickness</FieldLabel>
                                                            <Input
                                                                className={fieldInputClasses}
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
                                    {texture && <img src={texture.dataUrl} className="shadow" />}
                                </div>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="description">
                        <Markdown content={ABOUT_MARKDOWN} />

                        <Markdown content={loaderData.product.description ?? ''} />
                    </TabsContent>
                </Tabs>
            </div>
            <AlertDialog
                open={showAlertDialog !== undefined}
                onOpenChange={open => open ? undefined : setShowAlertDialog(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{showAlertDialog?.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {showAlertDialog?.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowAlertDialog(undefined)}>Okay</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>,
        sidebar: <ProductSidebar product={loaderData.product} config={productConfig} onAddToBasket={handleAddToBasket} />
    }}</ProductLayout >
}

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url)
    const slug = url.pathname.split('/').at((-1))
    if (!slug) throw new Response(undefined, { status: 404 })

    const product = await products.getBySlug(slug)
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

const baseTextureStore = create<{
    modelBaseTexture: Record<string, ImageBitmap>,
    setModelBaseTexture(modelId: string, baseTexture: ImageBitmap): ImageBitmap
}>()((set, get) => ({
    modelBaseTexture: {},
    setModelBaseTexture(modelId, baseTexture) {
        set({
            modelBaseTexture: {
                ...get().modelBaseTexture,
                [modelId]: baseTexture
            }
        })
        return baseTexture

    }
}))

zustandHmrFix('baseTextureStore', baseTextureStore)

function Viewer(props: {
    model: string,
    texture?: string,
    textureDimensions?: (width: number, height: number) => void
}) {
    const { scene, materials, meshes } = useGLTF(props.model)
    const { modelBaseTexture, setModelBaseTexture } = baseTextureStore()

    useEffect(() => {
        if (!props.texture) return

        const material = (materials[SIGN_BOARD_MATERIAL_NAME] ?? materials['Material'])
        if (!material || !(material instanceof THREE.MeshStandardMaterial)) return

        const baseTexture = modelBaseTexture[props.model] ?? setModelBaseTexture(props.model, (() => {
            const image = material.map?.image
            if (image instanceof ImageBitmap) return image
            else {
                console.error({ image, material, modelBaseTexture })
                throw new Error("Invalid image")
            }
        })())
        if (!baseTexture) return

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

            material.map = newTexture
            material.needsUpdate = true
        }
        overlay.src = props.texture

        return () => {
            disposed = true

            // Delay cleanup to avoid flickering
            // Most cleanup is handled by useGLTF, only need to consider what we created
            setTimeout(() => {
                if (!newTexture || !props.texture) return
                newTexture.dispose()
                newTexture.image = null as any
                newTexture = null
            }, 100)

        }
    }, [props.texture, props.model])

    useEffect(() => {
        const meshKey = Object.keys(meshes).find(key => key.endsWith(SIGN_BOARD_MESH_NAME))
        if (!meshKey) throw new Error(`Could not find sign board mesh.`)

        const signBoardMesh = meshes[meshKey]
        const uvAttr = signBoardMesh?.geometry.attributes['uv']
        if (!uvAttr) throw new Error("Sign board mesh has no UVs")

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
        const t = modelBaseTexture[props.model]
        if (!t) return
        const pixelWidth = Math.min(Math.round(uvWidth * t.width), t.width)
        const pixelHeight = Math.min(Math.round(uvHeight * t.height), t.height)

        props.textureDimensions?.(pixelWidth, pixelHeight)
    }, [meshes, modelBaseTexture])

    const controlsRef = useRef<any>(null)

    useEffect(() => {
        const meshKey = Object.keys(meshes)
            .find(key =>
                key.endsWith(CAMERA_TARGET_MESH_NAME) ||
                key.endsWith(SIGN_BOARD_MESH_NAME)
            )

        if (!meshKey) return

        const mesh = meshes[meshKey]
        if (!mesh) return

        const worldPos = new THREE.Vector3()
        mesh.getWorldPosition(worldPos)

        controlsRef.current?.target.copy(worldPos)
        controlsRef.current?.update()

    }, [meshes, props.model])


    const Command = (props: { children: ReactNode }) => <span className="bg-gray-500/25 p-1 rounded-md">{props.children}</span>

    return (
        <div className="relative w-full h-full">
            <Canvas camera={{ position: [-3, 3, -2], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <primitive object={scene} scale={1} />
                <OrbitControls ref={controlsRef} target={[0, 0.5, 0]} />
                <Environment preset="studio" backgroundIntensity={0.1} environmentIntensity={0.1} />

            </Canvas>

            <div className="absolute bottom-2 right-2 flex flex-row gap-2">
                <Rotate3D className="w-5 h-5" />
                <P className="text-sm">
                    Explore in 3D
                    <span className="border-l-2 border-l-gray-500 pl-2 ml-2"><Command>click</Command> + <Command>drag</Command> rotate</span>
                    <span className="border-l-2 border-l-gray-500 pl-2 ml-2"><Command>scroll</Command> zoom</span>
                </P>
                <div>
                    <P></P>
                    <P></P>
                </div>
            </div>
        </div>

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
        <Field className={fieldClasses} orientation="horizontal">
            <FieldLabel htmlFor="input-field-primary-text">Text</FieldLabel>
            <Input
                className={fieldInputClasses}
                id="input-field-primary-text"
                type="text"
                placeholder="Your text here"
                value={props.config.textValue}
                onChange={ev => props.onChange({ ...props.config, textValue: ev.currentTarget?.value })}
            />
        </Field>
        <Field className={fieldClasses} orientation="horizontal">
            <FieldLabel>Font</FieldLabel>
            <Select value={props.config.textFont} onValueChange={textFont => props.onChange({ ...props.config, textFont })}>
                <SelectTrigger
                    className={fieldInputClasses}
                >
                    <SelectValue placeholder="Choose font" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {FONTS.map(font => <SelectItem value={font.fontFace} style={{ fontFamily: font.fontFace }}>{font.name}</SelectItem>)}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </Field>
        <Field className={fieldClasses} orientation="horizontal">
            <FieldLabel>Size</FieldLabel>
            <Input
                className={fieldInputClasses}
                type="number"
                defaultValue={12}
                value={props.config.textSize}
                onChange={e => props.onChange({ ...props.config, textSize: +e.target.value })}
            />
        </Field>

        <Field className={fieldClasses} orientation="horizontal">
            <FieldLabel>Colour</FieldLabel>
            <SignColourPicker
                currentColour={props.config.textColour}
                onChange={textColour => props.onChange({ ...props.config, textColour })}
            />
        </Field>

        <Field className={fieldClasses} orientation="horizontal">
            <FieldLabel>Vertical offset</FieldLabel>
            <Input
                className={fieldInputClasses}
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
    return () => { };
}

function HelpPopover(props: { title?: string, children: ReactNode }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="link" size="icon"><CircleQuestionMark /></Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-96 max-h-96 overflow-scroll">
                <PopoverHeader>
                    {props.title && <PopoverTitle>{props.title}</PopoverTitle>}
                    <PopoverDescription>
                        {props.children}
                    </PopoverDescription>
                </PopoverHeader>
            </PopoverContent>
        </Popover>
    )
}

export function zustandHmrFix(name: string, useStore: UseBoundStore<any>) {
    if (import.meta.hot) {
        const savedState = import.meta.hot!.data[name];
        if (savedState) {
            const newState = { ...savedState, actions: useStore.getState().actions };
            useStore.setState(newState);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useStore.subscribe((state: any) => {
            const stateToSave = { ...state };
            delete stateToSave.actions;
            import.meta.hot!.data[name] = stateToSave;
        });
        import.meta.hot!.accept((newModule) => {
            if (newModule) {
                const savedState = import.meta.hot!.data[name];
                if (savedState) {
                    const newState = { ...savedState, actions: useStore.getState().actions };
                    useStore.setState(newState);
                }
            }
        });
    }
}

const PROVIDER_MARKDOWN = `
All Train Simulator assets are owned by a Provider, which in this case, is _you!_

Treat this field like a profile name - unique to you and safe to show publicly.

It is important not to choose name that has been used by someone else.
This can cause a collision between their assets and yours, which the game may not be able to handle.
To prevent this, avoid short or simple Provider names and consider checking which providers already exist in your Train Simulator installation.
`

const PRODUCT_MARKDOWN = `
Products are collections of assets owned by a Provider.
These typically contain all the assets made for a particular project.

For this, choose something unique to your project, for example \`MyWonderfulRoute\`.
`

const NAME_MARKDOWN = `
This is the name of the asset as it appears in game.

To keep assets organised inside the route editor, consider prefixing the name with your "Product" initials:

For example, for a Product called \`MyWonderfulRoute\`, you may choose \`MWR Station Sign PlaceName\` as a name.

Please note that no other asset with this name can exist within the Product.
`

const ABOUT_MARKDOWN = `
### Made-to-order Station Signs for Train Simulator Classic
---
_Ever wanted station signs for your route, but not sure how to make them?_

Design your perfect sign online and have them in-game, ready for use, within minutes.

Your sign will be prepared automatically straight after checkout.
This doesn't take long so, within a few minutes, you will be able to download your very own custom custom asset to add the finishing touches to your route.

All purchased signs belong to you and you are free to use them however you like, be that in freeware or commercial products.

So, what are you waiting for? Start designing your Train Simulator Classic station sign and have it in your route today!

### Instructions
---
#### Using the Editor
Use the editor to configure and design your sign.

##### Asset Config Section
The "Asset Config" section configures how the sign asset will be presented to Train Simulator, and determines how it will be used in game.

**Provider:** ${PROVIDER_MARKDOWN}
**Product:** ${PRODUCT_MARKDOWN}
**Name:** ${NAME_MARKDOWN}

##### Sign Style Section
A variety of different base styles can be chosen from.

The choice is a bit limited right now, but I am working to add more.
Please let me know if you have any particular suggestions.

##### Board Design Section
Use this section to customise the sign boards look and feel.

**Background:**
This section configured the background and border.

**Text:**
Both primary and secondary text fields operate in the same way.
Their properties can be set independently of each other.
Use the "Vertical Offset" option to set their position relative to each other.

#### Adding signs to your basket
Signs can be added to the basket once the "Asset Config" section is complete.
The "Add to basket" button will change to show that this sign has already been added.
When changes are made to the design, a popup will ask whether the basket should be updated.

To create another sign, simply change the "Asset Config".
For example, by setting the name to that of the new sign.
The new sign can then be added to the basket.

#### Completing your order
Once satisfied with your signs, view the basket and select "Proceed to checkout".
This will take you through the payment process.

Once payment has cleared your signs shall be generated automatically.
This may take a few minutes for each sign and progress can be tracked on the orders page.

#### Using your sign in-game
Generated signs can be downloaded as .zip archives.

To use these in game, simply unzip the contents of the archive into your Train Simulator (aka Railworks) \`Assets\` folder.

**To find the location of your Train Simulator folder:**
1. Open steam and go to the \`Library\` view
2. Find Train Simulator and select \`Properties\` from the right click menu
3. Go to \`Installed Files\` and select \`Browse\`
4. Locate the \`Assets\` folder.

**To extract each sign into this folder:**
1. In another File Explorer window, open the sign asset zip file.
2. Drag the contents to the Assets folder. Alternatively, choose the \"Extract"\ option in the top ribbon bar and provide the path to the Assets folder located above.

**To find your sign in the route editor:**
1. In the route editor, open the Object Set Filter flyout.
![Enable the object filter flyout](https://s3.finch.hamishweir.uk/shop-public/sign_instructions/1_object_filter_flyout.png)
2. Choose your "Provider" from the dropdown at the top of the flyout and enable your "Product"(s).
![Enable the object filter flyout](https://s3.finch.hamishweir.uk/shop-public/sign_instructions/2_enable_product.png)
1. Your sign asset can now be located in the asset explorer on the right hand side!
![Enable the object filter flyout](https://s3.finch.hamishweir.uk/shop-public/sign_instructions/3_select_asset.png)
`

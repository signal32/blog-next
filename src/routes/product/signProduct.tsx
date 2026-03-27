import { Markdown } from "#src/components/common/Markdown.tsx";
import { H5 } from "#src/components/common/typography.tsx";
import { Button } from "#src/components/ui/button.tsx";
import { Field, FieldDescription, FieldLabel } from "#src/components/ui/field.tsx";
import { Input } from "#src/components/ui/input.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "#src/components/ui/popover.tsx";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "#src/components/ui/select.tsx";
import { Switch } from "#src/components/ui/switch.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#src/components/ui/tabs.tsx";
import { CUSTOM_SIGN_PRODUCT_ID, products } from "#src/lib/products.server";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Check, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { HexColorPicker } from 'react-colorful';
import * as THREE from "three";
import { Route } from './+types/signProduct';
import { ProductLayout, ProductSidebar } from "./product";
import { Options } from "store";
import { SHOP } from "#src/shop.ts";

type SignConfig = {
    signId: string,
    useCustomTexture: boolean,
    backgroundColour: string,
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
}

type Sign = {
    name: string,
    model: string,
}

type TextureData = {
    asBlob: () => Promise<Blob>,
    dataUrl: string
}

const SIGNS: Record<string, Sign> = {
    test: {
        name: 'Test',
        model: '/static/signs/test_sign.glb',
    },
}

const FONTS = [
    { name: 'Raleway', fontFace: 'Raleway' },
    { name: 'Caveat', fontFace: 'Caveat' },
    { name: 'Sans Serif', fontFace: 'sans-serif' }
]

function createTextureFromConfig(config: SignConfig): TextureData {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error('Could not get canvas context')

    ctx.fillStyle = config.backgroundColour
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const drawText = (config: TextConfig, x: number, y: number, width: number) => {
        ctx.fillStyle = config.textColour
        ctx.font = `bold ${config.textSize}px ${config.textFont}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(config.textValue ?? '', x, y, width);
    }

    drawText(config.primaryText, canvas.width / 2, canvas.height / 2, canvas.width - 40)
    drawText(config.secondaryText, canvas.width / 2, (canvas.height / 2) + config.primaryText.textSize, canvas.width - 40)

    return {
        dataUrl: canvas.toDataURL('image/png'),
        asBlob: () => new Promise((resolve, reject) => {
            canvas.toBlob((blob) => blob !== null ? resolve(blob) : reject(), "image/png");
        })
    }
}

export default function SignProduct({ loaderData }: Route.ComponentProps) {
    const [config, setConfig] = useState<SignConfig>({
        signId: 'test',
        provider: 'Rails Developments',
        product: 'Custom Signs',
        assetName: 'RD Custom sign {{primaryText}}',
        useCustomTexture: false,
        backgroundColour: '#0099ff',
        primaryText: {
            textSize: 48,
            textFont: 'Raleway',
            textColour: '#ffffff'
        },
        secondaryText: {
            textSize: 24,
            textFont: 'Raleway',
            textColour: '#ffffff'
        }
    })

    const [texture, setTexture] = useState<TextureData>()
    useEffect(() => setTexture(createTextureFromConfig(config)), [config])

    const productOptions: () => Promise<Options> = async () => {
        if (!texture) throw new Error('Texture is required.')

        const body = await texture.asBlob()
        const filename = `${config.provider}-${config.product}-${config.assetName}-${crypto.randomUUID()}`
        const { url } = await SHOP.generatePreSignedUploadUrl({ filename, type: 'image/png' })

        await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'image/png',
            },
            body,
        });

        return {
            textureFilename: {
                value: filename,
                hidden: true,
            },
            signConfig: {
                value: JSON.stringify(config),
                hidden: true,
            },
            name: {
                value: config.assetName
            }
        }
    }

    return <ProductLayout product={loaderData.product}>{{
        main: <>
            <Markdown content={loaderData.product.description ?? ''} />

            <div className="p-2 bg-accent/50 rounded-lg shadow">
                <div className="h-96 bg-accent rounded-lg shadow">
                    <ClientOnly>
                        {() => <Viewer
                            model={SIGNS[config.signId].model}
                            texture={texture?.dataUrl}
                        />}
                    </ClientOnly>
                </div>

                <form className="pt-2">
                    <Field className="w-full" orientation="horizontal">
                        <FieldLabel>Model</FieldLabel>
                        <FieldDescription>Select a style for the base 3D model.</FieldDescription>
                        <Select value={config.signId} onValueChange={signId => setConfig(c => ({ ...c, signId }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {Object.entries(SIGNS).map(([id, sign]) => <SelectItem value={id}>{sign.name}</SelectItem>)}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>

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
                            onChange={ev => setConfig(c => ({
                                ...c,
                                product: ev.currentTarget?.value.replaceAll('{{primaryText}}', config.primaryText.textValue ?? '')
                            }))}
                        />
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
                                    ? <p>working on it...</p>
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
                                                        default={config.backgroundColour}
                                                        onChange={backgroundColour => setConfig(c => ({ ...c, backgroundColour }))}
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
                </form>
            </div>
        </>,
        sidebar: <ProductSidebar product={loaderData.product} productOptions={productOptions} />
    }}</ProductLayout>
}

export async function loader({ params }: Route.LoaderArgs) {
    const product = await products.getById(CUSTOM_SIGN_PRODUCT_ID);
    if (!product) throw new Response(undefined, { status: 404 })
    return { product }
}

function Viewer(props: {
    model: string,
    texture?: string,
}) {
    const { scene, materials } = useGLTF(props.model)

    useEffect(() => {
        if (!props.texture) return

        const loader = new THREE.TextureLoader()
        loader.load(props.texture, (tex) => {
            tex.flipY = false

            const mat = materials["sign-board-mat"] as THREE.MeshStandardMaterial
            if (!mat) {
                console.warn("Material not found")
                return
            }

            mat.map = tex
            mat.needsUpdate = true
        })
    }, [props.texture, materials])

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
    default: string,
    onChange?: (colour: string) => void
}) {
    const [currentColour, setCurrentColour] = useState<string>(props.default)
    const [pickerColour, setPickerColour] = useState<string>(props.default)
    const [popoverOpen, setPopoverOpen] = useState(false)

    const onSelect = () => {
        if (!pickerColour) return
        setCurrentColour(pickerColour)
        props.onChange?.(pickerColour)
        setPopoverOpen(false)
    }

    const onCancel = () => {
        setPopoverOpen(false)
    }

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline">{currentColour} <div className="w-5 aspect-square" style={{ backgroundColor: currentColour }}></div></Button>
            </PopoverTrigger>
            <PopoverContent className="w-59">
                <HexColorPicker color={pickerColour} onChange={setPickerColour} />

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
                placeholder="Primary text"
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
                default={props.config.textColour}
                onChange={textColour => props.onChange({ ...props.config, textColour })}
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

import { ContentLayout } from "#src/components/app/BaseLayout.tsx";
import { A, H1, P } from "#src/components/common/typography.tsx";
import { Button } from "#src/components/ui/button.tsx";
import { cn } from "#src/lib/utils.ts";
import { CheckIcon, CopyIcon, Mail, MapPinIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { Route } from './+types/contact';
import { websiteConfig } from "./_app";


export default function Contact({ loaderData }: Route.ComponentProps) {
    return <ContentLayout>
        {/*<div className="flex gap-4">
            <div className="basis-3/5 grow">
                <H1 className='text-3xl font-semibold pt-10 text-center'>👋 Get in touch!</H1>
            </div>
            <div className="basis-2/5 grow" />
        </div>*/}

        <div className="flex gap-4 mt-30 not-sm:flex-wrap">
            <div className="basis-3/5 grow text-center">
                <H1 className="text-3xl font-semibold -mt-25 mb-10 text-center">
                    👋 Get in touch!
                </H1>

                <P className="text-lg">
                    Are you interested in working with me, or have a question?<br />
                    I shall be pleased to hear from you.
                </P>

                <div className="pt-6">
                    <P className="text-lg py-3">The best way to get in touch is by e-mail:</P>
                    <div className="px-4">
                        <EmailHider base64Email={loaderData.base64Email} />
                    </div>
                </div>

                <div className="pt-6">
                    <P className="text-lg py-3">You may also find me on some social platforms:</P>
                    <div className="px-4 flex justify-center gap-2">
                        {websiteConfig.socialLinks.map((link, i) => (
                            <div className="p-2 bg-ocean rounded-lg" key={i}>
                                <a className="text-slate-300 hover:text-white transition-all" href={link.href} target="_blank">{link.icon}</a>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <div className="basis-2/5 grow bg-card/50 border-card-foreground/50 border-2 border-dashed p-2 rounded-xl not-sm:mt-40 not-sm:mx-15">
                <div className="flex justify-center p-6">
                    <img
                        className="w-full max-w-sm rounded-full mb-2 border-3 border-white shadow-2xl -mt-40"
                        src="/graphics/hamish_weir_portrait_square.jpg"
                        alt="Portrait of Hamish Weir"
                    />
                </div>
                <h1 className='text-center text-4xl font-black font-handwritten'>Hamish Weir</h1>
                <h1 className='text-center text-lg font-medium mb-4'>{websiteConfig.personalTagline}</h1>
                <P className="flex justify-center gap-4 p-1 items-center"><MapPinIcon />Midlands, UK</P>
                <p className="text-center border-t-2 border-card-foreground/50 border-dashed mt-2 pt-2">{websiteConfig.personalDescription}</p>
            </div>
        </div>
    </ContentLayout>
}

function EmailHider(props: { base64Email: string }) {
    const [copied, setCopied] = useState(false)
    const [hidden, setHidden] = useState(true)
    const decodedEmail = useMemo(() => hidden ? undefined : atob(props.base64Email), [hidden])

    const copy = () => {
        if (decodedEmail) {
            navigator.clipboard.writeText(decodedEmail)
            setCopied(true)
            setTimeout(() => setCopied(false), 4000)
        }
    }

    return <div
        className={cn(
            "w-full h-15 flex justify-between p-4 rounded-lg text-lg transition-colors shadow-lg text-white",
            copied ? 'bg-green-800' : 'bg-ocean',
            hidden && 'cursor-pointer'
        )}
        onClick={() => setHidden(false)}
    >
        <Mail />
        {
            hidden
                ? <p>Click here to reveal e-mail</p>
                : <div className="w-full flex justify-end gap-2 align-middle">
                    {copied ? <p>Copied!</p> : <A href={`mailto:${decodedEmail}`}>{decodedEmail}</A>}
                    <Button
                        size={'icon-sm'}
                        variant={'ghost'}
                        onClick={copy}
                    >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                    </Button>
                </div>
        }
    </div>
}

export async function loader() {
    return {
        base64Email: Buffer.from('hello@hamishweir.uk', 'utf8').toString('base64')
    }
}

import { ChangeEvent, useEffect, useState } from "react";
import AppBaseLayout, { LayoutRequestProps, defineAppBaseLayoutParams } from "../components/layouts/AppBaseLayout";
import { NextPageWithLayout } from "./_app";
import designHeader from "../resources/images/about_header.jpg";
import TextInput from "../components/common/TextInput";
import InputLabel from "../components/common/InputLabel";

interface Props extends LayoutRequestProps {}

const Simulation: NextPageWithLayout<Props> = (props) => {
    useEffect(() => props.requestLayout({title: 'About', image: designHeader.src}));
    const [feedback, setFeedback] = useState<{}>();

    const validate = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value == 'cake') setFeedback({status: 'success', message: 'Oh yeah!'});
        else if (e.target.value == 'fuck') setFeedback({status: 'danger', message: 'Rude :/'});
        else setFeedback(undefined);
    }

    return (
        <div>
            <h1 className="text-lg">Stuff about me</h1>
            <TextInput placeholder="some value"/>
            <InputLabel text="Your email address">
                <TextInput placeholder="some value"/>
                <TextInput placeholder="some value" feedback={{message: 'Hello'}}/>
            </InputLabel>
            <InputLabel text="You name" input={<TextInput placeholder="placeholder" feedback={{message: 'Yay', status: "success"}}/>}/>
            <InputLabel text="You name" input={<TextInput placeholder="placeholder" feedback={{message: 'hmm', status: "warning"}}/>}/>
            <InputLabel text="You name" input={<TextInput placeholder="placeholder" feedback={{message: 'Uhoh', status: "danger"}}/>}/>

            <p>Test</p>
            <InputLabel text="Your email address">
                <TextInput placeholder="some value" onChange={validate} feedback={feedback}/>
            </InputLabel>
        </div>
    )
}

Simulation.getLayout = (page) => (
    <AppBaseLayout 
        defaultHeaderImage={designHeader.src} 
        defaultHeaderTitle="Simulation">
        {page}
    </AppBaseLayout>
)

export default Simulation;

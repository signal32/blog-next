import Image from 'next/image';
import { LayoutRequestProps, defineLayout } from "../components/app/BaseLayout";
import { PageWithLayout } from '../components/app/LayoutApp';
import { useModalStore } from '../components/common/Modal';
import { useState } from 'react';
// import cambridgeSunset from "../resources/images/pics/DSC00018.jpg";
// import cambridgeUni1 from "../resources/images/pics/DSC00101.jpg";
// import cambridgeUni2 from "../resources/images/pics/DSC00104.jpg";
// import cambridgeUni3 from "../resources/images/pics/DSC00122.jpg";
// import green from "../resources/images/pics/DSC00457.jpg";
// import spectra from "../resources/images/pics/DSC06314.jpg";
// import toHeaven from "../resources/images/pics/DSC09168.jpg";
// import stretham from '../../public/graphics/stretham.jpg'


const PICS: { title: string, source: string }[] = [
    // {
    //     title: 'Cambridge Sunset',
    //     source: cambridgeSunset,
    // },
    // {
    //     title: 'Cambridge Uni',
    //     source: cambridgeUni1,
    // },    
    // {
    //     title: 'Cambridge Uni',
    //     source: cambridgeUni2,
    // }, 
    // {
    //     title: 'Cambridge Uni',
    //     source: cambridgeUni3,
    // }, 
    // {
    //     title: 'Green',
    //     source: green,
    // },    
    // {
    //     title: 'Aliens?',
    //     source: spectra,
    // },    
    // {
    //     title: 'Stairway to Pint',
    //     source: toHeaven,
    // },
    // {
    //     title: 'Boat',
    //     source: stretham,
    // },
]


interface Props extends LayoutRequestProps {}
const Software: PageWithLayout<Props> = (props) => {
    const modals = useModalStore()

    const openImageModal = (index: number) => modals.pushModal(<ImageModal index={index}/>)
    
    return (
        <div>
            <h1 className="text-lg">Photos? Pfft what are they worth now. Well here are mine.</h1>

            <div className="flex flex-wrap -mx-2">
                { 
                    PICS.map((pic, index) => (
                        <div key={index} className="w-1/2 p-2">
                            <Image 
                                src={pic.source}
                                alt={pic.title}
                                className='"w-full h-auto rounded-lg'
                                onClick={() => openImageModal(index)}
                            />
                            <p>{pic.title}</p>
                        </div>
                    ))
                }
            </div>

        </div>
    )
}

Software.layout = defineLayout({
    headerTitle: 'Web Design',
    // header:  {
    //     type: 'image',
    //     href: toHeaven.src,
    // },
})

export default Software;

const ImageModal = (props: { index: number }) => {
    const [index, setIndex] = useState(props.index)

    return (
        <div className='w-screen h-screen max-h-screen flex flex-col justify-center'>
            <div>
                <Image 
                    src={PICS[index].source}
                    alt={PICS[index].title}
                    fill={false}
                    className='"w-auto max-h-full rounded-lg flex-0'
                />
                <div className='flex flex-row justify-between'>
                    { index > 0 && <p onClick={() => setIndex(index - 1)}>Previous</p> }
                    <p>{PICS[index].title}</p>
                    { index < PICS.length && <p onClick={() => setIndex(index + 1)}>Next </p> }
                </div>
            </div>
        </div>
    )
}
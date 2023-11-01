import { useState } from 'react'

const AboutHamish = (props: { encodedEmail: string }) => {

    const [emailText, setEmailText] = useState({
        hidden: true,
        text: `click here to reveal my email.`
    })

    const revealEmail = () => setEmailText({
        hidden: false,
        text: `email me at ${atob(props.encodedEmail)}`
    })

    return (
        <div style={{
            flex: '1 1 40%',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: 'large'
        }}>
            <div>
                <div style={{fontFamily: 'caveat'}} className='float-left pr-6'>
                    <p className=' font-bold text-5xl'>Hello!</p>
                </div>
                <p>I am Hamish, a software engineer and technologist, floating around on the British canals. From developing complex web apps to building detailed rail simulations, I enjoy creating all sorts of things. Although many of these never see the light of day, my more polished projects can be found here.</p>
                <p>Away from the desk I am a keen photographer and publish some of my favourite shots here on this site.</p>
            </div>
   
                       
            <div>
                <h3 className='text-lg font-semibold pt-2'>👋 Get in touch!</h3>
                <p>If you would like to get in touch with me for any reason, please <span className={emailText.hidden ? 'cursor-pointer' : ''} onClick={revealEmail}>{emailText.text}</span> and I happy to hear from you.</p>
                <p>You can also find me on <a href='https://github.com/signal32'>Github</a> and <a>Instagram</a></p>
            </div>
   
        </div>
    )
}

export default AboutHamish
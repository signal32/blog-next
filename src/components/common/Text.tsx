import { ReactNode } from 'react'
import styles from './styles/text.module.scss'

export const Text = (props: {
    children: ReactNode,
    type?: 'heading' | 'subheading' | 'caption' | 'body' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
}) => (
    <div 
        className={[
            'dark:text-white text-black',
            styles[props.type ?? 'body'],
        ].join(' ')}
    >    
        { props.children }
    </div>
)

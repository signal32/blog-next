import Link from "next/link"
import { match } from 'ts-pattern';

interface ButtonProps {
    text: string,
    href?: string,
    onClick?: () => void,
    icon?: JSX.Element,
    size?: 'small' | 'normal' | 'large',
    style?: 'default' | 'outline' | 'text',
    fullWidth?: boolean,
    download?: boolean,
    target?: string,
    rel?: string,
}

const Button = (props: ButtonProps) => {
    const className = [
        'py-2 px-4 my-2', // basics
        'flex justify-between items-center', // flex stuff
        (props.fullWidth? 'w-full' : ''),

    ]

    const baseClasses  = match(props.style)
        .with('outline', () => `bg-ocean text-white rounded-lg shadow-md hover:bg-air`)
        .with('text', () => `hover:text-slate-200`)
        .otherwise(() => `bg-ocean text-white rounded-lg shadow-md hover:bg-air`)

    const sizeClasses = match(props.size)
        .with('small', () => `text-small ${props.style != 'text' && 'py-1 px-2 my-1'}`)
        // .with('large', () => ``)
        .otherwise(() => `py-2 px-4 my-2`)

    const classes = [
        'flex justify-between items-center gap-2',
        'focus:outline-none focus:ring-2 focus:ring-paua focus:ring-opacity-75 transition-all',
        baseClasses,
        sizeClasses,
    ].join(' ');

    const baseButton = (
        <div 
            className={classes}
            // className="py-2 px-4 my-2 w-full flex justify-between items-center bg-ocean text-white rounded-lg shadow-md hover:bg-air focus:outline-none focus:ring-2 focus:ring-paua focus:ring-opacity-75 transition-all"
            onClick={props.onClick}
            >
            <a>{props.text}</a>
            {props.icon}
        </div>
    )

    // Wrap with Next.js Link for SPA functionality on local links
    return props.href? <Link href={props.href} target={props.target} rel={props.rel}>{baseButton}</Link> : <button className="w-full">{baseButton}</button>;
}

export default Button;
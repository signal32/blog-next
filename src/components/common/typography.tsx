import { AnchorHTMLAttributes, ClassAttributes, HTMLAttributes } from 'react'
import { Link } from 'react-router'
import { cn } from '#src/lib/utils'

type ElementProps<T, K = HTMLAttributes<T>> = ClassAttributes<T> & K

export function H1(props: ElementProps<HTMLHeadingElement>) {
    return <h1 {...props} className={cn('text-4xl font-display font-extrabold py-3', props.className)} />
}

export function H2(props: ElementProps<HTMLHeadingElement>) {
    return <h2 {...props} className={cn('text-3xl font-display font-extrabold py-2', props.className)} />
}

export function H3(props: ElementProps<HTMLHeadingElement>) {
    return <h3 {...props} className={cn('text-2xl font-display font-bold py-2', props.className)} />
}

export function H4(props: ElementProps<HTMLHeadingElement>) {
    return <h4 {...props} className={cn('text-xl font-display font-bold', props.className)} />
}

export function H5(props: ElementProps<HTMLHeadingElement>) {
    return <h5 {...props} className={cn('text-lg font-display font-semibold', props.className)} />
}

export function H6(props: ElementProps<HTMLHeadingElement>) {
    return <h6 {...props} className={cn('text-lg font-display font-semibold', props.className)} />
}

export function P(props: ElementProps<HTMLParagraphElement>) {
    return <p {...props} className={cn('text-base', props.className)} />
}

export function A(props: ElementProps<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>) {
    return props.href?.startsWith('/')
        ? <Link to={props.href} className='underline' {...props} />
        : <a className='underline' {...props} />
}

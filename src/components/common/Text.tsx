import { ReactNode } from 'react'

export const Text = (props: { children: ReactNode }) => (
    <div className='dark:text-white text-black'>
        { props.children }
    </div>
)

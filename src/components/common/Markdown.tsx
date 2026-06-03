import ReactMarkdown, { Components } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { ContentLibrary, type Content } from '#src/lib/content.server'
import PostItem from '../posts/PostItem'
import { useEffect, useState } from 'react'
import * as typography from '#src/components/common/typography'
import { Post } from '#src/lib/posts.server'
import { Product } from '#src/lib/products.server'
import { Skeleton } from '../ui/skeleton'

export const Markdown = (props: {
    content: string,
    contentLibraries?: { posts: ContentLibrary<Post>, products: ContentLibrary<Product> }
}) => (


    <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        disallowedElements={[]}
        components={{
            content: (attrs: Record<string, string>) => {
                const library = attrs['library']
                if (!library) throw new Error('No library specified')
                const contentId = attrs['id']
                if (!contentId) throw new Error('No content ID')

                const [content, setContent] = useState<Content>()

                useEffect(() => {
                    fetch(`/api/content/${library}/${contentId}`)
                        .then(res => res.json())
                        .then(setContent)
                }, [attrs['id']])

                return content
                    ? <div className='no-markdown'><PostItem post={content} showImage /></div>
                    : <Skeleton className='w-full h-48' />
            },
            h1: typography.H1,
            h2: typography.H2,
            h3: typography.H3,
            h4: typography.H4,
            h5: typography.H5,
            h6: typography.H6,
            a: typography.A,
            p: (props) => <typography.P className='mb-3' {...props} />,
            ul: (props) => <ul className='px-5 list-disc' {...props} />,
            ol: (props) => <ol className='px-5 list-decimal' {...props} />,
            li: (props) => <li className='my-1' {...props} />,
            blockquote: (props) => <blockquote className='my-2 p-1 bg-card border-l-4 border-r-primary rounded shadow' {...props} />,
            img: (props) => <img className='w-full my-3 rounded-lg shadow-lg' {...props} />,

        } as Components}
    >{props.content}</ReactMarkdown>
)

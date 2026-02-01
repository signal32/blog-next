import ReactMarkdown, { Components } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
// import styles from './styles/markdown.module.css'
import PostItem from '../posts/PostItem'
import { type Content } from 'src/lib/content.server'
import { PreRenderCache } from 'src/lib/preRenderCache.server'
import * as typography from 'src/components/common/typography'

export const Markdown = (props: {
    content: string,
    cache?: PreRenderCache
}) => (

    <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        disallowedElements={[]}
        components={{
            content: (attrs: Record<string, string>) => {
                const contentType = attrs['type']
                if (!contentType) throw new Error('Wrong content type')
                const contentId = attrs['id']
                if (!contentId) throw new Error('No content ID')

                let content: Content | undefined
                if (contentType === 'post') {
                    content = props.cache?.allPosts.find(post => post.id === contentId)
                }
                if (contentType === 'product') {
                    content = props.cache?.allProducts.find(product => product.id === contentId)
                }

                return content
                    ? <div className='no-markdown'><PostItem post={content} showImage /></div>
                    : <p>Could not find thing</p>
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

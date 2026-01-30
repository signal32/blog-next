import ReactMarkdown from 'react-markdown'
import styles from './styles/markdown.module.css'

export const Markdown = (props: { content: string }) => (
    <div className={styles.markdown}>
        <ReactMarkdown>{props.content}</ReactMarkdown>
    </div>
)

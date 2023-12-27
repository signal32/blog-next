import ReactMarkdown from 'react-markdown'
import styles from './styles/markdown.module.scss'

export const Markdown = (props: { content: string }) => (
    <ReactMarkdown className={styles.markdown}>{props.content}</ReactMarkdown>
)

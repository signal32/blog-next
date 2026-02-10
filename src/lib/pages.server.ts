import { readFile } from 'fs/promises'
import { defineContent, defineFileSource } from './content.server'
import { type Post, isPost } from './posts.server'
import matter from 'gray-matter'

export const pages = defineContent<Post>([
    defineFileSource<Post>('content/pages', async (descriptor, path) => {
        const fileContents = await readFile(path)
        const { data, content } = matter(fileContents)

        const post = {
            ...descriptor,
            ...data,
            content,
        }

        if (isPost(post)) return post
        else throw Error('Invalid post data')
    })
])

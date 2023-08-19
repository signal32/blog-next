import { readFile } from 'fs/promises'
import { defineContent } from './content'
import { Post, isPost } from './posts'
import matter from 'gray-matter'

export const pages = defineContent<Post>('pages', async(descriptor, path) => {
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
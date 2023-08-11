import fs from 'fs'
import matter from 'gray-matter';
import { join } from 'path';
import { Content, ContentDescriptor, defineContent } from './content';
import { readFile } from 'fs/promises';

const POST_DIR = join(process.cwd(), '/content/posts');

export interface Post extends Content {
    author?: string
    content?: string
}

function isPost(obj: any): obj is Post {
  return (
    typeof obj === 'object' && obj !== null 
    && 'slug' in obj && typeof obj.slug === 'string'
    && 'title' in obj && typeof obj.title === 'string'
    //&& 'date' in obj && typeof obj.date === 'string'
    // && ...
  );
}

export const posts = defineContent<Post>('posts', async(descriptor, path) => {
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

export function getPostSlugs() {
    return fs.readdirSync(POST_DIR);
}

/**
 *
 * @param slug Unique slug which identifies target post
 * @param fields YAML Fields to extract from post markdown. Use `content` for post main content.
 * @returns
 */
 export function getPostBySlug(slug: string, fields: string[] = []) {
    const realSlug = slug.replace(/\.md$/, '')
    const fullPath = join(POST_DIR, `${realSlug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    type Items = {
      [key: string]: string
    }

    const items: Items = {
      baseUrl: '/blog'
    }

    // Ensure only the minimal needed data is exposed
    fields.forEach((field) => {
      if (field === 'slug') {
        items[field] = realSlug
      }
      if (field === 'content') {
        items[field] = content
      }

      if (typeof data[field] !== 'undefined') {
        items[field] = data[field]
      }
    })

    return items as unknown as Post;
  }

const DEFAULT_POST_FIELDS = [
    'title',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
    'excerpt',
]

export function getAllPosts(fields: string[] = DEFAULT_POST_FIELDS) {
    const slugs = getPostSlugs();
    const posts  = slugs
        .map((slug) => getPostBySlug(slug, fields))
        .sort((post1, post2) => (post1?.created || 0) > (post2?.created || 1) ? -1 : 1);
    return posts;
}

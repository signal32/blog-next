import fs from 'fs';
import { readFile } from 'fs/promises';
import matter from 'gray-matter';
import { join } from 'path';
import { Content, ContentRoutingConfig, defineContent, defineFileSource } from './content.server';

const POST_DIR = join(process.cwd(), '/content/posts');
const POST_ROUTING_CONFIG: ContentRoutingConfig = {
    basePath: 'posts',
    contentPage: './routes/posts/post.tsx',
    listPage: './routes/posts/list.tsx',
    indexPage: './routes/posts/index.tsx',
    pageSize: 3
}

export interface Post extends Content {
    author?: string
    content?: string,
    page?: boolean,
}

export function isPost(obj: any): obj is Post {
    return (
        typeof obj === 'object' && obj !== null
        && 'slug' in obj && typeof obj.slug === 'string'
        && 'name' in obj && typeof obj.name === 'string'
        && (
            'created' in obj && !isNaN(new Date(obj.created).valueOf())
            || !('created' in obj)
        )
    );
}

export const posts = defineContent<Post>(
    [
        defineFileSource('content/posts', async (descriptor, path) => {
            const fileContents = await readFile(path)
            const { data, content } = matter(fileContents)

            const post = {
                ...descriptor,
                ...data,
                content,
                baseUrl: '/posts'
            } as Post
            if (isPost(post)) return post
            else throw new Error("Invalid post data")
        })
    ],
    POST_ROUTING_CONFIG,
)

export function getPostSlugs() {
    return fs.readdirSync(POST_DIR);
}

/**
 * @deprecated use `posts`
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
    'name',
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
    const posts = slugs
        .map((slug) => getPostBySlug(slug, fields))
        .sort((post1, post2) => (post1?.created || 0) > (post2?.created || 1) ? -1 : 1);
    return posts;
}

export const BlOG_PAGE_SIZE = 3
export async function getBlogPosts() {
    const allPosts = await posts.getAllDetailed()
    const pages = Math.ceil(allPosts.length / BlOG_PAGE_SIZE)
    return { allPosts, pages }
}

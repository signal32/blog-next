import fs from 'fs';
import { join } from 'path';
import { Content, ContentDescriptor, defineContent } from './content';

const PUBLIC_FILE_DIR = join(process.cwd(), 'public', 'content', 'files');
const API_FILE_DIR = join(process.cwd(), 'public', 'content', 'files');
const METHODS = {
    public: {dir: API_FILE_DIR, href: (details: FileDetails) =>  `/content/files/${details.fileName}`},
    api: {dir: PUBLIC_FILE_DIR, href: (details: FileDetails) => `/api/file?slug=${details.slug}`},
    filerun: {dir: undefined, href: (details: FileDetails) => `https://files.hamishweir.uk/wl/?id=${details.fileName}&fmode=download`}
};

type Method = keyof typeof METHODS;

export interface FileDetails extends Content {
    type: string
    method: Method,
    href: string
}

export const files = defineContent<FileDetails>('files', async (desc, path) => {
    const metadataPath = getMetadataPath(path);
    const details = getDetails(desc, path, metadataPath);

    details.href = METHODS[details.method].href(details);
    return details;
})

export const getFileDir = (file: FileDetails) => METHODS[file.method].dir;

/**
 * Files can either:
 *  - Be stored on their own
 *  - Be stored in a named subdirectory alongside a metadata.json file
 *  - Be described by a metadata.json file (that points to remote data source)
 */
const getMetadataPath = (path: string) => {
    if (fs.lstatSync(path).isDirectory()) return join(path, 'metadata.json');
    if (path.substring(path.indexOf('.')) == '.json') return path;
    else return undefined;
}

/**
 * Get file metadata or infer it
 * Importantly, FileDetails::fileName must point to the file, not the metadata file!
 */
const getDetails = (desc: ContentDescriptor, path: string, metadataPath?: string) => {
    if (metadataPath) {
        const buf = fs.readFileSync(metadataPath, 'utf8');
        const json = JSON.parse(buf);
        return {...desc, ...json} as FileDetails;
    }
    else return {
            type: path.substring(path.indexOf('.') + 1),
            method: 'public',
    } as FileDetails;
}

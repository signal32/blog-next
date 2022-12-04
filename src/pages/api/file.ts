import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next'
import { join } from 'path';
import { files, getFileDir } from '../../lib/file';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
    const id = req.query['slug'];
    if (id && typeof id == 'string') {
        const file = files.getBySlug(id);
        if (file) {
            const path = join(getFileDir(file), file.fileName);
            const stats = fs.statSync(path);
            res.writeHead(200, {
                'Content-Type': 'audio.mpeg',
                'Content-Length': stats.size,
            })
            const stream = fs.createReadStream(path);
            stream.pipe(res);
        }
        else res.status(404).json({error: 'File with this slug was not found'});
    }
    else res.status(400).json({error: 'Invalid slug'});
}

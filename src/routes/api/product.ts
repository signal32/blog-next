import type { NextApiRequest, NextApiResponse } from 'next'
import { Product, products } from '../../lib/products'

// export default function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<Product>
// ) {
//     const id = req.query['id'];
//     if (id && typeof id == 'string') {
//         const product = products.getBySlug(id);
//         if (product) res.status(200).json(product);
//         else res.status(404);
//     }
// }

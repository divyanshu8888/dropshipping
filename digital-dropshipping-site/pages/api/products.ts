import { NextApiRequest, NextApiResponse } from 'next';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../../src/lib/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const getFirstQueryValue = (value: string | string[] | undefined) => {
        if (Array.isArray(value)) {
            return value[0];
        }
        return value;
    };

    switch (req.method) {
        case 'GET':
            try {
                const idParam = getFirstQueryValue(req.query.id);
                const slugParam = getFirstQueryValue(req.query.slug);
                const categoryParam = getFirstQueryValue(req.query.category);

                if (idParam || slugParam) {
                    // Get single product
                    const identifier = slugParam ?? idParam;
                    if (!identifier) {
                        return res.status(400).json({ message: 'Product identifier is required' });
                    }
                    const product = await getProduct(identifier);
                    if (!product) {
                        return res.status(404).json({ message: 'Product not found' });
                    }
                    res.status(200).json(product);
                } else {
                    // Get all products
                    const products = await getProducts(
                        categoryParam
                            ? {
                                categoryName: categoryParam
                              }
                            : {}
                    );
                    res.status(200).json(products);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).json({ message: 'Error fetching products' });
            }
            break;

        case 'POST':
            try {
                const product = await createProduct(req.body);
                res.status(201).json(product);
            } catch (error) {
                console.error('Error creating product:', error);
                res.status(500).json({ message: 'Error creating product' });
            }
            break;

        case 'PUT':
            try {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ message: 'Product ID is required' });
                }
                const product = await updateProduct(Number(id), req.body);
                res.status(200).json(product);
            } catch (error) {
                console.error('Error updating product:', error);
                res.status(500).json({ message: 'Error updating product' });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ message: 'Product ID is required' });
                }
                await deleteProduct(Number(id));
                res.status(200).json({ message: 'Product deleted successfully' });
            } catch (error) {
                console.error('Error deleting product:', error);
                res.status(500).json({ message: 'Error deleting product' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
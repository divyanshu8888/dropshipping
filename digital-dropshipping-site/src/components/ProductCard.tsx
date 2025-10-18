import React from 'react';

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    onAddToCart: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, title, price, imageUrl, onAddToCart }) => {
    return (
        <div className="border rounded-lg p-4">
            <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded" />
            <h2 className="text-lg font-semibold mt-2">{title}</h2>
            <p className="text-xl font-bold">${price.toFixed(2)}</p>
            <button 
                onClick={() => onAddToCart(id)} 
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
            >
                Add to Cart
            </button>
        </div>
    );
};

export default ProductCard;
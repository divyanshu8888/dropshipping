import React from 'react';
import { useCart } from '../hooks/useCart';

const CartSummary: React.FC = () => {
    const { items, total } = useCart();

    return (
        <div className="cart-summary">
            <h2>Cart Summary</h2>
            {items.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <ul>
                    {items.map((item) => (
                        <li key={item.id}>
                            {item.name} - ${item.price} x {item.quantity}
                        </li>
                    ))}
                </ul>
            )}
            <h3>Total: ${total}</h3>
        </div>
    );
};

export default CartSummary;
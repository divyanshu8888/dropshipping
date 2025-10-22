import React from 'react';
import useCart from '../hooks/useCart';

const CartSummary: React.FC = () => {
    const { cartItems, totalAmount } = useCart();

    return (
        <div className="cart-summary">
            <h2>Cart Summary</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <ul>
                    {cartItems.map((item) => (
                        <li key={item.id}>
                            {item.name} - ${item.price} x {item.quantity}
                        </li>
                    ))}
                </ul>
            )}
            <h3>Total: ${totalAmount}</h3>
        </div>
    );
};

export default CartSummary;
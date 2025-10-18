import React from 'react';
import { useCart } from '../hooks/useCart';
import CartSummary from '../components/CartSummary';
import { useRouter } from 'next/router';

const CartPage = () => {
    const { cartItems, totalAmount } = useCart();
    const router = useRouter();

    const handleCheckout = () => {
        router.push('/checkout');
    };

    return (
        <div className="cart-page">
            <h1>Your Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    <CartSummary items={cartItems} totalAmount={totalAmount} />
                    <button onClick={handleCheckout} className="checkout-button">
                        Proceed to Checkout
                    </button>
                </>
            )}
        </div>
    );
};

export default CartPage;
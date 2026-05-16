import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';
import useCart from '../src/hooks/useCart';

const Checkout = () => {
    const router = useRouter();
    const { cartItems, totalAmount, clearCart } = useCart();
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerAddress: '',
        paymentMethod: 'creditCard',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (cartItems.length === 0) {
            router.push('/cart');
        }
    }, [cartItems.length, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const orderData = {
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                customerAddress: formData.customerAddress,
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                clearCart();
                router.push('/thank-you');
            } else {
                throw new Error('Failed to process order');
            }
        } catch (err) {
            setError('Failed to process the order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return null; // Will redirect to cart
    }

    return (
        <>
            <Head>
                <title>Checkout - Uniti Store</title>
                <meta name="description" content="Complete your order securely" />
            </Head>

            <div className="min-h-screen bg-[#0B0D10]">
                <Header />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">Checkout</h1>
                        <nav className="mt-2">
                            <ol className="flex items-center space-x-2 text-sm">
                                <li>
                                    <Link href="/" className="text-white/50 hover:text-white/70 transition">
                                        Home
                                    </Link>
                                </li>
                                <li className="text-white/40">/</li>
                                <li>
                                    <Link href="/cart" className="text-white/50 hover:text-white/70 transition">
                                        Cart
                                    </Link>
                                </li>
                                <li className="text-white/40">/</li>
                                <li className="text-white font-medium">Checkout</li>
                            </ol>
                        </nav>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Checkout Form */}
                        <div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6">
                                <h2 className="text-lg font-semibold text-white mb-6">Shipping Information</h2>

                                {error && (
                                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                        <p className="text-rose-400">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="customerName" className="block text-sm font-medium text-white/70 mb-1.5">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="customerName"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleChange}
                                            required
                                            className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="customerEmail" className="block text-sm font-medium text-white/70 mb-1.5">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="customerEmail"
                                            name="customerEmail"
                                            value={formData.customerEmail}
                                            onChange={handleChange}
                                            required
                                            className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="customerAddress" className="block text-sm font-medium text-white/70 mb-1.5">
                                            Shipping Address *
                                        </label>
                                        <textarea
                                            id="customerAddress"
                                            name="customerAddress"
                                            value={formData.customerAddress}
                                            onChange={handleChange}
                                            required
                                            rows={3}
                                            className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-white/70 mb-1.5">
                                            Payment Method *
                                        </label>
                                        <select
                                            id="paymentMethod"
                                            name="paymentMethod"
                                            value={formData.paymentMethod}
                                            onChange={handleChange}
                                            className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                                        >
                                            <option value="creditCard" className="bg-[#0B0D10]">Credit Card</option>
                                            <option value="paypal" className="bg-[#0B0D10]">PayPal</option>
                                            <option value="stripe" className="bg-[#0B0D10]">Stripe</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold px-6 py-3 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:to-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />
                                                Processing...
                                            </span>
                                        ) : 'Complete Purchase'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6">
                                <h2 className="text-lg font-semibold text-white mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-12 h-12 object-cover rounded-xl border border-white/10"
                                            />
                                            <div className="flex-1">
                                                <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                                                <p className="text-xs text-white/50">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-white">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-white/8 pt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/70">Subtotal</span>
                                            <span className="text-white font-semibold">${totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/70">Shipping</span>
                                            <span className="text-white font-semibold">Free</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/70">Tax</span>
                                            <span className="text-white font-semibold">$0.00</span>
                                        </div>
                                        <div className="border-t border-white/8 pt-2">
                                            <div className="flex justify-between text-lg">
                                                <span className="text-white font-semibold">Total</span>
                                                <span className="text-white font-semibold">${totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-emerald-500/15 border border-emerald-500/20 rounded-xl">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-emerald-300 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-emerald-300 font-medium text-sm">Secure Checkout</span>
                                    </div>
                                    <p className="text-emerald-300/70 text-xs mt-1">
                                        Your payment information is encrypted and secure.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;

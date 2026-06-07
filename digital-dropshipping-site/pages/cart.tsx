import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';
import useCart from '../src/hooks/useCart';

const CartPage = () => {
    const { cartItems, totalAmount, removeFromCart, clearCart } = useCart();
    const router = useRouter();

    const handleCheckout = () => {
        router.push('/checkout');
    };

    const handleRemoveItem = (id: string) => {
        removeFromCart(id);
    };

    return (
        <>
            <Head>
                <title>Shopping Cart - Unitiv Store</title>
                <meta name="description" content="Review your items and proceed to checkout" />
            </Head>

            <div className="min-h-screen bg-[#0B0D10]">
                <Header />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
                        <nav className="mt-2">
                            <ol className="flex items-center space-x-2 text-sm">
                                <li>
                                    <Link href="/" className="text-white/50 hover:text-white/70 transition">
                                        Home
                                    </Link>
                                </li>
                                <li className="text-white/40">/</li>
                                <li className="text-white font-medium">Cart</li>
                            </ol>
                        </nav>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center text-white/40">
                            <svg className="mx-auto h-24 w-24 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L12 21m-2.5-3L12 21m0 0l2.5-3M12 21l-2.5-3m0 0L7 13" />
                            </svg>
                            <h2 className="mt-4 text-xl font-semibold text-white/60">Your cart is empty</h2>
                            <p className="mt-2 text-white/40">Start adding some products to see them here.</p>
                            <Link
                                href="/products"
                                className="mt-6 inline-flex items-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold px-6 py-3 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:to-blue-400 transition"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-white/10">
                                        <h2 className="text-lg font-semibold text-white">
                                            Cart Items ({cartItems.length})
                                        </h2>
                                    </div>
                                    <div className="divide-y divide-white/[0.06] px-4 py-2">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 my-2 flex items-center space-x-4 hover:border-white/20 transition">
                                                <div className="rounded-xl border border-white/10 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-16 h-16 object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-white truncate">{item.name}</h3>
                                                    <p className="text-white/70 text-sm">${item.price.toFixed(2)} each</p>
                                                </div>
                                                <div className="flex items-center space-x-3 flex-shrink-0">
                                                    <span className="text-sm text-white/50">
                                                        Qty: {item.quantity}
                                                    </span>
                                                    <span className="text-lg font-bold text-cyan-300">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-rose-400/60 hover:text-rose-400 p-2 transition flex-shrink-0"
                                                    aria-label="Remove item"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-6 py-4 border-t border-white/10">
                                        <button
                                            onClick={clearCart}
                                            className="rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 px-4 py-2 text-sm font-medium transition hover:bg-rose-500/15"
                                        >
                                            Clear Cart
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6">
                                    <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
                                    <div className="space-y-3">
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
                                        <div className="border-t border-white/8 pt-3">
                                            <div className="flex justify-between text-lg">
                                                <span className="text-white font-semibold">Total</span>
                                                <span className="text-white font-semibold">${totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full mt-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold px-6 py-3 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:to-blue-400 transition"
                                    >
                                        Proceed to Checkout
                                    </button>
                                    <Link
                                        href="/products"
                                        className="block mt-3 text-center rounded-xl border border-white/10 bg-white/5 text-white/70 px-4 py-2 hover:bg-white/10 transition text-sm"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartPage;

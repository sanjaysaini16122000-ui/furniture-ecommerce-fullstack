import { Link, useSearchParams } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';

export default function PaymentCancel() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <div className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
            <div className="container">
                <ScrollReveal animation="zoom-in">
                    <div className="payment-status-card" style={{ 
                        maxWidth: '500px', 
                        margin: '0 auto', 
                        textAlign: 'center', 
                        padding: '3rem', 
                        background: 'white', 
                        borderRadius: '24px', 
                        boxShadow: '0 20px 50px rgba(0,0,0,0.05)', 
                        border: '1px solid var(--color-gray-100)' 
                    }}>
                        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>❌</div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-danger)' }}>Payment Cancelled</h2>
                        <p style={{ marginBottom: '2.5rem', color: 'var(--color-gray-600)', fontSize: '1.1rem' }}>
                            The payment process was cancelled. No charges were made. You can try paying again from your order details page.
                        </p>
                        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
                            {orderId ? (
                                <Link to={`/account/orders/${orderId}`} className="btn btn-primary">
                                    Return to Order
                                </Link>
                            ) : (
                                <Link to="/cart" className="btn btn-primary">
                                    Back to Cart
                                </Link>
                            )}
                            <Link to="/contact" className="btn btn-outline">
                                Need Help?
                            </Link>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}

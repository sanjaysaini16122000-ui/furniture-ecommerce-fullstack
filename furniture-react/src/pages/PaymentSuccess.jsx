import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import { paymentsAPI } from '../services/api';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const [isVerifying, setIsVerifying] = useState(true);
    const [error, setError] = useState(null);
    const orderId = searchParams.get('order_id');
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const verify = async () => {
            if (!sessionId && !orderId) {
                setError('No order information found. Please check your orders page.');
                setIsVerifying(false);
                return;
            }

            try {
                if (sessionId) {
                    await paymentsAPI.verifyPayment({ 
                        session_id: sessionId 
                    });
                } else if (orderId) {
                    await paymentsAPI.verifyPayment({ 
                        order_id: orderId,
                        transaction_id: `SIM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                    });
                }
            } catch (err) {
                console.error('Verification error:', err);
                setError('Could not verify payment status. Please check your orders page.');
            } finally {
                setIsVerifying(false);
            }
        };

        verify();
    }, [orderId, sessionId]);

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
                        {isVerifying ? (
                            <>
                                <div className="orders-loading-spinner" style={{ width: '60px', height: '60px', margin: '0 auto 2rem' }}></div>
                                <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>Verifying Payment...</h2>
                                <p>Please wait while we confirm your transaction and secure your order.</p>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>{error ? '⚠️' : '✅'}</div>
                                <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                                    {error ? 'Payment Notice' : 'Payment Successful!'}
                                </h2>
                                <p style={{ marginBottom: '2.5rem', color: 'var(--color-gray-600)', fontSize: '1.1rem' }}>
                                    {error || 'Thank you for your order! Your payment has been processed successfully and your furniture is being prepared.'}
                                </p>
                                <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
                                    <Link to="/account/orders" className="btn btn-primary">
                                        View My Orders
                                    </Link>
                                    <Link to="/furniture" className="btn btn-outline">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}

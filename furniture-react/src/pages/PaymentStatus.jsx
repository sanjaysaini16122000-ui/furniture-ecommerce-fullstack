import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { usePayment } from '../context/PaymentContext';
import ScrollReveal from '../components/ScrollReveal';

export default function PaymentStatus() {
    const location = useLocation();
    const navigate = useNavigate();
    const { confirmPayment } = usePayment();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Please wait while we verify your payment...');
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const p_id = queryParams.get('payment_id') || queryParams.get('razorpay_payment_id');
        const o_id = queryParams.get('order_id') || queryParams.get('razorpay_order_id');
        const sig = queryParams.get('signature') || queryParams.get('razorpay_signature');

        setOrderId(queryParams.get('app_order_id') || o_id);

        if (p_id && o_id) {
            verify(p_id, o_id, sig);
        } else {
            setStatus('error');
            setMessage('Invalid payment information received.');
        }
    }, [location]);

    const verify = async (paymentId, gatewayOrderId, signature) => {
        const result = await confirmPayment({
            payment_id: paymentId,
            gateway_order_id: gatewayOrderId,
            signature: signature
        });

        if (result.success) {
            setStatus('success');
            setMessage('Your payment was successful and your order is confirmed!');
        } else {
            setStatus('error');
            setMessage(result.error || 'Payment verification failed. Please contact support if money was debited.');
        }
    };

    return (
        <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
            <div className="container">
                <ScrollReveal animation="zoom-in">
                    <div className="payment-status-card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid var(--color-gray-100)' }}>
                        {status === 'verifying' && (
                            <>
                                <div className="loader" style={{ margin: '0 auto 2rem' }}></div>
                                <h2>Verifying Payment</h2>
                                <p style={{ color: 'var(--color-gray-500)' }}>{message}</p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div style={{ fontSize: '4rem', marginBottom: '1.5rem', color: 'var(--color-success)' }}>✅</div>
                                <h2 className="gradient-text">Payment Successful!</h2>
                                <p style={{ marginBottom: '2rem', color: 'var(--color-gray-600)' }}>{message}</p>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                    <Link to={`/account/orders/${orderId || ''}`} className="btn btn-primary">View Order</Link>
                                    <Link to="/furniture" className="btn btn-outline">Continue Shopping</Link>
                                </div>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>❌</div>
                                <h2 style={{ color: 'var(--color-danger)' }}>Payment Failed</h2>
                                <p style={{ marginBottom: '2rem', color: 'var(--color-gray-600)' }}>{message}</p>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                    {orderId ? (
                                        <Link to={`/account/orders/${orderId}`} className="btn btn-primary">Try Again</Link>
                                    ) : (
                                        <Link to="/cart" className="btn btn-primary">Back to Cart</Link>
                                    )}
                                    <Link to="/contact" className="btn btn-outline">Support</Link>
                                </div>
                            </>
                        )}
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}

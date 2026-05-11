import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { paymentsAPI } from '../services/api';

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const initiatePayment = useCallback(async (orderId) => {
        try {
            setLoading(true);
            const response = await paymentsAPI.createIntent(orderId);
            setError(null);
            return { success: true, data: response }; // Likely contains transaction id, checkout url, etc.
        } catch (err) {
            console.error('[PaymentContext] Error initiating payment:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to initiate payment';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }, []);

    const confirmPayment = useCallback(async (paymentData) => {
        try {
            setLoading(true);
            const response = await paymentsAPI.verifyPayment(paymentData);
            setError(null);
            return { success: true, data: response };
        } catch (err) {
            console.error('[PaymentContext] Error confirming payment:', err);
            const errorMsg = err.response?.data?.message || 'Payment verification failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }, []);

    const value = useMemo(() => ({
        loading,
        error,
        initiatePayment,
        confirmPayment
    }), [loading, error, initiatePayment, confirmPayment]);

    return (
        <PaymentContext.Provider value={value}>
            {children}
        </PaymentContext.Provider>
    );
}

export function usePayment() {
    const context = useContext(PaymentContext);
    if (!context) throw new Error('usePayment must be used within PaymentProvider');
    return context;
}

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('checking');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (sessionId) {
      pollPaymentStatus(sessionId);
    }
  }, [sessionId]);

  const pollPaymentStatus = async (sid, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus('timeout');
      return;
    }

    try {
      const response = await axios.get(`${API}/payments/status/${sid}`);
      setPaymentData(response.data);

      if (response.data.payment_status === 'paid') {
        setStatus('success');
        return;
      } else if (response.data.status === 'expired') {
        setStatus('expired');
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sid, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-creatorflow-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {status === 'checking' && (
          <div className="glass rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2">Processing Payment...</h1>
            <p className="text-muted">Please wait while we confirm your payment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="glass rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted mb-6">
              Thank you for your purchase. Your payment of ${(paymentData?.amount_total / 100).toFixed(2)} has been processed.
            </p>
            <div className="space-y-3">
              <Link to="/dashboard">
                <Button className="w-full btn-gradient" data-testid="go-to-dashboard">
                  Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'timeout' && (
          <div className="glass rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-warning" />
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2">Payment Processing</h1>
            <p className="text-muted mb-6">
              Your payment is being processed. Please check your email for confirmation.
            </p>
            <Link to="/">
              <Button className="w-full btn-gradient">Back to Home</Button>
            </Link>
          </div>
        )}

        {status === 'expired' && (
          <div className="glass rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2">Session Expired</h1>
            <p className="text-muted mb-6">
              Your payment session has expired. Please try again.
            </p>
            <Link to="/">
              <Button className="w-full btn-gradient">Back to Home</Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="glass rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2">Something Went Wrong</h1>
            <p className="text-muted mb-6">
              We couldn't verify your payment. Please contact support if you were charged.
            </p>
            <Link to="/">
              <Button className="w-full btn-gradient">Back to Home</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-creatorflow-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="glass rounded-2xl p-8">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-heading font-bold mb-2">Payment Cancelled</h1>
          <p className="text-muted mb-6">
            Your payment was cancelled. No charges were made to your account.
          </p>
          <div className="space-y-3">
            <Link to="/">
              <Button className="w-full btn-gradient" data-testid="back-to-home">
                <ArrowLeft className="mr-2 w-4 h-4" /> Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;

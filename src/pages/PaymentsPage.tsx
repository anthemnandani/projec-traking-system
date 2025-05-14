
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentList from '@/components/payments/PaymentList';
import AddPaymentDialog from '@/components/payments/AddPaymentDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PaymentsPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<string | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        {isAdmin && (
          <Button onClick={() => setOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Payment
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>
            {isAdmin 
              ? "Track and manage all client payments."
              : "View and pay your invoices."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentList onEdit={(id) => {
            // Only admins can edit payments
            if (isAdmin) {
              setPaymentToEdit(id);
              setOpen(true);
            }
          }} />
        </CardContent>
      </Card>

      {isAdmin && (
        <AddPaymentDialog
          open={open}
          onOpenChange={setOpen}
          paymentId={paymentToEdit}
          onPaymentSaved={() => setPaymentToEdit(null)}
        />
      )}
    </div>
  );
};

export default PaymentsPage;

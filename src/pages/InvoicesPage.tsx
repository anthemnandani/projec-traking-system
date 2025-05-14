
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

const InvoicesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const clientId = user?.clientId;
  
  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['invoices', clientId],
    queryFn: async () => {
      try {
        let query = supabase.from('invoices').select('*');
        
        // Filter by client_id if it's a client user
        if (clientId) {
          query = query.eq('client_id', clientId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching invoices:', error);
        
        // Mock data for development
        return [
          {
            id: '1',
            client_id: clientId || '1',
            task_id: '101',
            amount: 2500,
            status: 'pending',
            due_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            client_id: clientId || '1',
            task_id: '102',
            amount: 1800,
            status: 'paid',
            due_date: new Date().toISOString(),
            paid_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            client_id: clientId || '1',
            task_id: '103',
            amount: 3200,
            status: 'overdue',
            due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      }
    }
  });

  const handlePayNow = (invoice: any) => {
    // In a production app, this would integrate with PayPal's API
    window.open(`https://www.paypal.com/checkoutnow?token=demo-${invoice.id}`, '_blank');
    
    toast.success('Redirecting to PayPal for payment processing');
    
    // Simulate a successful payment after 3 seconds (for demo purposes)
    setTimeout(() => {
      // In a real app, we'd listen for the payment confirmation webhook
      // For now, simulate updating the invoice status
      toast.success('Payment successful! Invoice status updated to paid.');
      
      // Refresh the invoice list
      refetch();
    }, 3000);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Overdue</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
          <CardDescription>
            {isAdmin 
              ? "Track and manage all client invoices"
              : "View and pay your invoices"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-anthem-purple"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  {isAdmin && <TableHead>Client</TableHead>}
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-4 text-muted-foreground">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices?.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">INV-{invoice.id.toString().padStart(5, '0')}</TableCell>
                      {isAdmin && <TableCell>{invoice.client_id}</TableCell>}
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {invoice.status !== 'paid' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePayNow(invoice)}
                            className="flex items-center gap-1"
                          >
                            <CreditCard className="h-3 w-3" />
                            Pay Now
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicesPage;

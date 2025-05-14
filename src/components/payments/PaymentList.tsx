import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Payment, PaymentStatus } from '@/types';
import { Edit, MoreVertical, Trash2, FileText, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock data for payment list
const mockPayments: Payment[] = [
  {
    id: '1',
    taskId: '101',
    clientId: '1',
    amount: 2500.00,
    status: 'due',
    dueDate: new Date('2023-06-30'),
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15')
  },
  {
    id: '2',
    taskId: '102',
    clientId: '2',
    amount: 1800.00,
    status: 'invoiced',
    dueDate: new Date('2023-07-15'),
    invoiceNumber: 'INV-2023-002',
    invoicedAt: new Date('2023-06-01'),
    createdAt: new Date('2023-05-20'),
    updatedAt: new Date('2023-06-01')
  },
  {
    id: '3',
    taskId: '103',
    clientId: '1',
    amount: 3200.00,
    status: 'received',
    dueDate: new Date('2023-05-15'),
    invoiceNumber: 'INV-2023-001',
    invoicedAt: new Date('2023-04-15'),
    receivedAt: new Date('2023-05-10'),
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2023-05-10')
  },
  {
    id: '4',
    taskId: '104',
    clientId: '3',
    amount: 1200.00,
    status: 'overdue',
    dueDate: new Date('2023-05-01'),
    invoiceNumber: 'INV-2023-003',
    invoicedAt: new Date('2023-04-01'),
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2023-04-01')
  },
  {
    id: '5',
    taskId: '105',
    clientId: '2',
    amount: 950.00,
    status: 'pending',
    dueDate: new Date('2023-07-30'),
    invoiceNumber: 'INV-2023-004',
    invoicedAt: new Date('2023-06-15'),
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-15')
  },
  {
    id: '6',
    taskId: '106',
    clientId: '3',
    amount: 500.00,
    status: 'canceled',
    dueDate: new Date('2023-06-15'),
    notes: 'Project canceled by client',
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date('2023-06-02')
  },
];

// Client name mapping
const clientNames: Record<string, string> = {
  '1': 'Acme Corporation',
  '2': 'Globex Industries',
  '3': 'Initech Solutions',
};

interface PaymentListProps {
  onEdit: (paymentId: string) => void;
}

const PaymentList: React.FC<PaymentListProps> = ({ onEdit }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const clientId = user?.clientId;

  useEffect(() => {
    // Load payments, filter by client if client user
    const loadPayments = async () => {
      try {
        // For admin, show all payments. For client, only show their invoiced payments
        let filteredPayments = [...mockPayments];
        
        if (clientId) {
          filteredPayments = filteredPayments.filter(payment => 
            payment.clientId === clientId && ['invoiced', 'overdue', 'pending'].includes(payment.status)
          );
        }
        
        setPayments(filteredPayments);
      } catch (error) {
        console.error("Error loading payments:", error);
        toast.error("Failed to load payment data");
      }
    };
    
    loadPayments();
  }, [clientId]);

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'due': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'invoiced': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'pending': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'overdue': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'canceled': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getRowColor = (status: PaymentStatus) => {
    switch (status) {
      case 'received': return 'border-l-4 border-l-green-500';
      case 'due': return 'border-l-4 border-l-blue-500';
      case 'invoiced': return 'border-l-4 border-l-purple-500';
      case 'pending': return 'border-l-4 border-l-amber-500';
      case 'overdue': return 'border-l-4 border-l-red-500';
      case 'canceled': return 'border-l-4 border-l-gray-500';
      default: return '';
    }
  };

  const handleStatusChange = (paymentId: string, newStatus: PaymentStatus) => {
    setPayments(payments.map(payment => 
      payment.id === paymentId ? { ...payment, status: newStatus, updatedAt: new Date() } : payment
    ));
    toast.success(`Payment status updated to ${newStatus}`);
  };

  const confirmDelete = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = () => {
    if (paymentToDelete) {
      setPayments(payments.filter(payment => payment.id !== paymentToDelete));
      toast.success('Payment deleted successfully');
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const generateInvoice = (paymentId: string) => {
    // In a real app, this would generate a PDF invoice or similar
    toast.success('Invoice generated and ready to send');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const initiatePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentDialogOpen(true);
  };

  const handlePaymentCompleted = async (payment: Payment) => {
    try {
      // Update payment status to 'received'
      const updatedPayments = payments.map(p => 
        p.id === payment.id 
          ? { ...p, status: 'received' as PaymentStatus, receivedAt: new Date(), updatedAt: new Date() } 
          : p
      );
      
      setPayments(updatedPayments);
      
      // Close payment dialog
      setPaymentDialogOpen(false);
      setSelectedPayment(null);
      
      // Show success message
      toast.success("Payment completed successfully!");
      
      // In a real app, you would update the database here
      // For now, we simulate sending an email notification
      try {
        // This would be a call to a Supabase function in production
        console.log("Sending payment confirmation email to admin");
        // Simulate email notification
        setTimeout(() => {
          console.log("Email sent: Client has made a payment for invoice", payment.invoiceNumber);
        }, 1000);
      } catch (emailError) {
        console.error("Failed to send email notification", emailError);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Payment processing failed");
    }
  };

  const handlePayNow = (payment: Payment) => {
    // In a production app, this would integrate with PayPal's API
    // For now, we'll simulate opening PayPal
    window.open(`https://www.paypal.com/checkoutnow?token=demo-${payment.id}`, '_blank');
    
    toast.success('Redirecting to PayPal for payment processing');
    
    // Simulate a successful payment after the PayPal window is opened
    setTimeout(() => {
      handlePaymentCompleted(payment);
    }, 3000);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isAdmin ? 'Client' : 'Task'}</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Invoice #</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                No payments found.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id} className={getRowColor(payment.status)}>
                <TableCell className="font-medium">
                  {isAdmin ? clientNames[payment.clientId] : `Task #${payment.taskId}`}
                </TableCell>
                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                <TableCell>{format(payment.dueDate, 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  {isAdmin ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={`rounded-full px-2.5 text-xs font-semibold ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleStatusChange(payment.id, 'due')}>
                          <Badge variant="outline" className={getStatusColor('due')}>Due</Badge>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(payment.id, 'invoiced')}>
                          <Badge variant="outline" className={getStatusColor('invoiced')}>Invoiced</Badge>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(payment.id, 'pending')}>
                          <Badge variant="outline" className={getStatusColor('pending')}>Pending</Badge>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(payment.id, 'received')}>
                          <Badge variant="outline" className={getStatusColor('received')}>Received</Badge>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(payment.id, 'overdue')}>
                          <Badge variant="outline" className={getStatusColor('overdue')}>Overdue</Badge>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(payment.id, 'canceled')}>
                          <Badge variant="outline" className={getStatusColor('canceled')}>Canceled</Badge>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Badge className={`${getStatusColor(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{payment.invoiceNumber || '-'}</TableCell>
                <TableCell className="text-right">
                  {isAdmin ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(payment.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => generateInvoice(payment.id)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => confirmDelete(payment.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    ['invoiced', 'pending', 'overdue'].includes(payment.status) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePayNow(payment)}
                        className="flex items-center gap-1"
                      >
                        <CreditCard className="h-3 w-3" />
                        Pay Now
                      </Button>
                    )
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Confirmation</DialogTitle>
            <DialogDescription>
              You are about to make a payment to Anthem InfoTech Pvt Ltd.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Invoice Number:</p>
                  <p>{selectedPayment.invoiceNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount:</p>
                  <p className="font-semibold">{formatCurrency(selectedPayment.amount)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Recipient:</p>
                <p>Anthem InfoTech Pvt Ltd</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Method:</p>
                <p>PayPal</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedPayment && handlePayNow(selectedPayment)}>
              Proceed to PayPal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentList;

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ClientList from '@/components/clients/ClientList';
import AddClientDialog from '@/components/clients/AddClientDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Client } from '@/types';

const ClientsPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<string | null>(null);
  const [addClientCallback, setAddClientCallback] = useState<((client: Client) => void) | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <Button onClick={() => setOpen(true)} className="gap-1">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Client Management</CardTitle>
          <CardDescription>
            View and manage all your clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientList 
            onEdit={(id) => {
              setClientToEdit(id);
              setOpen(true);
            }} 
            onAddClient={(callback) => setAddClientCallback(() => callback)}
          />
        </CardContent>
      </Card>

      <AddClientDialog
        open={open}
        onOpenChange={setOpen}
        clientId={clientToEdit}
        onClientSaved={() => setClientToEdit(null)}
        onAddClient={addClientCallback}
      />
    </div>
  );
};

export default ClientsPage;
import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "../../integrations/supabase/client";
import ClientForm, { ClientFormRef } from "./ClientForm";
import { Client, ClientStatus } from "@/types";

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
  onClientSaved: () => void;
  onAddClient?: (client: Client) => void;
}

const AddClientDialog: React.FC<AddClientDialogProps> = ({
  open,
  onOpenChange,
  clientId,
  onClientSaved,
  onAddClient,
}) => {
  const isEditing = !!clientId;
  const [loading, setLoading] = useState(false);
  const [defaultValues, setDefaultValues] = useState<{
    name: string;
    email: string;
    phone: string;
    address: string;
    status: ClientStatus;
    notes?: string;
  }>({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
    notes: "",
  });
  const formRef = useRef<ClientFormRef>(null);

  useEffect(() => {
    if (isEditing && clientId) {
      const fetchClient = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("id", clientId)
          .eq("is_deleted", false)
          .single();

        if (error || !data) {
          toast.error("Failed to load client");
          setLoading(false);
          return;
        }

        const values = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          status: data.status,
          notes: data.notes || "",
        };

        setDefaultValues(values);
        formRef.current?.reset(values);
        setLoading(false);
      };

      fetchClient();
    } else {
      setDefaultValues({
        name: "",
        email: "",
        phone: "",
        address: "",
        status: "active",
        notes: "",
      });
    }
  }, [clientId, isEditing]);

  const onSubmit = async (values: {
    name: string;
    email: string;
    phone: string;
    address: string;
    status: ClientStatus;
    notes?: string;
  }) => {
    setLoading(true);

    const payload = {
      ...values,
      updated_at: new Date(),
      ...(isEditing ? {} : { created_at: new Date().toISOString() }),
    };

    try {
      if (isEditing && clientId) {
        const { error } = await supabase
          .from("clients")
          .update(payload)
          .eq("id", clientId);

        if (error) throw new Error(`Failed to update client: ${error.message}`);
        toast.success("Client updated successfully");
      } else {
        const { data, error } = await supabase
          .from("clients")
          .insert([payload])
          .select()
          .single();

        if (error) throw new Error(`Failed to add client: ${error.message}`);

        if (data && onAddClient) {
          const newClient: Client = {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            status: data.status as ClientStatus,
            hasAccount: data.has_account || false,
            notes: data.notes,
            createdAt: new Date(data.created_at),
            updated_at: new Date(data.updated_at),
          };
          onAddClient(newClient);
        }

        toast.success("Client added successfully");
      }

      onOpenChange(false);
      onClientSaved();
    } catch (err: any) {
      console.error("Client save error:", err);
      toast.error(err.message || "Failed to save client");
    } finally {
      setLoading(false);
    }
  };
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 top-[-5vh] bg-black bg-opacity-80 z-50 max-h-[105vh] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[100vh] overflow-y-auto px-6 py-4">
          <div className="flex justify-between items-center relative">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? "Edit Client" : "Add New Client"}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditing
                  ? "Update the client information below."
                  : "Fill in the client information to add a new client."}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
          </div>

          <ClientForm
            ref={formRef}
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            isLoading={loading}
          />

          <div className="flex justify-end mt-6 gap-2">
            <button
              className="px-4 py-2 rounded border shadow font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded font-semibold shadow bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={() => formRef.current?.submit()}
              disabled={loading}
            >
              {loading
                ? isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                ? "Update Client"
                : "Add Client"}
            </button>
          </div>
        </div>
      </div>
    </>
    // <Dialog open={open} onOpenChange={onOpenChange}>
    //   <DialogContent className="sm:max-w-[600px] w-full max-w-lg max-h-[95vh] overflow-y-auto">
    //     <DialogHeader>
    //       <DialogTitle>
    //         {isEditing ? "Edit Client" : "Add New Client"}
    //       </DialogTitle>
    //       <DialogDescription>
    //         {isEditing
    //           ? "Update the client information below."
    //           : "Fill in the client information to add a new client."}
    //       </DialogDescription>
    //     </DialogHeader>
    //     <ClientForm
    //       ref={formRef}
    //       onSubmit={onSubmit}
    //       defaultValues={defaultValues}
    //       isLoading={loading}
    //     />
    //     <DialogFooter>
    //       <Button
    //         variant="outline"
    //         onClick={() => onOpenChange(false)}
    //         disabled={loading}
    //       >
    //         Cancel
    //       </Button>
    //       <Button
    //         onClick={() => {
    //           console.log("Submitting ClientForm");
    //           formRef.current?.submit();
    //         }}
    //         disabled={loading}
    //       >
    //         {loading
    //           ? isEditing
    //             ? "Updating..."
    //             : "Adding..."
    //           : isEditing
    //           ? "Update Client"
    //           : "Add Client"}
    //       </Button>
    //     </DialogFooter>
    //   </DialogContent>
    // </Dialog>
  );
};

export default AddClientDialog;

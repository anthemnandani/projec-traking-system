
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { toast } from '@/hooks/use-toast';
import { createTaskObject } from './AddTaskDialog.fix';

const taskFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100),
  clientId: z.string().min(1, { message: 'Please select a client' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }).max(500),
  status: z.enum(['requirements', 'quote', 'approved', 'progress', 'submitted', 'feedback', 'complete'] as const),
  estimatedHours: z.coerce.number().positive({ message: 'Hours must be positive' }),
  estimatedCost: z.coerce.number().positive({ message: 'Cost must be positive' }),
  project: z.string().optional(),
  dueDate: z.date().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  taskToEdit: Task | null;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  isOpen,
  onClose,
  onAddTask,
  onUpdateTask,
  taskToEdit,
}) => {
  // Mock clients data
  const mockClients = [
    { id: 'client-1', name: 'Acme Corporation' },
    { id: 'client-2', name: 'Globex Industries' },
    { id: 'client-3', name: 'Initech Solutions' },
    { id: 'client-4', name: 'Stark Enterprises' },
  ];

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: taskToEdit?.title || '',
      clientId: taskToEdit?.clientId || '',
      description: taskToEdit?.description || '',
      status: taskToEdit?.status || 'requirements',
      estimatedHours: taskToEdit?.estimatedHours || 0,
      estimatedCost: taskToEdit?.estimatedCost || 0,
      project: taskToEdit?.project || '',
      dueDate: taskToEdit?.dueDate || undefined,
    },
  });

  React.useEffect(() => {
    if (taskToEdit) {
      form.reset({
        title: taskToEdit.title,
        clientId: taskToEdit.clientId,
        description: taskToEdit.description,
        status: taskToEdit.status,
        estimatedHours: taskToEdit.estimatedHours,
        estimatedCost: taskToEdit.estimatedCost,
        project: taskToEdit.project || '',
        dueDate: taskToEdit.dueDate,
      });
    } else {
      form.reset({
        title: '',
        clientId: '',
        description: '',
        status: 'requirements',
        estimatedHours: 0,
        estimatedCost: 0,
        project: '',
        dueDate: undefined,
      });
    }
  }, [taskToEdit, form, isOpen]);

  const onSubmit = async (data: TaskFormValues) => {
    if (taskToEdit) {
      // Update existing task
      const updatedTask = {
        ...taskToEdit,
        ...data,
        updatedAt: new Date()
      };
      
      onUpdateTask(updatedTask);
      
      // Show success message
      toast({
        title: "Task updated",
        description: "The task has been successfully updated."
      });
      
      // Notify client if task status changed to complete
      if (taskToEdit.status !== 'complete' && data.status === 'complete') {
        try {
          // In a real application, this would connect to an API endpoint
          console.log("Task completed - notifying client:", taskToEdit.clientId);
          // Simulating an API call to notify the client
        } catch (error) {
          console.error("Failed to send completion notification:", error);
        }
      }
    } else {
      // Add new task
      const newTask = createTaskObject({
        id: `task-${Date.now()}`,
        title: data.title,
        clientId: data.clientId,
        description: data.description,
        status: data.status,
        estimatedHours: data.estimatedHours,
        estimatedCost: data.estimatedCost,
        project: data.project,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: data.dueDate,
      });
      
      onAddTask(newTask);
      
      // Show success message
      toast({
        title: "Task created",
        description: "The new task has been successfully created."
      });
      
      // Notify client about new task
      try {
        // In a real application, this would connect to an API endpoint
        console.log("New task created - notifying client:", data.clientId);
        // Simulating an API call to notify the client
      } catch (error) {
        console.error("Failed to send creation notification:", error);
      }
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{taskToEdit ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {taskToEdit
              ? 'Update the task details below.'
              : 'Fill in the details to create a new task.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the task in detail"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="requirements">Requirements</SelectItem>
                        <SelectItem value="quote">Quote Sent</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="progress">In Progress</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && 'text-muted-foreground'
                            }`}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {taskToEdit ? 'Update Task' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import TaskList from '@/components/tasks/TaskList';
import AddTaskDialog from '@/components/tasks/AddTaskDialog';
import { Task, TaskStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Mock data for development/fallback
const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Website Redesign",
    clientId: "client-1",
    description: "Complete redesign of the client's e-commerce website with new branding",
    status: "requirements",
    estimatedHours: 40,
    estimatedCost: 4000,
    project: "E-commerce Refresh",
    createdAt: new Date(2025, 4, 1),
    updatedAt: new Date(2025, 4, 1),
    dueDate: new Date(2025, 4, 15)
  },
  {
    id: "task-2",
    title: "Mobile App Development",
    clientId: "client-2",
    description: "Create a native mobile app for iOS and Android platforms",
    status: "quote",
    estimatedHours: 120,
    estimatedCost: 12000,
    project: "Mobile Initiative",
    createdAt: new Date(2025, 4, 2),
    updatedAt: new Date(2025, 4, 2),
    dueDate: new Date(2025, 5, 15)
  },
  // ... other mock tasks
];

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Fetch tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('tasks')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        // Transform the data to match our Task interface
        const formattedTasks: Task[] = data.map((task: any) => ({
          id: task.id,
          title: task.title,
          clientId: task.client_id,
          description: task.description,
          status: task.status,
          estimatedHours: task.estimated_hours,
          estimatedCost: task.estimated_cost,
          actualHours: task.actual_hours,
          actualCost: task.actual_cost,
          project: task.project,
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at),
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
        }));
        
        setTasks(formattedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        });
        
        // Use mock data as fallback for development
        setTasks(mockTasks);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  const handleAddTask = async (newTask: Task) => {
    try {
      // For development, use both Supabase and local state
      // In production, you'd only use Supabase
      
      // Transform task to match Supabase schema
      const supabaseTask = {
        id: newTask.id,
        title: newTask.title,
        client_id: newTask.clientId,
        description: newTask.description,
        status: newTask.status,
        estimated_hours: newTask.estimatedHours,
        estimated_cost: newTask.estimatedCost,
        project: newTask.project,
        due_date: newTask.dueDate?.toISOString(),
      };
      
      // Insert task into Supabase
      const { error } = await supabase
        .from('tasks')
        .insert([supabaseTask]);
      
      if (error) throw error;
      
      // Add to local state
      setTasks([...tasks, newTask]);
      
      // Send notification to client
      await fetch('http://localhost:5000/api/task-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ taskId: newTask.id, eventType: 'created' })
      });
      
      toast({
        title: "Task created",
        description: "The task has been created successfully.",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      
      // Fallback for development - just update the state
      setTasks([...tasks, newTask]);
      
      toast({
        title: "Warning",
        description: "Task added locally but failed to sync with the server.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      // Transform task to match Supabase schema
      const supabaseTask = {
        title: updatedTask.title,
        client_id: updatedTask.clientId,
        description: updatedTask.description,
        status: updatedTask.status,
        estimated_hours: updatedTask.estimatedHours,
        estimated_cost: updatedTask.estimatedCost,
        project: updatedTask.project,
        due_date: updatedTask.dueDate?.toISOString(),
        completed_at: updatedTask.completedAt?.toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Update task in Supabase
      const { error } = await supabase
        .from('tasks')
        .update(supabaseTask)
        .eq('id', updatedTask.id);
      
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      setTaskToEdit(null);
      
      // If task was marked as complete, send notification
      if (updatedTask.status === 'complete' && updatedTask.completedAt) {
        await supabase.functions.invoke('send-task-notification', {
          body: {
            taskId: updatedTask.id,
            eventType: 'completed'
          }
        });
      }
      
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      
      // Fallback for development - just update the state
      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      setTaskToEdit(null);
      
      toast({
        title: "Warning",
        description: "Task updated locally but failed to sync with the server.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      // Delete task from Supabase
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.filter(task => task.id !== taskId));
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      
      // Fallback for development - just update the state
      setTasks(tasks.filter(task => task.id !== taskId));
      
      toast({
        title: "Warning",
        description: "Task deleted locally but failed to sync with the server.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsAddDialogOpen(true);
  };
  
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      
      if (!taskToUpdate) return;
      
      const updatedTask = {
        ...taskToUpdate,
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === 'complete' ? { completedAt: new Date() } : {})
      };
      
      await handleUpdateTask(updatedTask);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          {/* Only show Add Task button for admins */}
          {user?.role === 'admin' && (
            <Button onClick={() => {setTaskToEdit(null); setIsAddDialogOpen(true);}}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>
            {user?.role === 'admin' 
              ? "Manage all project tasks and track their progress."
              : "View your project tasks and their current status."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-anthem-purple"></div>
            </div>
          ) : (
            <TaskList 
              tasks={tasks}
              onEdit={user?.role === 'admin' ? handleEditTask : undefined}
              onDelete={user?.role === 'admin' ? handleDeleteTask : undefined}
              onStatusChange={user?.role === 'admin' ? handleStatusChange : undefined}
            />
          )}
        </CardContent>
      </Card>
      
      {user?.role === 'admin' && (
        <AddTaskDialog 
          isOpen={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          taskToEdit={taskToEdit}
        />
      )}
    </div>
  );
};

export default TasksPage;

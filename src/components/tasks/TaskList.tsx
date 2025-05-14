
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Edit, 
  Trash2, 
  MoreVertical, 
  ClipboardList,
  FileText,
  CheckCircle,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Task, TaskStatus } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onEdit, 
  onDelete,
  onStatusChange
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'requirements':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'quote':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'progress':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'submitted':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'feedback':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'complete':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    const colorClass = getStatusColor(status);
    return (
      <Badge className={`${colorClass} border`}>
        {status === 'requirements' ? 'Requirements' :
         status === 'quote' ? 'Quote Sent' :
         status === 'approved' ? 'Approved' :
         status === 'progress' ? 'In Progress' :
         status === 'submitted' ? 'Submitted' :
         status === 'feedback' ? 'Feedback' :
         status === 'complete' ? 'Complete' : status}
      </Badge>
    );
  };
  
  const getStatusOptions = (currentStatus: TaskStatus) => {
    // Define possible status transitions
    const allStatuses: {status: TaskStatus, label: string, icon: React.ReactNode}[] = [
      { status: 'requirements', label: 'Requirements', icon: <ClipboardList className="mr-2 h-4 w-4" /> },
      { status: 'quote', label: 'Quote Sent', icon: <FileText className="mr-2 h-4 w-4" /> },
      { status: 'approved', label: 'Approved', icon: <CheckCircle className="mr-2 h-4 w-4" /> },
      { status: 'progress', label: 'In Progress', icon: <Clock className="mr-2 h-4 w-4" /> },
      { status: 'submitted', label: 'Submitted', icon: <Send className="mr-2 h-4 w-4" /> },
      { status: 'feedback', label: 'Feedback', icon: <MessageSquare className="mr-2 h-4 w-4" /> },
      { status: 'complete', label: 'Complete', icon: <CheckCircle2 className="mr-2 h-4 w-4" /> }
    ];
    
    // Filter out current status
    return allStatuses.filter(s => s.status !== currentStatus);
  };

  const confirmDelete = (taskId: string, taskTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the task "${taskTitle}"?`)) {
      onDelete?.(taskId);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Est. Hours</TableHead>
            <TableHead>Est. Cost</TableHead>
            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-4 text-muted-foreground">
                No tasks found. {isAdmin && "Create your first task to get started."}
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id} className={task.status === 'complete' ? 'bg-gray-50' : ''}>
                <TableCell className="font-medium">
                  <div>
                    {task.title}
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {task.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{task.project || '-'}</TableCell>
                <TableCell>{task.clientId}</TableCell>
                <TableCell>
                  {getStatusBadge(task.status)}
                </TableCell>
                <TableCell>
                  {task.dueDate && format(task.dueDate, 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>{task.estimatedHours}</TableCell>
                <TableCell>${task.estimatedCost.toLocaleString()}</TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(task)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        
                        {onDelete && (
                          <DropdownMenuItem onClick={() => confirmDelete(task.id, task.title)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                        
                        {onStatusChange && (
                          <>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            
                            {getStatusOptions(task.status).map((option) => (
                              <DropdownMenuItem 
                                key={option.status}
                                onClick={() => onStatusChange(task.id, option.status)}
                              >
                                {option.icon}
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskList;

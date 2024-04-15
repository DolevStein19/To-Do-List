import { Box, Button, Checkbox, Table, TableCell, TableRow, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useContext, useEffect, useState } from 'react'
import { usersData } from '../App';

export type Task = {
  taskId: number;
  taskName: string;
  priority: string;
  completed: boolean;
};

export default function TableTasks(props: { tasks: Task[] }) {
  const { loggedUser, setLoggedUser } = useContext(usersData);
  const [localTasks, setLocalTasks] = useState(props.tasks);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTaskName, setEditedTaskName] = useState("");

  useEffect(() => {
    setLocalTasks(props.tasks);
  }, [props.tasks]);

  if (!loggedUser) return null;

  const startEditing = (taskId: number, taskName: string) => {
    setEditingTaskId(taskId);
    setEditedTaskName(taskName);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditedTaskName("");
  };

  const EditTask = async (taskId: number) => {
    if (!editedTaskName.trim()) {
      cancelEditing();
      return;
    }

    try {
      const response = await fetch(`/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: loggedUser.email,
          taskId: taskId,
          taskName: editedTaskName
        })
      });

      if (response.ok) {
        const updatedUser = { ...loggedUser };
        updatedUser.tasks = updatedUser.tasks.map(task =>
          task.taskId === taskId ? { ...task, taskName: editedTaskName } : task
        );
        setLoggedUser(updatedUser);
        setLocalTasks(updatedUser.tasks);
        cancelEditing();
      } else {
        console.error('Failed to update task:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };


  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: loggedUser.email,
          taskId: taskId,
        }),
      });
      console.log('response:', response, 'taskId:', taskId, 'loggedUser:', loggedUser);

      if (response.ok) {
        // Remove the deleted task from the loggedUser state
        const updatedUser = { ...loggedUser };
        updatedUser.tasks = updatedUser.tasks.filter((task) => task.taskId !== taskId);
        setLoggedUser(updatedUser); // Update the state
        console.log('Task deleted successfully', taskId, updatedUser);

      } else {
        console.error('Failed to delete task:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCheckboxChange = async (taskId: number) => {
    try {
      const updatedTasks = localTasks.map(task =>
        task.taskId === taskId ? { ...task, completed: !task.completed } : task
      );
      setLocalTasks(updatedTasks);

      const response = await fetch(`/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: loggedUser.email,
          taskId: taskId,
          completed: !localTasks.find(task => task.taskId === taskId)?.completed
        }),
      });

      if (response.ok) {
        const updatedUser = { ...loggedUser, tasks: updatedTasks };
        setLoggedUser(updatedUser);
      } else {
        console.error('Failed to update task status:', response.statusText);
        // Revert local state if server update fails
        setLocalTasks(props.tasks);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert local state if there's an error
      setLocalTasks(props.tasks);
    }
  };

  const noTasks = props.tasks.length === 0 ? <TableRow><TableCell>No tasks Found</TableCell></TableRow> : null;

  const getTaskStyle = (completed: boolean) => {
    return completed ? {
      textDecoration: 'line-through',
      color: 'grey',
    } : {};
  };

  return (
    <Box>
      <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
        <TableRow>
          <TableCell>Status</TableCell>
          <TableCell>Task Name</TableCell>
          <TableCell>Priority</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
        {noTasks}
        {props.tasks?.map((task) => (
          <TableRow key={task.taskId}>
            <TableCell>
              <Checkbox
                onChange={() => handleCheckboxChange(task.taskId)}
                checked={task.completed || false}
                color='success'
              />
            </TableCell>
            <TableCell style={getTaskStyle(task.completed)}>
              {editingTaskId === task.taskId ? (
                <input
                  value={editedTaskName}
                  onChange={(e) => setEditedTaskName(e.target.value)}
                  onBlur={() => EditTask(task.taskId)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') EditTask(task.taskId);
                    if (e.key === 'Escape') cancelEditing();
                  }}
                  autoFocus
                />
              ) : (
                task.taskName
              )}
            </TableCell>
            <TableCell>{task.priority}</TableCell>
            <TableCell>
              {editingTaskId === task.taskId ? (
                <>
                  <Tooltip title="Save" placement="top">
                    <Button sx={{ minWidth: '0' }} onClick={() => EditTask(task.taskId)}>Save</Button>
                  </Tooltip>
                  <Tooltip title="Cancel" placement="top">
                    <Button sx={{ minWidth: '0' }} onClick={cancelEditing}>Cancel</Button>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title="Edit Task" placement="top">
                    <Button sx={{ minWidth: '0' }} onClick={() => startEditing(task.taskId, task.taskName)}>
                      <EditIcon sx={{ fontSize: 'large' }}>Edit</EditIcon>
                    </Button>
                  </Tooltip>
                  <Tooltip title="Delete Task" placement="top">
                    <Button sx={{ minWidth: '0' }} onClick={() => deleteTask(task.taskId)}>
                      <DeleteIcon sx={{ fontSize: 'large' }}>Delete</DeleteIcon>
                    </Button>
                  </Tooltip>
                </>
              )}
            </TableCell>
          </TableRow>
        ))}

      </Table>

    </Box>
  )
}

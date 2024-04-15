import React, { useContext, useEffect } from 'react';
import { usersData } from '../App.js';
import { useNavigate } from 'react-router-dom';
import './home.css'
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import TableTasks from '../Components/tableTasks.tsx';
import CopyRight from '../Components/copyRight.tsx';
import * as Yup from 'yup';

export default function Home() {
  const { loggedUser, setLoggedUser } = useContext(usersData);
  const navigate = useNavigate();

  // If loggedUser is null or undefined, redirect to the sign-in page
  useEffect(() => {
    if (!loggedUser) {
      navigate('/');
    }
  }, [loggedUser, navigate]);

  enum Priority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
  }
  const validationSchema = Yup.object({
    taskName: Yup.string().required('Task name is required'), // Step 2: Define schema
  });

  // בעיה שמעבירים את המטלה  להושלם צריך לרענן

  const formik = useFormik({
    initialValues: {
      taskName: '',
      completed: false,
      priority: 'Low'
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        // Send HTTP POST request to create a new task
        const response = await fetch('/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: loggedUser.email,
            taskName: values.taskName,
            completed: values.completed,
            priority: values.priority
          }),
        });
        if (response.ok) {
          const data = await response.json();

          // Update loggedUser with the new task
          setLoggedUser((prevUser: any) => ({
            ...prevUser,
            tasks: [...prevUser.tasks, data.task],
          }));

          // Clear form fields using Formik's resetForm
          resetForm();
        } else {
          // Handle error response
          console.error('Failed to create task:', response.statusText);
        }
      } catch (error) {
        console.error('Error creating task:', error);
      }
    },
  });

  return (
    <Box className='container'>
      <Box>
        <Typography variant='h3' sx={{ mb: '1rem' }}>To-Do List!</Typography>
      </Box>
      {loggedUser ? (
        <Box>
          <Typography variant='h5' sx={{ mb: '1rem' }}>Hello {loggedUser.firstName}!</Typography>
        </Box>
      ) : (
        <Typography variant='h6'>Loading...</Typography>
      )}
      <form noValidate onSubmit={formik.handleSubmit} autoComplete='off'>
        <Box sx={{ mb: '15px', width: '100%' }}>
          <TextField
            sx={{ padding: '0px' }}
            id="taskName"
            name="taskName"
            placeholder='What do you need to do?'
            onChange={formik.handleChange}
            value={formik.values.taskName}
            label="Task Name"
            error={formik.touched.taskName && Boolean(formik.errors.taskName)}
            helperText={formik.touched.taskName && formik.errors.taskName}
          />
          <FormControl>
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              id="priority"
              name='priority'
              value={formik.values.priority}
              onChange={formik.handleChange}
              label="Priority"
              className='addTaskSelect'
            >
              <MenuItem value={Priority.Low}>Low</MenuItem>
              <MenuItem value={Priority.Medium}>Medium</MenuItem>
              <MenuItem value={Priority.High}>High</MenuItem>
            </Select>
          </FormControl>
          <br />

          <Button type="submit" sx={{ mb: '5px' }} className='addTaskButton'>Add Task</Button>

        </Box>
      </form>

      <Box sx={{ justifyContent: 'center', alignContent: 'center', display: 'flex', width: '100%' }}>
        <TableTasks tasks={loggedUser.tasks} />
      </Box>
      <hr />

      <CopyRight />
    </Box>
  );
};

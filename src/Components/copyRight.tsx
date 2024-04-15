import { Box, Link, Typography } from '@mui/material'
import React from 'react'

export default function CopyRight(props: any) {
  return (
    <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
        {'Copyright © '}
        <Link color="inherit" href="/">
            To Do List
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
        </Typography>
    </Box>
  )
}

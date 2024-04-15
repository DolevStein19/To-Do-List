import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SignIn from './pages/SignIn.tsx';
import SignUp from './pages/SignUp.tsx';
import Home from './pages/Home.tsx'
import { createContext, useState,useEffect } from 'react';
import { Box } from '@mui/material';

export const usersData = createContext();

function App() {

  const [backEndData,setBackEndData] = useState([{}]);
  const [loggedUser,setLoggedUser] = useState('');

  useEffect(() => {
    fetch('/users')
      .then(response => response.json())
      .then(data => {setBackEndData(data)})
      .catch(error => console.error(error));
  }, []);


const users = backEndData.users

  return (
    <Box className="App">
      <BrowserRouter>
        <usersData.Provider value={{users,loggedUser,setLoggedUser}}>
          <Routes>
            <Route path='/' element={<SignIn/>}></Route>
            <Route path='/signUp' element={<SignUp/>}></Route>
            <Route path='/home' element={<Home/>}></Route>
          </Routes>
        </usersData.Provider>
      </BrowserRouter>
    </Box>
  );
}

export default App;



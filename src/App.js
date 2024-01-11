import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Home } from "./components/home";
import { Login, Register } from "./components/auth";
import { Admin } from "./components/admin";
import React, { useEffect, useState } from "react";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const loggedIn = window.localStorage.getItem("isLoggedIn");

  useEffect(() => {
    const storedUserId = window.localStorage.getItem('adminUserId');
    if (storedUserId) {
      setCurrentUser({ uid: storedUserId });
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    }, (error) => {
      console.error("Authentication state change error:", error);
    });

    return () => unsubscribe();
  }, []);

  const PrivateRoute = ({ element, ...props }) => {
    const userId = currentUser;
    
    if (!loggedIn) {
      return <Navigate to="/login" />;
    }

    return React.cloneElement(element, { userId, ...props });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" exact element={loggedIn ? <Admin/>: <Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/:userID" element={<PrivateRoute element={<Admin />}/>} />
      </Routes>
    </Router>
  );
}

export default App;
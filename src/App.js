import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Home } from "./components/home";
import { Login, Register } from "./components/auth";
import { Admin } from "./components/admin";
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

    const isLoggedIn = !!storedUserId;
    window.localStorage.setItem('isLoggedIn', isLoggedIn);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (!user && loggedIn) {
        window.localStorage.removeItem('adminUserId');
        window.localStorage.removeItem('isLoggedIn');
        Navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [loggedIn]);

  const PrivateRoute = ({ element }) => {
    const navigate = useNavigate();
    const userId = currentUser?.uid;

    useEffect(() => {
      if (!loggedIn) {
        navigate('/login');
      }
    }, [loggedIn, navigate]);

    return loggedIn ? <React.Fragment>{React.cloneElement(element, { userId })}</React.Fragment> : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      <Router basename="/">
        <Routes>
          <Route index element={ <Home />} />
          <Route path="/register" element={ <Register />} />
          <Route path="/login" element={ <Login />} />
          <Route path="/admin/:userId/" element={<PrivateRoute element={<Admin />} />} />
          <Route path="*" element={<h2>404 - Not Found</h2>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { useState } from "react";
import { collection, getDoc, addDoc, doc} from 'firebase/firestore';
import { db } from "../config/firebase";
import Modal from 'react-bootstrap/Modal';
import { Link } from "react-router-dom";

export const HomeNavbar = () => {
  return(
    <Container fluid>
      <Navbar bg="light" expand="lg">
      <Navbar.Brand><Link to="/">ANHS Patient Portal</Link></Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link><Link to="/login"> Login</Link></Nav.Link>
          <Nav.Link><Link to="/register"> Register</Link></Nav.Link>
        </Nav>
      </Navbar.Collapse>
      </Navbar>
    </Container>
  );
}

export const CustomModal = ({ show, onClose, title, message }) => (
  <Modal show={show} onHide={onClose} centered>
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{message}</Modal.Body>
    <Modal.Footer>
      <button type="button" className="btn btn-primary" onClick={onClose}>
        Close
      </button>
    </Modal.Footer>
  </Modal>
);

export const Home = () => {
  const [studentID, setStudentID] = useState("");
  const [concern, setConcern] = useState("");
  const [concernStatus] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [studentExists, setStudentExists] = useState(true);

  const submitForm = async () => {
    try {
      if (!studentID || !concern) {
        alert('Please fill in all required fields');
        return;
      }

      const studentDocRef = doc(collection(db, "students"), studentID);
      const docSnapshot = await getDoc(studentDocRef);

      if (!docSnapshot.exists()) {
        setStudentExists(false);
        return;
      }

      const currentDate = new Date();
      const phTimeZone = 'Asia/Manila';
      const dateOptions = { timeZone: phTimeZone };
      const formattedDate = new Intl.DateTimeFormat('en-US', {
          ...dateOptions,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
      }).format(currentDate);
      const formattedTime = currentDate.toLocaleTimeString();

      await addDoc(collection(db, "concerns"), {
        concern_Date: formattedDate,
        concern_Time: formattedTime,
        concern_StudentID: studentID,
        concern_Text: concern,
        concern_Status: concernStatus,
      });

      setStudentID("");
      setConcern("");
      setConfirmationModal(true);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };
  
  const handleCloseModal = () => {
    setConfirmationModal(false);
  };

  return (
    <div>
      <HomeNavbar/>
      <div className="container">
        <div className="row">
          <div className="col">
            <img src="anhs-logo.png" className="img-fluid" alt="Cinque Terre"/>
          </div>
          <div className="col">
            <div className="card mt-3 mb-3">
              <div className="card-header">
                <h3 className="text-center mt-2">Health Concern Form</h3>
              </div>
              <div className="card-body">
                <input className="form-control mb-3" placeholder="Student ID Number" onChange={(e) => setStudentID(e.target.value)}/>
                <textarea className="form-control mb-3" rows="10" onChange={(e) => setConcern(e.target.value)}/>
                <div className="d-flex justify-content-center align-items-center ">
                  <button type="button" className="btn btn-primary" onClick={submitForm}>Submit</button>
                </div>
              </div>
            </div>
          </div>
          <CustomModal
            show={confirmationModal}
            onClose={handleCloseModal}
            title="Success"
            message={`Your concern has been sent successfully!`}
          />
        </div>
      </div>
      <CustomModal
        show={!studentExists}
        onClose={() => setStudentExists(true)}
        title="Student Not Found"
        message={`Student with ID ${studentID} doesn't exist. Please register.`}
      />
    </div>
  );
}
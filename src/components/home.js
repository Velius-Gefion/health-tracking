import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { useState } from "react";
import { collection, getDoc, addDoc, doc} from 'firebase/firestore';
import { db } from "../config/firebase";
import Modal from 'react-bootstrap/Modal';

export const HomeNavbar = () => {
    return(
        <Container fluid>
            <Navbar bg="light" expand="lg">
            <Navbar.Brand href="/">ANHS Patient Portal</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                <Nav.Link href="/login">Login</Nav.Link>
                <Nav.Link href="/register">Register</Nav.Link>
                </Nav>
            </Navbar.Collapse>
            </Navbar>
        </Container>
    );
}

const ErrorModal = ({ show, onClose, title, message }) => (
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
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [studentExists, setStudentExists] = useState(true); // Track student existence
  
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
        });
  
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
                        <img src="anhs-logo.png" class="img-fluid" alt="Cinque Terre"/>
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
                    <Modal show={confirmationModal} onHide={handleCloseModal} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Success</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Your concern has been sent successfully!
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-primary" onClick={handleCloseModal}>
                            Close
                            </button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
            <ErrorModal
                show={!studentExists}
                onClose={() => setStudentExists(true)}
                title="Student Not Found"
                message={`Student with ID ${studentID} doesn't exist. Please register.`}
            />
        </div>
    );
}
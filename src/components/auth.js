import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { collection, getDoc, setDoc, doc} from 'firebase/firestore'
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { HomeNavbar } from "./home";
import { Nav, Modal, Button } from "react-bootstrap";

const ConfirmationModal = ({ show, onClose, title, message }) => (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try
        {
            const userCredentials = await signInWithEmailAndPassword(auth, email, password);
            const userId = userCredentials.user.uid;
            
            window.localStorage.setItem('adminUserId', userId);
            window.localStorage.setItem('isLoggedIn', true);

            navigate('/admin/'+userId);
        }
        catch (errr)
        {
          console.error('Error during login', errr.message);
        }
    };

    return (
        <div>
            <HomeNavbar/>
            <div className="container">
                <div className="card mt-3 mb-3">
                    <div className="card-header">
                        <h3 className="text-center mt-2">Admin Login</h3>
                    </div>
                    <div className="card-body">
                        <div className="form-group mb-3">
                            <label><strong>Email:</strong></label>
                            <input type="email" className="form-control" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div className="form-group mb-3">
                            <label><strong>Password:</strong></label>
                            <input type="password" className="form-control" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <div className="d-flex justify-content-center align-items-center ">
                            <button type="button" className="btn btn-primary" onClick={handleLogin}>Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const Register = () => {
    const [userType, setUserType] = useState("");

    const [studentID, setStudentID] = useState("");
    const [studentFirstName, setStudentFirstName] = useState("");
    const [studentMiddleName, setStudentMiddleName] = useState("");
    const [studentLastName, setStudentLastName] = useState("");
    const [studentYearLevel, setStudentYearLevel] = useState("");
    const [studentStrand, setStudentStrand] = useState("");
    const [studentMobileNumber, setStudentMobileNumber] = useState("");
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const navigate = useNavigate();

    const handleRegisterStudent = async () => {
        try {
            if (!studentID || !studentFirstName || !studentLastName
                || !studentYearLevel || !studentStrand || !studentMobileNumber) {
              alert('Please fill in all required fields');
              return;
            }

            const studentDocRef = doc(collection(db, "students"), studentID);
            const docSnapshot = await getDoc(studentDocRef);

            if (docSnapshot.exists()) {
                alert(`Student with ID ${studentID} already exists. Please choose a different ID.`);
                return;
            }

            await setDoc(studentDocRef, {
              student_FirstName: studentFirstName,
              student_MiddleName: studentMiddleName || "",
              student_LastName: studentLastName,
              student_YearLevel: studentYearLevel,
              student_Strand: studentStrand,
              student_MobileNumber: studentMobileNumber
            });
      
            setShowConfirmationModal(true);
        } catch (error) {
        console.error(error);
        }
    };

    const handleRegisterAdmin = async () => {
        try {
            if (!email || !password) {
              alert('Please fill in all required fields');
              return;
            }
      
            await createUserWithEmailAndPassword(auth, email, password);
      
            setShowConfirmationModal(true);
        } catch (error) {
        console.error(error);
        }
    };
    
    const handleUserTypeChange = (event) => {
        setUserType(event.target.value);
    };

    const handleModalClose = () => {
        setShowConfirmationModal(false);
        navigate("/");
    };

    return (
        <div>
            <HomeNavbar/>
            <div className="container">
                <div className="card mt-3">
                    <div className="card-header">
                        <h3 className="text-center mt-2">Register</h3>
                    </div>
                    <div className="card-body">
                        <select className="form-control mb-3" value={userType} onChange={handleUserTypeChange}>
                            <option className="text-center" disabled selected value="">Register as...</option>
                            <option value="Student">Student</option>
                            <option value="Staff">Staff</option>
                        </select>
                        {userType === "Student" && (
                            <>
                                <input type="text" className="form-control mb-3" 
                                placeholder="Student ID" onChange={(e) => setStudentID(e.target.value)}/>
                                <div className="row">
                                    <div className="col">
                                        <input type="text" className="form-control mb-3" 
                                        placeholder="First Name" onChange={(e) => setStudentFirstName(e.target.value)}/>
                                    </div>
                                    <div className="col">
                                        <input type="text" className="form-control mb-3" 
                                        placeholder="Middle Name" onChange={(e) => setStudentMiddleName(e.target.value)}/>
                                    </div>
                                    <div className="col">
                                        <input type="text" className="form-control mb-3" 
                                        placeholder="Last Name" onChange={(e) => setStudentLastName(e.target.value)}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <select className="form-control mb-3" onChange={(e) => setStudentYearLevel(e.target.value)}>
                                            <option className="text-center" disabled selected value="">Year Level</option>
                                            <option value="11">11</option>
                                            <option value="12">12</option>
                                        </select>
                                    </div>
                                    <div className="col">
                                        <select className="form-control mb-3" onChange={(e) => setStudentStrand(e.target.value)}>
                                            <option className="text-center" disabled selected value="">Strand</option>
                                            <option value="STEM">STEM</option>
                                            <option value="ABM">ABM</option>
                                            <option value="HUMMS">HUMMS</option>
                                        </select>
                                    </div>
                                </div>
                                <input type="text" className="form-control mb-3" 
                                placeholder="Mobile Number" onChange={(e) => setStudentMobileNumber(e.target.value)}/>
                                <div className="d-flex justify-content-center align-items-center ">
                                    <button type="button" className="btn btn-primary" onClick={handleRegisterStudent}>Submit</button>
                                </div>
                            </>
                        )}
                        {userType === "Staff" && (
                            <>
                                <input type="email" className="form-control mb-3" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
                                <input type="password" className="form-control mb-3" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                                <div className="d-flex justify-content-center align-items-center ">
                                    <button type="button" className="btn btn-primary" onClick={handleRegisterAdmin}>Submit</button>
                                </div>
                            </>
                        )}
                    </div>
                    <ConfirmationModal
                        show={showConfirmationModal}
                        onClose={handleModalClose}
                        title="Registration Successful"
                        message="Your registration was successful!"
                    />
                </div>
            </div>
        </div>
    );
}

export const Logout = () => {
    const navigate = useNavigate();
    
    const logout = async () =>
    {
        try
        {
            window.localStorage.removeItem('adminUserId');
            window.localStorage.removeItem('isLoggedIn');
            
            await signOut(auth);
            navigate('/');
        }
        catch (errr)
        {
            console.error(errr);
        }
    };

    return (
        <div>
            <Nav.Link onClick={logout}>Logout</Nav.Link>
        </div>
    );
};
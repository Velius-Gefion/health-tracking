import { Logout } from "./auth";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Modal from "react-bootstrap/Modal";
import Nav from "react-bootstrap/Nav";
import React, { useEffect, useState} from 'react';
import { db } from '../config/firebase';
import { getDocs, getDoc, collection, updateDoc, deleteDoc, doc, where, query} from 'firebase/firestore'
import { auth } from "../config/firebase";
import { onAuthStateChanged, deleteUser } from 'firebase/auth';

const scrollToTop = () => {
    window.scrollTo({
          top: 0,
          behavior: 'smooth',
    });
};

const fetchHistoryData = async (students, setHistoryData) => {
    try {
        if (!students.id) {
            console.error('Student ID is undefined');
            return;
        }
  
        const historyQuery = query(
            collection(db, 'concerns'),
            where('concern_StudentID', '==', students.id)
        );
    
        const historySnapshot = await getDocs(historyQuery);
        const historyDataArray = historySnapshot.docs.map((doc) => doc.data());
  
        setHistoryData(historyDataArray);
    } catch (error) {
         console.error('Error fetching history data: ', error);
    }
};
  
const StudentHistoryModal = ({ students, historyModal, handleCloseModal }) => {
    const [historyData, setHistoryData] = useState([]);
  
    useEffect(() => {
        if (historyModal) {
            fetchHistoryData(students, setHistoryData);
        }
    }, [students.id, historyModal]);

    return (
        <Modal show={historyModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
            <Modal.Title>{students.id}'s History</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {historyData.length > 0 ? (
                    historyData.filter((concerns) => concerns.concern_StudentID === students.id)
                    .map((concerns, index) => (
                        <div key={index}>
                            <div className="card mb-3">
                                <div className="card-header">
                                    <div className="mt-2">
                                        <h6><strong>Date:</strong> {concerns.concern_Date}</h6>
                                        <h6><strong>Time:</strong> {concerns.concern_Time}</h6>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <p>{concerns.concern_Text}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No history data available.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
            <button type="button" className="btn btn-primary" onClick={handleCloseModal}>
                Close
            </button>
            </Modal.Footer>
        </Modal>
    );
};

export const Admin = () => {
    const [userType, setUserType] = useState("");
    const [loggedInStaffId, setLoggedInStaffId] = useState(null);

    const [studentList, setStudentList] = useState([])
    const [staffList, setStaffList] = useState([])
    const [concernList, setConcernList] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [openedHistoryModal, setOpenedHistoryModal] = useState(null);
    const today = new Date();
    const phTimeZone = 'Asia/Manila';
    const dateOptions = { timeZone: phTimeZone };
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        ...dateOptions,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(today);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentData, staffData, concernData] = await Promise.all([
                    getDocs(collection(db, "students")),
                    getDocs(collection(db, "staffs")),
                    getDocs(collection(db, "concerns")),
                ]);
    
                const filteredStudentData = studentData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                const filteredStaffsData = staffData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                const filteredConcernData = concernData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    
                setStudentList(filteredStudentData);
                setStaffList(filteredStaffsData);
                setConcernList(filteredConcernData);
            } catch (error) {
                console.error(error);
            }
        };
    
        fetchData();
    
        const handleScroll = () => {
            const scrolled = window.scrollY > 100;
            setShowScrollToTop(scrolled);
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoggedInStaffId(user.uid);
            } else {
                setLoggedInStaffId(null);
            }
        });
    
        window.addEventListener('scroll', handleScroll);
    
        return () => {
            window.removeEventListener('scroll', handleScroll);
            unsubscribe();
        };
    }, []);

    const handleUserTypeChange = (event) => {
        setUserType(event.target.value);
    };

    const handleCloseModal = () => {
        setOpenedHistoryModal(null)
    };

    const handleConcernStatus = async (concern) => {
        try {
            const concernRef = doc(collection(db, "concerns"), concern.id);
            const updatedConcernStatus = !concern.concern_Status;
    
            await updateDoc(concernRef, {
                concern_Status: updatedConcernStatus,
            });

            const concernData = await getDocs(collection(db, "concerns"));    
            const filteredConcernData = concernData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));    
            setConcernList(filteredConcernData);
        }
        catch (error)
        {
            console.error(error);
        }
    };

    const handleAccountVerification = async (staff) => {
        try {
            if (staff.id === loggedInStaffId) {
                alert("Cannot deactivate your own account.");
                return;
            }

            const staffRef = doc(collection(db, "staffs"), staff.id);
            const updatedAccountStatus = !staff.staff_Account;
    
            await updateDoc(staffRef, {
                staff_Account: updatedAccountStatus,
            });

            const staffData = await getDocs(collection(db, "staffs"));    
            const filteredStaffData = staffData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));    
            setStaffList(filteredStaffData);
    
            alert(`Account verification updated for ${staff.staff_FirstName} ${staff.staff_LastName}`);
        } catch (error) {
            console.error('Error updating account verification:', error);
        }
    };

    const sortedConcerns = [...concernList].sort((a, b) => {
        const dateComparison = a.concern_Date.localeCompare(b.concern_Date);
        if (dateComparison !== 0) {
          return dateComparison;
        }
        return a.concern_Time.localeCompare(b.concern_Time);
    });

    const deleteRecord = async (id, collectionName) => {
        const docRef = doc(db, collectionName, id);        

        try {  
            if (id === loggedInStaffId) {
                alert("Cannot delete your own account.");
                return;
            }

            if (collectionName === 'staffs') {
                await deleteUser(id);
            }

            await deleteDoc(docRef);

            const docData = await getDoc(docRef);
            const item = { ...docData.data(), id: docData.id };

            if (collectionName == "students")
            {
                const concernsQuery = query(collection(db, 'concerns'), where('concern_StudentID', '==', item.id));
                const concernsData = await getDocs(concernsQuery);
        
                await Promise.all(concernsData.docs.map(async (concernDoc) => {
                    const concernId = concernDoc.id;
                    const concernRef = doc(db, 'concerns', concernId);
                    await deleteDoc(concernRef);
                }));
            }
            
            const updatedList = collectionName === 'students'
            ? studentList.filter((student) => student.id !== id)
            : staffList.filter((staff) => staff.id !== id);

            if (collectionName === 'students') {
                setStudentList(updatedList);
            } else if (collectionName === 'staffs') {
                setStaffList(updatedList);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <Container fluid>
                <Navbar bg="light" expand="lg">
                    <Navbar.Brand>ANHS Patient Portal</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            <Logout/>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </Container>
            <div className="container">
                <div className="row">
                    <div className="col">
                        <div className="card mt-3 mb-3">
                            <div className="card-header">
                                <div className="row">
                                    <h3 className="text-center mt-2">Health History</h3>
                                </div>
                            </div>
                            <div className="card-body">
                                {sortedConcerns.length > 0 ? (
                                    sortedConcerns.filter((concerns) => concerns.concern_Date === formattedDate)
                                    .map((concerns) => {
                                    const matchingStudent = studentList.find(student => student.id === concerns.concern_StudentID);
                                    return (
                                        <div className="card mb-3" key={concerns.id}>
                                            <div className={`card-header ${concerns.concern_Status ? 'bg-success' : 'bg-basic'}`}>
                                                <div className="row mt-2">
                                                    <div className="col">
                                                        <h6><strong>Date: </strong>{concerns.concern_Date}</h6>
                                                    </div>
                                                    <div className="col">
                                                        <h6><strong>Time: </strong> {concerns.concern_Time}</h6>
                                                    </div>
                                                </div>
                                                {matchingStudent && (
                                                    <>
                                                        <h6><strong>Name: </strong>{`${matchingStudent.student_FirstName} ${matchingStudent.student_MiddleName} ${matchingStudent.student_LastName}`}</h6>
                                                        <h6><strong>Number: </strong>{matchingStudent.student_MobileNumber}</h6>
                                                    </>
                                                )}
                                            </div>
                                            <div className="card-body">
                                                <p>{concerns.concern_Text}</p>
                                            </div>
                                            <div className="card-footer">
                                                <div className="d-grid gap-2 d-md-flex justify-content-md-between">
                                                    <button type="button" className="btn btn-secondary" 
                                                    onClick={() => handleConcernStatus(concerns)}
                                                    >{concerns.concern_Status ? 'Done' : 'Mark as Done'}</button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })) : (
                                    <h6 className="text-center mt-2">No history data available.</h6>
                                )}
                            </div>
                        </div>
                    </div>    
                    <div className="col">
                    <div className="card mt-3 mb-3">
                            <div className="card-header">
                                <select className="form-control mt-1 mb-2" value={userType} onChange={handleUserTypeChange}>
                                    <option className="text-center" disabled selected value="">Pick a List</option>
                                    <option value="Student" className="text-center">Student List</option>
                                    <option value="Staff" className="text-center">Staff List</option>
                                </select>
                                <form className="d-flex">
                                    <input className="form-control me-2" type="text" placeholder="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </form>
                            </div>
                            <div className="card-body">
                                {userType === 'Student' && studentList.length > 0 ? (
                                    studentList
                                    .filter((students) =>
                                        `${students.id} ${students.student_FirstName} ${students.student_MiddleName} ${students.student_LastName}`
                                            .toLowerCase()
                                            .includes(searchTerm.toLowerCase())
                                    )
                                    .map((students) => (
                                        <div className="card mb-3" key={students.id}>
                                            <div className="card-header">
                                                <h6 className="mt-2"><strong>{students.id}</strong></h6>
                                            </div>
                                            <div className="card-body">
                                                <p><strong>Name: </strong>{students.student_FirstName} {students.student_MiddleName} {students.student_LastName}</p>
                                                <p><strong>Year Level: </strong>{students.student_YearLevel}</p>
                                                <p><strong>Strand: </strong>{students.student_Strand}</p>
                                                <p><strong>Number: </strong>{students.student_MobileNumber}</p>
                                            </div>
                                            <div className="card-footer">
                                                <div className="d-grid gap-2 d-md-flex justify-content-md-between">
                                                    <button type="button" className="btn btn-info" onClick={() => setOpenedHistoryModal(students.id)}>Show History</button>
                                                    <button type="button" className="btn btn-primary" onClick={scrollToTop} style={{ display: showScrollToTop ? 'block' : 'none' }}>Top</button>
                                                    <button type="button" className="btn btn-danger" onClick={() => deleteRecord(students.id, 'students')} >Delete</button>
                                                </div>
                                            </div>
                                            <StudentHistoryModal
                                                students={students}
                                                historyModal={openedHistoryModal === students.id}
                                                handleCloseModal={handleCloseModal}
                                            />
                                        </div>
                                    ))
                                ) : userType === 'Staff' && staffList.length > 0 ? (
                                    staffList
                                    .filter((staffs) =>
                                        `${staffs.id} ${staffs.staff_FirstName} ${staffs.staff_MiddleName} ${staffs.staff_LastName}`
                                            .toLowerCase()
                                            .includes(searchTerm.toLowerCase())
                                    )
                                    .map((staffs) => (
                                        <div className="card mb-3" key={staffs.id}>
                                            <div className={`card-header ${staffs.staff_Account ? 'bg-success' : 'bg-danger'}`}>
                                                <h6 className="mt-2"><strong>{staffs.staff_Account ? 'Active' : 'Inactive'}</strong></h6>
                                            </div>
                                            <div className="card-body">
                                                <p><strong>Name: </strong>{staffs.staff_FirstName} {staffs.staff_MiddleName} {staffs.staff_LastName}</p>
                                                <p><strong>Department: </strong>{staffs.staff_Department}</p>
                                                <p><strong>Email: </strong>{staffs.staff_Email}</p>
                                            </div>
                                            <div className="card-footer">
                                                <div className="d-grid gap-2 d-md-flex justify-content-md-between">
                                                    <button
                                                        type="button"
                                                        className="btn btn-warning"
                                                        onClick={() => handleAccountVerification(staffs)}
                                                    >
                                                        {staffs.staff_Account ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button type="button" className="btn btn-primary" onClick={scrollToTop} style={{ display: showScrollToTop ? 'block' : 'none' }}>Top</button>
                                                    <button type="button" className="btn btn-danger" onClick={() => deleteRecord(staffs.id, 'staffs')} >Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <h6 className="text-center mt-2">
                                        No records shown
                                    </h6>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
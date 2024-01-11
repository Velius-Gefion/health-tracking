import { Logout } from "./auth";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Modal from "react-bootstrap/Modal";
import Nav from "react-bootstrap/Nav";
import React, { useEffect, useState} from 'react';
import { db } from '../config/firebase';
import { getDocs, getDoc, collection, addDoc, deleteDoc, updateDoc, doc, where, query} from 'firebase/firestore'
//import Calendar from 'react-calendar';
//import 'react-calendar/dist/Calendar.css';

const scrollToTop = () => {
    window.scrollTo({
          top: 0,
          behavior: 'smooth',
    });
};

const StudentHistoryModal = ({ students, historyModal, handleCloseModal }) => {
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        const fetchHistoryData = async () => {
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
    
        if (historyModal) {
            fetchHistoryData();
        }
    }, [students.id, historyModal]);

    return (
        <Modal show={historyModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
            <Modal.Title>{students.id}'s History</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {historyData.length > 0 ? (
                    historyData.filter((concerns) => concerns.concern_StudentID === students.id)
                    .map((concerns, index) => (
                        <div key={index}>
                            <div className="card">
                                <div className="card-header">
                                    <p>Date: {concerns.concern_Date}</p>
                                    <p>Time: {concerns.concern_Time}</p>
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
    const [studentList, setStudentList] = useState([])
    const [concernList, setConcernList] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [openedHistoryModal, setOpenedHistoryModal] = useState(null);
    const today = new Date();
const todayDateString = today.toISOString().split('T')[0];

    useEffect(() => {
        const getStudentList = async () => {
            try {
                const data = await getDocs(collection(db, "students"));
                const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                setStudentList(filteredData);
            } catch (error) {
                console.error(error);
            }
        };
    
        const getConcernList = async () => {
            try {
                const data = await getDocs(collection(db, "concerns"));
                const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                setConcernList(filteredData);
            } catch (error) {
                console.error(error);
            }
        };

        getStudentList();
        getConcernList();
    
        const handleScroll = () => {
            const scrolled = window.scrollY > 100;
            setShowScrollToTop(scrolled);
        };
    
        window.addEventListener('scroll', handleScroll);
    
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleCloseModal = () => {
        setOpenedHistoryModal(null)
    };

    const sortedConcerns = [...concernList].sort((a, b) => {
        const dateComparison = a.concern_Date.localeCompare(b.concern_Date);
        if (dateComparison !== 0) {
          return dateComparison;
        }
        return a.concern_Time.localeCompare(b.concern_Time);
    });

    const deleteRecord = async (id) => {
        const studentsDoc = doc(db, "students", id);
        await deleteDoc(studentsDoc);
    
        try {
            const data = await getDocs(collection(db, "students"));
            const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setStudentList(filteredData);
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
                                <h3 className="text-center mt-2">Health History</h3>
                            </div>
                            <div className="card-body">
                                {sortedConcerns.map((concerns, index) => {
                                    const concernDate = concerns.concern_Date;
                                    const isToday = concernDate === todayDateString;

                                    return isToday ? (
                                        <div className="card mb-3" key={concerns.id}>
                                            <div className="card-header">
                                                <div className="row mt-2">
                                                    <div className="col">
                                                        <h6><strong>Date: </strong>{concerns.concern_Date}</h6>
                                                    </div>
                                                    <div className="col">
                                                        <h6><strong>Time: </strong> {concerns.concern_Time}</h6>
                                                    </div>
                                                </div>
                                                <h6><strong>Name: </strong>{studentList[index].student_FirstName} {studentList[index].student_MiddleName} {studentList[index].student_LastName}</h6>
                                                <h6><strong>Number: </strong>{studentList[index].student_MobileNumber}</h6>
                                            </div>
                                            <div className="card-body">
                                                <p>{concerns.concern_Text}</p>
                                            </div>
                                            <div className="card-footer">
                                                <div className="d-grid gap-2 d-md-flex justify-content-md-between">
                                                    <button type="button" className="btn btn-danger" >Mark as Done</button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    </div>    
                    <div className="col">
                    <div className="card mt-3 mb-3">
                            <div className="card-header">
                                <h3 className="text-center mt-2">Student List</h3>
                                <form className="d-flex">
                                    <input className="form-control me-2" type="text" placeholder="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </form>
                            </div>
                            <div className="card-body">
                                {studentList.filter((students) =>
                                `${students.id} ${students.student_FirstName} ${students.student_MiddleName} ${students.student_LastName}`
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase())
                                ).map((students) => (
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
                                            <button type="button" className="btn btn-danger" onClick={() => deleteRecord(students.id)} >Delete</button>
                                        </div>
                                    </div>
                                    <StudentHistoryModal
                                        students={students}
                                        historyModal={openedHistoryModal === students.id}
                                        handleCloseModal={handleCloseModal}
                                    />
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
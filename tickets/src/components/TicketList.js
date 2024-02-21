import React, { useEffect, useState,useRef  } from 'react';
import axios from 'axios';
import './styles.css';
import { Card, CardBody, CardHeader, CardFooter, Divider, Button ,Pagination} from "@nextui-org/react";
import { FiSun, FiMoon } from "react-icons/fi";
import { FaHashtag,FaChildReaching,FaPerson } from "react-icons/fa6";
import { toast, Toaster } from 'react-hot-toast';
import { Typography } from "@material-tailwind/react";
import { FaTicketAlt } from "react-icons/fa";
import io from 'socket.io-client';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter} from "@nextui-org/react";
const SpringModal = ({ isOpen, setIsOpen, selectedTicketNumber }) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={setIsOpen} backdrop="blur">
            <ModalContent style={{ backgroundColor: '#f5f5f5', border: '2px solid #007bff', borderRadius: '10px' }}>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1" style={{ color: '#007bff' }}>
                            <span>Tu número de ticket es</span>
                            <span style={{ fontSize: '2em', fontWeight: 'bold' }}>#{selectedTicketNumber}</span>
                        </ModalHeader>
                        <ModalBody>
                            <p>Por favor, espera tu turno.</p>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Cerrar
                            </Button>
                            <Button color="primary" onPress={onClose}>
                                Entendido!
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
function App() {
    const [tickets, setTickets] = useState([]);
    const [theme, setTheme] = useState('light');
    const socketRef = useRef();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTicketNumber, setSelectedTicketNumber] = useState(localStorage.getItem('selectedTicket') || null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(() => {
        socketRef.current = io('http://192.168.0.15:3000');
        const fetchTickets = async () => {
            try {
                const response = await axios.get('http://192.168.0.15:3000/tickets');
                setTickets(response.data);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            }
        };

        fetchTickets();

        socketRef.current.on('ticketSelected', (index) => {
            setTickets(tickets => {
                const updatedTickets = [...tickets];
                updatedTickets[index].status = 'Esperando';
                updatedTickets[index].time = new Date().toLocaleTimeString();
                return updatedTickets;
            });
        });

        socketRef.current.on('allTicketsDeleted', () => {
            setSelectedTicketNumber(null);
            localStorage.removeItem('selectedTicket');
        });

        const checkSelectedTicket = async () => {
            const response = await axios.get('http://192.168.0.15:3000/tickets');
            const tickets = response.data;
            const selectedTicketNumber = localStorage.getItem('selectedTicket');
            const selectedTicket = tickets.find(ticket => ticket.description === selectedTicketNumber);
            if (!selectedTicket) {
                setSelectedTicketNumber(null);
                localStorage.removeItem('selectedTicket');
            } else {
                setSelectedTicketNumber(selectedTicket.description);
            }
        };

        socketRef.current.on('reconnect', checkSelectedTicket);

        return () => {
            socketRef.current.disconnect();
        };
    }, []);
    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }

    const handleSelect = async (index) => {
        // Verifica si ya se ha seleccionado un ticket
        const selectedTicketNumber = localStorage.getItem('selectedTicket');
        const selectedTicket = tickets.find(ticket => ticket.description === selectedTicketNumber);
        if (selectedTicketNumber !== null && selectedTicket) {
            toast.error('Ya has seleccionado un ticket');
            setIsModalOpen(true); // Abre el modal
            return;
        }

        try {
            const response = await axios.put(`http://192.168.0.15:3000/tickets/${index}`, { status: 'Esperando' });

            if (response.data.error) {
                toast.error(response.data.error);
                return;
            }

            const updatedTickets = [...tickets];
            updatedTickets[index].status = 'Esperando';
            updatedTickets[index].time = new Date().toLocaleTimeString();
            setTickets(updatedTickets);
            toast.success('Ticket seleccionado');
            socketRef.current.emit('ticketSelected', index);

        } catch (error) {
            console.error('Error updating ticket:', error);
        }
        setSelectedTicketNumber(tickets[index].description); // Guarda el número de ticket seleccionado
        localStorage.setItem('selectedTicket', tickets[index].description); // Guarda el ticket seleccionado en el localStorage
        setIsModalOpen(true); // Abre el modal
    }
    return (
        <div>
            <div className="p-4">
                {theme === 'light' ? <FiMoon onClick={toggleTheme} size={24} /> : <FiSun onClick={toggleTheme} size={24} />}
            </div>
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex items-center text-2xl label-style1">
                    <FaTicketAlt />
                    <p>Cantidad de Tickets: {tickets.filter(ticket => ticket.status === 'Disponible').length}</p>
                </div>
            </div>
            <TicketCardList tickets={tickets} theme={theme} handleSelect={handleSelect} currentPage={currentPage} setCurrentPage={setCurrentPage} selectedTicketNumber={selectedTicketNumber} />                   <Toaster />
            <SpringModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} selectedTicketNumber={selectedTicketNumber} />
        </div>
    );
}
// Agrega selectedTicketNumber a las props del componente
function TicketCardList({ tickets, theme, handleSelect, currentPage, setCurrentPage, selectedTicketNumber }) {
    const ticketsPerPage = 14;
    const totalPages = Math.ceil(tickets.length / ticketsPerPage);
    const ticketsToShow = tickets.slice((currentPage - 1) * ticketsPerPage, currentPage * ticketsPerPage);

    return (
        <main className={`${theme} text-foreground bg-background`}>
        <div className="flex flex-wrap gap-4 p-4 ">
            {ticketsToShow.map((ticket, index) => (
                
                <Card 
                className={`max-w-[400px] shadow-sm`} 
                style={{ 
                    backgroundColor: ticket.status === 'Esperando' ? '#737373' : (theme === 'light' ? '#e5e7eb' : ''),
                    boxShadow: ticket.description === selectedTicketNumber ? '0 0 10px 5px #007bff' : '' // Usa selectedTicketNumber aquí
                }}
                key={index} 
                >
                    <CardHeader className="card-content flex gap-3 px-unit-2 py-unit-1 min-w-unit-3xl justify-between items-center">
                        <Typography variant="h1">
                            <div className="flex justify-between items-center">
                                <p className="text-5xl">{ticket.description}</p>
                                <FaHashtag />
                            </div>
                        </Typography>
                    </CardHeader>
                    <Divider/>
                    <CardBody className="card-content">                    
                        <p className="text-lg text-blue-700 flex items-center justify-between">
                            <span>Status: {ticket.status}</span>
                            {ticket.status === 'Disponible' ? <FaChildReaching size={30} /> : <FaPerson size={30} />}
                        </p>
                        <p className="text-lg text-blue-700">Time: {ticket.time}</p>           
                                 </CardBody>
                    <Divider/>
                    <CardFooter className="card-content">
                        <Button 
                            color={ticket.status === 'Esperando' ? 'default' : 'primary'} 
                            variant="shadow" 
                            onClick={() => handleSelect(index)} 
                            disabled={ticket.status === 'Esperando'}
                        >
                            Seleccionar
                        </Button>  
                    </CardFooter>
                </Card>
            ))}
        </div>
        <div className="flex justify-center items-center">
            <Pagination total={totalPages} initialPage={1} variant="bordered" onChange={(newPage) => setCurrentPage(newPage)} />
        </div>
        </main>
    );
}

export default App;
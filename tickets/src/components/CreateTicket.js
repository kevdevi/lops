import React, { useState, useEffect,useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Input, Button } from '@nextui-org/react';
import { FaTicketAlt } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import { toast, Toaster } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client';

function CreateTicket() {
    const { register, handleSubmit, reset } = useForm();
    const [theme, setTheme] = useState('light');
    const socketRef = useRef();

    useEffect(() => {
        document.documentElement.className = theme;
        socketRef.current = io.connect('http://192.168.0.15:3000');
        socketRef.current.on('allTicketsDeleted', () => {
            // Aquí va tu lógica para restablecer el estado del ticket seleccionado
            // Por ejemplo:
            // setTicketSelected(false);
            // localStorage.setItem('ticketSelected', 'false');
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }

    const onSubmit = data => {
        const tickets = Array.from({length: data.quantity}, (_, i) => ({
            id: uuidv4(),
            description: `${i + 1}`,
            status: 'Disponible',
            time:'....' , // Cambia este campo
        }));

        const promise = axios.post('http://192.168.0.15:3000/tickets', tickets);
        toast.promise(
            promise,
            {
                loading: 'Creando tickets...',
                success: <b>Tickets creados!</b>,
                error: <b>No se pudieron crear los tickets.X</b>,
            }
        );

        promise.then(response => {
            console.log(response.data);
            reset();
        });
    };
const deleteAllTickets = () => {
const promise = axios.delete('http://192.168.0.15:3000/tickets');
        toast.promise(
            promise,
            {
                loading: 'Eliminando tickets...',
                success: <b>Tickets eliminados!</b>,
                error: <b>No se pudieron eliminar los tickets.</b>,
            }
        );

        promise.then(response => {
            console.log(response.data);
            socketRef.current.emit('allTicketsDeleted');

        });
    };
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} style={{ marginLeft: '20px' }}>
                <div onClick={toggleTheme} style={{ cursor: 'pointer' }}> {/* Cambia Button por div y añade estilo de cursor */}
                    {theme === 'light' ? <FiMoon size={24} /> : <FiSun size={24} />}
                </div>
                <p className="text-2xl label-style">Genera una cantidad de Tickets:</p>
                <div className="input-container">
                    <Input
                        type="number"
                        placeholder="0"
                        labelPlacement="outside"
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <span className="text-default-150 text-small"><FaTicketAlt /></span>
                            </div>
                        }
                        {...register('quantity')}
                        min="1"
                        required
                        style={{ width: '100%' }}
                    />
                </div>
                <Button 
                    color={theme === 'light' ? 'primary' : 'default'} 
                    variant="shadow" 
                    type="submit"
                    style={{ marginRight: '10px', marginTop: '20px' }}
                >
                    Generar Tickets
                </Button>
                <Button 
                    color={theme === 'light' ? 'primary' : 'default'} 
                    variant="shadow" 
                    type="button" 
                    onClick={deleteAllTickets}
                    style={{ marginTop: '20px' }}
                >
                    Eliminar Tickets
                </Button>
            </form>
            <Toaster />
        </div>
    );
}

export default CreateTicket;
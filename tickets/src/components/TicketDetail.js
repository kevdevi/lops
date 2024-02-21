import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TicketDetail({ match }) {
    const [ticket, setTicket] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:3000/tickets/${match.params.id}`)
            .then(response => {
                setTicket(response.data);
            });
    }, [match.params.id]);

    if (!ticket) return null;

    return (
        <div>
            <h2>{ticket.description}</h2>
            <p>{ticket.status}</p>
        </div>
    );
}

export default TicketDetail;
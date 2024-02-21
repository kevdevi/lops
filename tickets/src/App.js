import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import TicketList from './components/TicketList';
import CreateTicket from './components/CreateTicket';
import TicketDetail from './components/TicketDetail';
import 'tailwindcss/tailwind.css';


function App() {
  return (
    <NextUIProvider>
      <Router>
        <Routes>
          <Route path="/" element={<TicketList />} />
          <Route path="/create" element={<CreateTicket />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
        </Routes>
      </Router>
    </NextUIProvider>
  );
}

export default App;
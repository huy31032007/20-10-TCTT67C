import React from 'react';
import { createRoot } from 'react-dom/client';
import { AlbumApp } from './AlbumApp.jsx';
import { TicketApp } from '../ticket/TicketApp.jsx';

createRoot(document.getElementById('albumRoot')).render(<AlbumApp/>);

createRoot(document.getElementById('ticketRoot')).render(<TicketApp/>);

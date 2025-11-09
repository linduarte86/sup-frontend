import { io } from 'socket.io-client';

const socket = io("http://localhost:3333"); // Altere para o seu backend

export default socket;
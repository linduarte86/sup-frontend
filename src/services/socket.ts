import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_BACKEND_URL!,); // Altere para o seu backend

export default socket;
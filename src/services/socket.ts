"use client";

import { io } from 'socket.io-client';
import { env } from "next-runtime-env";

const socket = io(env("NEXT_PUBLIC_SOCKET_URL")!, {
  transports: ['websocket'],
}); // Altere para o seu backend

export default socket;
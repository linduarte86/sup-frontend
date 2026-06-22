import axios from "axios";
import { serverConfig } from "@/config/server";

// Serviço de API para comunicação com o backend, usando axios.

export const api = axios.create({
  baseURL: serverConfig.apiUrl!,
  withCredentials: true,
});
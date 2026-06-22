"use client";
// Serviço de API para comunicação com o backend, usando axios.

import axios from "axios";
import { clientConfig } from "@/config/client";

export const api = axios.create({
  baseURL: clientConfig.apiUrl,
  withCredentials: true,
});
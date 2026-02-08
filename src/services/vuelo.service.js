import api from "./api";

export const getVuelos = async () => {
  const response = await api.get("/vuelos");
  return response.data;
};
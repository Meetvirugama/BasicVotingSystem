import axios from "axios";

const publicApi = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true
});

export default publicApi;

import { useState, useEffect, useContext, createContext } from "react";
import { io } from "socket.io-client";
import userService from "../services/userService";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const user = userService.getCurrentUser();
    console.log("User: ", user);
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_BACKEND_URL);

    newSocket.on("connect", (socket) => {
      newSocket.emit("register", user?.id);
      console.log(`User connected with scoket id: ${socket?.id}`);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

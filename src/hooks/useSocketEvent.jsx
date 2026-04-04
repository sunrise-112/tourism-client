import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

export default function useSocketEvent(eventName, handler) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, eventName, handler]);
}

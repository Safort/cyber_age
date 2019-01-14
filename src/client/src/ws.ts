export interface WSProps {
    onOpen?: (socket: any) => void;
    onMessage?: (socket: any) => void;
    onClose?: (socket: any) => void;
    onError?: (socket: any) => void;
}

class WS {
    constructor(props: WSProps) {
        const { onOpen, onClose, onError, onMessage } = props;
        this.socket = new WebSocket('ws://localhost:8080/ws');

        this.socket.onopen = onOpen || null;
        this.socket.onmessage = onMessage || null;
        this.socket.onclose = onClose || null;
        this.socket.onerror = onError || null;
    }

    socket: WebSocket;
}



export default WS;

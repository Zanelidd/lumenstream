import {useEffect, useState} from 'react'
import './App.css'
import {io} from "socket.io-client";

const socket = io('http://localhost:3000');
type Measurment = {
    count: number,
    value: number,
    timestamp: number
}

export default function App() {

    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<Measurment[]>([]);

    useEffect(() => {
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.on('measurement', (data: Measurment) => {
            setMessages((prev) =>
                [data, ...prev].slice(0, 15));
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('measurement');
        };
    }, []);


    return (
        <div style={{fontFamily: 'system-ui', padding: '2rem', maxWidth: 600, margin: '0 auto'}}>
            <h1>LumenStream — Jour 1</h1>
            <p>
                État :{' '}
                <strong style={{color: connected ? '#0f6e56' : '#993c1d'}}>
                    {connected ? '● Connecté' : '○ Déconnecté'}
                </strong>
            </p>
            <ul style={{listStyle: 'none', padding: 0}}>
                {messages.map((m) => (
                    <li
                        key={m.count}
                        style={{
                            padding: '6px 12px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <span>#{m.count}</span>
                        <span>{m.value}</span>
                        <span style={{color: '#888'}}>
              {new Date(m.timestamp).toLocaleTimeString()}
            </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}



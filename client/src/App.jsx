import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import BrowserViewer from './components/BrowserViewer';
import StatusBar from './components/StatusBar';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState({ status: 'disconnected', message: 'Not connected' });
  const [frameData, setFrameData] = useState(null);

  // Connect to socket on component mount
  useEffect(() => {
    // Create socket connection to the streaming namespace
    const newSocket = io(`${window.location.origin}/browser-stream`, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Connected to streaming server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from streaming server');
      setIsConnected(false);
      setStatus({ status: 'disconnected', message: 'Disconnected from server' });
    });

    newSocket.on('status', (statusData) => {
      console.log('Status update:', statusData);
      setStatus(statusData);
    });

    newSocket.on('stream-frame', (data) => {
      setFrameData(data);
    });

    // Save socket to state
    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Handler to start streaming
  const handleStartStream = () => {
    if (!socket || !isConnected) return;

    console.log('Requesting to start streaming');
    socket.emit('start-stream', { jobId: `job_${Date.now()}` });
  };

  // Handler to stop streaming
  const handleStopStream = () => {
    if (!socket || !isConnected) return;

    console.log('Requesting to stop streaming');
    socket.emit('stop-stream');
    setFrameData(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Browser Automation Monitor</h1>
        <div className="connection-status">
          <span className={isConnected ? 'status-connected' : 'status-disconnected'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </header>

      <main className="content-area">
        <BrowserViewer frameData={frameData} />
      </main>

      <StatusBar status={status} />

      <div className="control-panel">
        <button
          onClick={handleStartStream}
          disabled={!isConnected || status.status === 'streaming'}
          className="control-button start-button"
        >
          Start Streaming
        </button>
        <button
          onClick={handleStopStream}
          disabled={!isConnected || status.status !== 'streaming'}
          className="control-button stop-button"
        >
          Stop Streaming
        </button>
      </div>
    </div>
  );
}

export default App;
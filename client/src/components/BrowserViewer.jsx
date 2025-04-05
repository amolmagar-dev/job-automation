import { useState, useEffect, useRef } from 'react';
import './BrowserViewer.css';

function BrowserViewer({ frameData }) {
    const [fps, setFps] = useState(0);
    const [frameCount, setFrameCount] = useState(0);
    const framesRef = useRef(0);
    const lastUpdateRef = useRef(Date.now());

    // Calculate FPS based on received frames
    useEffect(() => {
        // Update total frame count when we receive a new frame
        if (frameData) {
            framesRef.current += 1;
            setFrameCount(prevCount => prevCount + 1);
        }

        // Set up an interval to calculate FPS every second
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = (now - lastUpdateRef.current) / 1000;

            if (elapsed >= 1) {
                const currentFps = Math.round(framesRef.current / elapsed);
                setFps(currentFps);

                // Reset counters
                framesRef.current = 0;
                lastUpdateRef.current = now;
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [frameData]);

    // If no frame data is available, show placeholder
    if (!frameData) {
        return (
            <div className="browser-viewer empty-viewer">
                <div className="placeholder-content">
                    <p>No stream active</p>
                    <p className="placeholder-instruction">Click "Start Streaming" to begin</p>
                </div>
            </div>
        );
    }

    return (
        <div className="browser-viewer">
            <div className="stream-container">
                <img
                    src={frameData.image}
                    alt="Browser stream"
                    className="stream-image"
                />
            </div>

            <div className="stream-info">
                <span className="info-item">FPS: {fps}</span>
                <span className="info-item">Frames: {frameCount}</span>
                <span className="info-item">Quality: {frameData?.quality || 'Unknown'}</span>
            </div>
        </div>
    );
}

export default BrowserViewer;
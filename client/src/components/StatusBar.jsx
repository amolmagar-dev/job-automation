import './StatusBar.css';

function StatusBar({ status }) {
    const getStatusClass = (statusType) => {
        switch (statusType) {
            case 'streaming':
                return 'status-streaming';
            case 'error':
                return 'status-error';
            case 'stopped':
                return 'status-stopped';
            case 'initializing':
                return 'status-initializing';
            default:
                return 'status-default';
        }
    };

    return (
        <div className={`status-bar ${getStatusClass(status.status)}`}>
            <div className="status-indicator"></div>
            <div className="status-message">
                <span className="status-type">{status.status}: </span>
                {status.message}
                {status.jobId && <span className="status-job-id"> (Job: {status.jobId})</span>}
            </div>
        </div>
    );
}

export default StatusBar;
import { useEffect } from 'react';
import './Toast.css';

interface Props {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 2000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="toast-container">
      <div className="toast-message">
        <span className="toast-icon">✅</span>
        {message}
      </div>
    </div>
  );
}

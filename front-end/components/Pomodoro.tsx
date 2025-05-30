'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const Pomodoro = () => {
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const fetchStatus = async () => {
    try {
      setIsConnecting(true);
      const response = await fetch(`${API_BASE_URL}/pomodoro/status`, {
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setIsActive(data.is_active);
      setIsBreak(data.is_break);
      setError(null);
      
      if (data.start_time) {
        const startTime = new Date(data.start_time);
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const totalSeconds = isBreak ? 5 * 60 : 25 * 60;
        setTimeLeft(Math.max(0, totalSeconds - elapsedSeconds));
      }
    } catch (error) {
      console.error('Error fetching pomodoro status:', error);
      setError('Cannot connect to timer service. Please ensure the backend is running on port 5001.');
    } finally {
      setIsConnecting(false);
    }
  };

  const startPomodoro = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pomodoro/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status === 'running') {
        setIsActive(true);
        setTimeLeft(25 * 60); // 25 minutes in seconds
        setError(null);
      }
    } catch (error) {
      console.error('Error starting pomodoro:', error);
      setError('Failed to start timer. Please ensure the backend is running.');
    }
  };

  const stopPomodoro = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pomodoro/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status === 'stopped') {
        setIsActive(false);
        setIsBreak(false);
        setTimeLeft(null);
        setError(null);
      }
    } catch (error) {
      console.error('Error stopping pomodoro:', error);
      setError('Failed to stop timer. Please ensure the backend is running.');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '25:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold text-gray-800">
        {isBreak ? 'Break Time!' : 'Focus Time'}
      </h2>
      <div className="text-4xl font-mono font-bold text-gray-900">
        {formatTime(timeLeft)}
      </div>
      <div className="flex space-x-4">
        {!isActive ? (
          <button
            onClick={startPomodoro}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!!error || isConnecting}
          >
            Start
          </button>
        ) : (
          <button
            onClick={stopPomodoro}
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!!error || isConnecting}
          >
            Stop
          </button>
        )}
      </div>
      {error && (
        <div className="text-sm text-red-600 text-center p-2 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      {isConnecting && !error && (
        <div className="text-sm text-gray-600 text-center">
          Connecting to timer service...
        </div>
      )}
      {isActive && !error && !isConnecting && (
        <p className="text-sm text-gray-600">
          {isBreak ? 'Take a short break!' : 'Stay focused!'}
        </p>
      )}
    </div>
  );
};

export default Pomodoro; 
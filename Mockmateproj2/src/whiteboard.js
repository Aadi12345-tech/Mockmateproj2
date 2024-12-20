import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userDrawings, setUserDrawings] = useState([]);
  const socket = useRef(null);


  useEffect(() => {
    socket.current = new WebSocket('ws://localhost:5000');

    socket.current.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'INIT') {
        setUserDrawings(data.data);
      } else if (data.type === 'DRAW') {
        setUserDrawings((prev) => [...prev, data.data]);
      }
    };

    return () => {
      socket.current.close();
    };
  }, []);


  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };


  const stopDrawing = () => {
    setIsDrawing(false);
    const context = canvasRef.current.getContext('2d');
    context.beginPath(); 
  };


  const draw = (e) => {
    if (!isDrawing) return;
    const context = canvasRef.current.getContext('2d');
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.strokeStyle = 'black';

    context.lineTo(e.clientX - canvasRef.current.offsetLeft, e.clientY - canvasRef.current.offsetTop);
    context.stroke();
  };


  const sendDrawing = (e) => {
    if (!isDrawing) return;
    const data = {
      x: e.clientX - canvasRef.current.offsetLeft,
      y: e.clientY - canvasRef.current.offsetTop,
    };

    socket.current.send(JSON.stringify({ type: 'DRAW', data }));
  };


  const drawOnCanvas = (context, drawing) => {
    context.lineTo(drawing.x, drawing.y);
    context.stroke();
  };


  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); 
    userDrawings.forEach((drawing) => drawOnCanvas(context, drawing));
  }, [userDrawings]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseOut={stopDrawing}
        onMouseEnter={sendDrawing}
        style={{ border: '1px solid black' }}
      ></canvas>
    </div>
  );
};

export default Whiteboard;

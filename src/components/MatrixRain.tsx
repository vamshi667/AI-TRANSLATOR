import { useEffect, useRef } from 'react';

export const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Characters (Katakana + Latin)
    const charset = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    // Array of drops - one per column
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -100; // Start at random negative y positions
    }

    const draw = () => {
      // Translucent black to create trail effect
      ctx.fillStyle = 'rgba(1, 4, 9, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = charset[Math.floor(Math.random() * charset.length)];

        // Neon Matrix Green
        ctx.fillStyle = '#00FF41'; 
        
        // Add random cyan drops occasionally
        if (Math.random() > 0.98) {
          ctx.fillStyle = '#00F5FF';
        }

        // Draw character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33); // ~30 fps

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-20"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

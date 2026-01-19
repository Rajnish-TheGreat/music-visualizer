import { useRef, useEffect } from 'react';

// Bars Visualizer - Classic frequency bars
export const BarsVisualizer = ({ audioProcessor, theme }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const draw = () => {
      const data = audioProcessor.getFrequencyData();
      if (!data) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barCount = 128;
      const barWidth = canvas.width / barCount;
      const step = Math.floor(data.length / barCount);

      for (let i = 0; i < barCount; i++) {
        const barHeight = (data[i * step] / 255) * canvas.height * 0.8;
        const x = i * barWidth;
        const y = canvas.height - barHeight;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
        gradient.addColorStop(0, theme.color1);
        gradient.addColorStop(1, theme.color2);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [audioProcessor, theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// Circular Visualizer - Radial frequency display
export const CircularVisualizer = ({ audioProcessor, theme }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 4;

    const draw = () => {
      const data = audioProcessor.getFrequencyData();
      if (!data) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const bars = 180;
      const step = Math.floor(data.length / bars);

      for (let i = 0; i < bars; i++) {
        const value = data[i * step];
        const percent = value / 255;
        const barHeight = percent * radius;
        
        const angle = (Math.PI * 2 * i) / bars;
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        // Color based on position
        const hue = (i / bars) * 360;
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw center circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
      ctx.strokeStyle = theme.color1;
      ctx.lineWidth = 4;
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [audioProcessor, theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// Wave Visualizer - Oscilloscope-style waveform
export const WaveVisualizer = ({ audioProcessor, theme }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const draw = () => {
      const data = audioProcessor.getTimeDomainData();
      if (!data) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const sliceWidth = canvas.width / data.length;
      let x = 0;

      // Draw waveform
      ctx.lineWidth = 3;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, theme.color1);
      gradient.addColorStop(1, theme.color2);
      ctx.strokeStyle = gradient;

      ctx.beginPath();

      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [audioProcessor, theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// Particles Visualizer - Dynamic particle system
export const ParticlesVisualizer = ({ audioProcessor, theme }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles
    const particleCount = 200;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
    }));

    const draw = () => {
      const data = audioProcessor.getFrequencyData();
      const average = audioProcessor.getAverageFrequency();
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!data) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const intensity = average / 255;

      particlesRef.current.forEach((particle, i) => {
        // Update particle position
        particle.x += particle.vx * (1 + intensity);
        particle.y += particle.vy * (1 + intensity);

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        const size = particle.size * (1 + intensity * 2);
        const hue = (i / particleCount) * 360;
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${0.6 + intensity * 0.4})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections to nearby particles
        particlesRef.current.slice(i + 1).forEach(other => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100 * (1 + intensity)) {
            ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${(1 - dist / 100) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [audioProcessor, theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

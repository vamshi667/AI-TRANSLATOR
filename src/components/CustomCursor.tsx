import { useEffect, useState } from 'react';

export const CustomCursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let trailX = pos.x;
    let trailY = pos.y;

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      setIsHovering(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'select'
      );
    };

    const onMouseDown = () => {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 500);
    };

    const updateTrail = () => {
      trailX += (pos.x - trailX) * 0.15;
      trailY += (pos.y - trailY) * 0.15;
      setTrail({ x: trailX, y: trailY });
      animationFrameId = requestAnimationFrame(updateTrail);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    updateTrail();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [pos.x, pos.y]);

  return (
    <>
      <div 
        className={`custom-cursor ${isHovering ? 'cursor-hover' : ''} ${isClicked ? 'cursor-click' : ''}`}
        style={{ left: pos.x, top: pos.y }}
      />
      <div 
        className="custom-cursor-trail"
        style={{ left: trail.x, top: trail.y }}
      />
    </>
  );
};

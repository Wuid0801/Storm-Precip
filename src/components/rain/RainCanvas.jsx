import React, { memo, useEffect, useRef } from 'react';
import useActiveView from '../../hooks/useActiveView';

const RainCanvas = memo(function RainCanvas({ configRef }) {
  const canvasRef = useRef(null);
  const { activeView } = useActiveView();
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    let raindrops = [];
    let ripples = [];
    let glassStreaks = [];
    let lastRainDensity = -1;

    const getTypeProfile = (type) => {
      if (type === 'snow') {
        return {
          streakLength: 0.2,
          drift: 0.8,
          speedY: 0.34,
          rippleChance: 0,
          streakAlphaBoost: -0.01,
          glowBoost: 0.05,
        };
      }

      if (type === 'sleet') {
        return {
          streakLength: 0.62,
          drift: 1.15,
          speedY: 0.82,
          rippleChance: 0.008,
          streakAlphaBoost: 0.005,
          glowBoost: 0.02,
        };
      }

      return {
        streakLength: 1,
        drift: 1,
        speedY: 1,
        rippleChance: 0.015,
        streakAlphaBoost: 0.014,
        glowBoost: 0,
      };
    };

    const createRaindrops = () => {
      const cfg = configRef.current;
      const densityVal = cfg.density ?? 220;
      const densityFactor = densityVal / 220;
      const baseCount = Math.max(150, Math.floor((width * height) / 11000));
      const count = Math.max(80, Math.floor(baseCount * densityFactor));
      lastRainDensity = densityVal;
      raindrops = Array.from({ length: count }, (_, index) => {
        const depth = 0.4 + Math.random() * 1.45;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          baseLength: 8 + Math.random() * 24 * depth,
          baseSpeedY: (5 + Math.random() * 10) * depth,
          baseSpeedX: (0.8 + Math.random() * 2.8) * depth,
          baseThickness: 0.45 + Math.random() * 1.25,
          alpha: 0.1 + Math.random() * 0.35,
          depth,
          heavy: index % 17 === 0,
          wobbleSeed: Math.random() * Math.PI * 2,
        };
      });
    };

    const createGlassStreaks = () => {
      glassStreaks = Array.from({ length: 8 }, () => ({
        x: Math.random() * width,
        y: -Math.random() * height,
        width: 1 + Math.random() * 2,
        length: 120 + Math.random() * 260,
        speed: 0.2 + Math.random() * 0.6,
        alpha: 0.03 + Math.random() * 0.04,
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      createRaindrops();
      createGlassStreaks();
      ripples = [];
    };

    const drawBackgroundReflection = (type) => {
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(15, 17, 21, 0.1)');
      gradient.addColorStop(0.68, 'rgba(16, 19, 24, 0.08)');
      gradient.addColorStop(1, type === 'snow' ? 'rgba(112, 132, 160, 0.16)' : 'rgba(82, 102, 130, 0.18)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.save();
      context.globalAlpha = type === 'snow' ? 0.06 : 0.09;
      context.fillStyle = '#dbe8ff';
      if(activeView === 'OVERVIEW') {
        context.fillRect(width * 0.66, height * 0.78, width * 0.18, 1);
        context.fillRect(width * 0.1, height * 0.82, width * 0.12, 1);
        context.fillRect(width * 0.22, height * 0.88, width * 0.35, 1);
      }
      context.restore();
    };

    const drawGlassStreaks = (type) => {
      const visibility = type === 'snow' ? 0.22 : 1;
      context.save();
      glassStreaks.forEach((streak) => {
        streak.y += streak.speed * (type === 'sleet' ? 1.15 : type === 'snow' ? 0.4 : 1);
        if (streak.y > height + streak.length) {
          streak.y = -streak.length - Math.random() * 80;
          streak.x = Math.random() * width;
        }

        const gradient = context.createLinearGradient(streak.x, streak.y, streak.x, streak.y + streak.length);
        gradient.addColorStop(0, 'rgba(255,255,255,0)');
        gradient.addColorStop(0.2, `rgba(192, 214, 255, ${streak.alpha * visibility})`);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = gradient;
        context.fillRect(streak.x, streak.y, streak.width, streak.length);
      });
      context.restore();
    };

    const drawRaindrops = () => {
      const config = configRef.current;
      const profile = getTypeProfile(config.precipType);
      const densityVal = config.density ?? 220;
      if (densityVal !== lastRainDensity) {
        lastRainDensity = densityVal;
        createRaindrops();
      }

      const windFactor = 0.35 + (config.wind ?? 1) * 0.85;
      const dropLenFactor = (config.dropLength ?? 22) / 22;
      const turb = config.turbulence ?? 0.35;

      context.save();
      context.lineCap = 'round';

      raindrops.forEach((drop, index) => {
        const depthPulse = 0.92 + Math.sin(index * 0.13 + performance.now() * 0.0006 + drop.wobbleSeed) * 0.08;
        const speedY = drop.baseSpeedY * config.speed * profile.speedY * depthPulse;
        const speedX =
          drop.baseSpeedX *
          profile.drift *
          (config.precipType === 'snow' ? 0.45 : 1) *
          windFactor;
        const length = Math.max(
          3,
          drop.baseLength * config.thickness * profile.streakLength * dropLenFactor,
        );
        const thickness = Math.max(
          config.precipType === 'snow' ? 0.8 : 0.45,
          drop.baseThickness * config.thickness * (config.precipType === 'snow' ? 1.45 : config.precipType === 'sleet' ? 1.1 : 1),
        );

        const t = performance.now() * 0.001;
        drop.x +=
          speedX +
          (config.precipType === 'snow' ? Math.sin(t + drop.wobbleSeed) * 0.22 : 0) +
          Math.sin(t * 1.7 + drop.wobbleSeed * 2) * turb * 2.2;
        drop.y += speedY;

        if (drop.y > height + length || drop.x > width + length) {
          drop.x = Math.random() * width - width * 0.2;
          drop.y = -length - Math.random() * 200;
        }

        const endX = drop.x + length * (config.precipType === 'snow' ? 0.06 : 0.14);
        const endY = drop.y + length;

        context.beginPath();
        const alpha = Math.max(0.06, Math.min(0.78, drop.alpha + profile.streakAlphaBoost + (drop.heavy ? 0.12 : 0)));
        const color = config.precipType === 'snow'
          ? `rgba(232, 241, 255, ${alpha + profile.glowBoost})`
          : config.precipType === 'sleet'
            ? `rgba(194, 213, 245, ${alpha})`
            : drop.heavy
              ? `rgba(206, 224, 255, ${Math.min(alpha + 0.08, 0.72)})`
              : `rgba(163, 188, 234, ${alpha})`;

        context.strokeStyle = color;
        context.lineWidth = drop.heavy ? thickness + 0.35 : thickness;
        context.moveTo(drop.x, drop.y);
        context.lineTo(endX, endY);
        context.stroke();

        if (profile.rippleChance > 0 && drop.y > height * 0.88 && Math.random() < profile.rippleChance * config.speed) {
          ripples.push({
            x: endX,
            y: Math.min(endY, height - 18),
            radius: 2,
            alpha: 0.18 + Math.random() * 0.2,
            growth: 0.42 + Math.random() * 0.35,
          });
        }
      });

      context.restore();
    };

    const drawRipples = () => {
      context.save();
      ripples = ripples.filter((ripple) => ripple.alpha > 0.005 && ripple.radius < 42);

      ripples.forEach((ripple) => {
        ripple.radius += ripple.growth;
        ripple.alpha *= 0.972;

        context.beginPath();
        context.ellipse(ripple.x, ripple.y, ripple.radius * 1.5, ripple.radius * 0.42, 0, 0, Math.PI * 2);
        context.strokeStyle = `rgba(170, 200, 255, ${ripple.alpha})`;
        context.lineWidth = 1;
        context.stroke();
      });

      context.restore();
    };

    const render = () => {
      const { precipType } = configRef.current;
      context.clearRect(0, 0, width, height);
      drawBackgroundReflection(precipType);
      drawGlassStreaks(precipType);
      drawRaindrops();
      drawRipples();
      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, [configRef]);

  return <canvas ref={canvasRef} className="rain-canvas" aria-hidden="true" />;
});

export default RainCanvas;

import { useRef, useState } from 'react';

/**
 * 3D Tilt Card — tracks mouse position and applies a perspective tilt effect.
 * Smooth transition when entering/leaving.
 */
export default function TiltCard({ children, className = '', intensity = 15 }) {
    const cardRef = useRef(null);
    const [style, setStyle] = useState({});

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -intensity;
        const rotateY = ((x - centerX) / centerX) * intensity;

        // Subtle shine position
        const shineX = (x / rect.width) * 100;
        const shineY = (y / rect.height) * 100;

        setStyle({
            transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
            '--shine-x': `${shineX}%`,
            '--shine-y': `${shineY}%`,
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        });
    };

    return (
        <div
            ref={cardRef}
            className={`tilt-card ${className}`}
            style={style}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="tilt-card-shine" />
            {children}
        </div>
    );
}

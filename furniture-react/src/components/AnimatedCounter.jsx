import { useState, useEffect, useRef } from 'react';

/**
 * Animated counter that counts up when the element scrolls into view.
 * Uses IntersectionObserver for performance.
 */
export default function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    animateCount();
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [hasAnimated]);

    const animateCount = () => {
        const numericEnd = parseInt(end.toString().replace(/[^0-9]/g, ''), 10);
        if (isNaN(numericEnd)) {
            setCount(end);
            return;
        }

        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * numericEnd);

            setCount(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    };

    // Extract the numeric part and any prefix/suffix from the end value
    const endStr = end.toString();
    const numericPart = endStr.replace(/[^0-9]/g, '');
    const textSuffix = endStr.replace(/[0-9]/g, '') || suffix;

    return (
        <span ref={ref} className="animated-counter">
            {hasAnimated ? count : 0}{textSuffix}
        </span>
    );
}

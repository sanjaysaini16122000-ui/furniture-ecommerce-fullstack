import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll-triggered reveal animations.
 * Uses IntersectionObserver for performance.
 * 
 * @param {Object} options
 * @param {number} options.threshold - Visibility threshold (0-1), default 0.15
 * @param {string} options.rootMargin - Root margin, default '0px'
 * @param {boolean} options.once - Only trigger once, default true
 * @returns {{ ref: React.RefObject, isVisible: boolean }}
 */
export function useScrollReveal({ threshold = 0.15, rootMargin = '0px 0px -50px 0px', once = true } = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) observer.unobserve(element);
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold, rootMargin, once]);

    return { ref, isVisible };
}

/**
 * Component wrapper that applies scroll-reveal animations to its children.
 * 
 * @param {Object} props
 * @param {'fade-up'|'fade-left'|'fade-right'|'zoom-in'|'flip-up'} props.animation - Animation type
 * @param {number} props.delay - Delay in ms before animation starts
 * @param {number} props.duration - Animation duration in ms
 * @param {string} props.className - Additional CSS classes
 */
export default function ScrollReveal({
    children,
    animation = 'fade-up',
    delay = 0,
    duration = 600,
    className = '',
    threshold = 0.15,
    as: Component = 'div'
}) {
    const { ref, isVisible } = useScrollReveal({ threshold });

    return (
        <Component
            ref={ref}
            className={`scroll-reveal ${animation} ${isVisible ? 'revealed' : ''} ${className}`}
            style={{
                transitionDelay: `${delay}ms`,
                transitionDuration: `${duration}ms`
            }}
        >
            {children}
        </Component>
    );
}

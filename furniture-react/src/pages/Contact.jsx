import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { WhatsAppLink } from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import {
    sanitizeForm,
    validatePhone,
    validateEmail,
    validateName,
    validateMessage
} from '../utils/sanitize';

export default function Contact() {
    const { settings, addMessage } = useData();
    const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [lastSubmit, setLastSubmit] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Rate limiting: 1 minute cooldown between submissions
        const now = Date.now();
        if (now - lastSubmit < 60000) {
            setError('Please wait a minute before submitting again.');
            return;
        }

        // Validate inputs
        if (!validateName(form.name)) {
            setError('Please enter a valid name (1-100 characters).');
            return;
        }
        if (!validatePhone(form.phone)) {
            setError('Please enter a valid phone number.');
            return;
        }
        if (!validateEmail(form.email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!validateMessage(form.message)) {
            setError('Please enter a message (max 2000 characters).');
            return;
        }

        // Sanitize all inputs before saving
        const sanitizedData = sanitizeForm({
            name: form.name,
            phone: form.phone,
            email: form.email,
            message: form.message
        });

        // Save sanitized message to data store
        addMessage(sanitizedData);
        setLastSubmit(now);
        setSubmitted(true);

        // Generate WhatsApp message with sanitized form data
        const whatsappMessage = `New Inquiry from Website:
Name: ${sanitizedData.name}
Phone: ${sanitizedData.phone}
Email: ${sanitizedData.email}
Message: ${sanitizedData.message}`;

        setTimeout(() => {
            window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
        }, 1500);
    };

    return (
        <>
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <span>Contact Us</span>
                    </div>
                    <h1 className="gradient-text">Get In Touch</h1>
                    <p>We'd love to hear from you. Reach out for any inquiries!</p>
                </div>
            </section>

            {/* Contact Content */}
            <section className="section section-light">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Form */}
                        <ScrollReveal animation="fade-right">
                            <div className="contact-form-container">
                                <h2>Send Us a Message</h2>
                                <p>Fill out the form and we'll get back to you within 24 hours.</p>

                                {submitted ? (
                                    <div className="form-success">
                                        <div className="success-icon">✓</div>
                                        <h3>Thank You!</h3>
                                        <p>Your message has been received. Redirecting to WhatsApp...</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="contact-form">
                                        {error && (
                                            <div className="login-error" style={{ marginBottom: '1rem' }}>
                                                <span>⚠️</span> {error}
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label>Your Name *</label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                placeholder="Enter your name"
                                                required
                                                maxLength={100}
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    value={form.phone}
                                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                                    placeholder="+91 XXXXX XXXXX"
                                                    required
                                                    maxLength={15}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Email Address</label>
                                                <input
                                                    type="email"
                                                    value={form.email}
                                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                                    placeholder="your@email.com"
                                                    maxLength={254}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Your Message * <small>({form.message.length}/2000)</small></label>
                                            <textarea
                                                value={form.message}
                                                onChange={e => setForm({ ...form, message: e.target.value })}
                                                placeholder="Tell us about your requirements..."
                                                rows="4"
                                                required
                                                maxLength={2000}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary btn-block btn-glow">
                                            Send Message
                                        </button>
                                    </form>
                                )}
                            </div>
                        </ScrollReveal>

                        {/* Contact Info */}
                        <ScrollReveal animation="fade-left" delay={200}>
                            <div className="contact-info">
                                <div className="contact-info-card shimmer-border">
                                    <h3>Contact Information</h3>
                                    <div className="contact-item">
                                        <div className="contact-icon-wrapper">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Visit Us</strong>
                                            <p>{settings.address}</p>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <div className="contact-icon-wrapper">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Call Us</strong>
                                            <p><a href={`tel:${settings.phone}`}>{settings.phone}</a></p>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <div className="contact-icon-wrapper">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Email Us</strong>
                                            <p><a href={`mailto:${settings.email}`}>{settings.email}</a></p>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <div className="contact-icon-wrapper">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Working Hours</strong>
                                            <p>Mon - Sat: 10:00 AM - 8:00 PM</p>
                                        </div>
                                    </div>
                                </div>

                                <ScrollReveal animation="fade-up" delay={400}>
                                    <div className="quick-contact">
                                        <h4>Quick Contact</h4>
                                        <p>Prefer to chat? Message us directly on WhatsApp!</p>
                                        <WhatsAppLink
                                            message="Hello, I would like to inquire about your products and services."
                                            productUrl={typeof window !== 'undefined' ? window.location.href : ''}
                                            className="btn-glow"
                                        >
                                            Chat on WhatsApp
                                        </WhatsAppLink>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>
        </>
    );
}

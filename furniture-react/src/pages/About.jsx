import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { WhatsAppLink } from '../components/WhatsAppButton';

export default function About() {
    const { settings } = useData();

    const stats = [
        { number: '15+', label: 'Years of Experience' },
        { number: '500+', label: 'Happy Families' },
        { number: '1000+', label: 'Projects Delivered' },
        { number: '50+', label: 'Expert Craftsmen' }
    ];

    const values = [
        {
            icon: '🎯',
            title: 'Quality First',
            description: 'We never compromise on quality. Every piece of furniture is crafted with premium materials and meticulous attention to detail.'
        },
        {
            icon: '💡',
            title: 'Innovation',
            description: 'We blend traditional craftsmanship with modern design trends to create furniture that is both timeless and contemporary.'
        },
        {
            icon: '🤝',
            title: 'Customer Focus',
            description: 'Your satisfaction is our priority. We work closely with you to understand your vision and bring it to life.'
        },
        {
            icon: '⏰',
            title: 'On-Time Delivery',
            description: 'We respect your time. Our projects are completed within the promised timeline without compromising quality.'
        }
    ];

    return (
        <>
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <span>About Us</span>
                    </div>
                    <h1>About {settings.businessName}</h1>
                    <p>Where Dreams Meet Craftsmanship</p>
                </div>
            </section>

            {/* About Story */}
            <section className="section section-light">
                <div className="container">
                    <div className="about-content">
                        <div className="about-text">
                            <h2>Our Story</h2>
                            <p>
                                <strong>{settings.businessName}</strong> was born from a passion for creating
                                spaces that inspire. We believe that great furniture isn't just about function —
                                it's about bringing your vision to life with uncompromising quality and attention
                                to detail.
                            </p>
                            <p>
                                As a fresh, dynamic team of craftsmen and designers, we bring modern sensibilities
                                combined with timeless techniques. Every project we undertake is a collaboration
                                with our clients, ensuring that the final result exceeds expectations.
                            </p>
                            <p>
                                We offer a complete range of services including custom furniture
                                manufacturing, modular kitchen design, and complete interior solutions.
                                Our dedicated team works tirelessly to bring your dream spaces to life.
                            </p>
                        </div>
                        <div className="about-image">
                            <div className="about-image-placeholder">
                                🛠️
                                <span>Excellence in Every Detail</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-row">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item">
                                <span className="stat-number">{stat.number}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="section section-warm">
                <div className="container">
                    <div className="section-header">
                        <h2>Our Values</h2>
                        <p>The principles that guide everything we do</p>
                    </div>
                    <div className="services-grid">
                        {values.map((value, index) => (
                            <div key={index} className="service-card">
                                <div className="service-icon">{value.icon}</div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="section section-light">
                <div className="container">
                    <div className="section-header">
                        <h2>What We Offer</h2>
                        <p>Comprehensive solutions for all your furniture and interior needs</p>
                    </div>
                    <div className="services-grid">
                        <div className="service-card">
                            <div className="service-icon">🛋️</div>
                            <h3>Custom Furniture</h3>
                            <p>Sofas, beds, wardrobes, dining sets, TV units, study tables, and more - all custom-made to your specifications.</p>
                            <Link to="/furniture" className="btn btn-outline">View Collection</Link>
                        </div>
                        <div className="service-card">
                            <div className="service-icon">🍳</div>
                            <h3>Modular Kitchens</h3>
                            <p>L-Shape, U-Shape, Parallel, Island, and Straight kitchen designs with premium fittings and finishes.</p>
                            <Link to="/kitchen" className="btn btn-outline">Explore Kitchens</Link>
                        </div>
                        <div className="service-card">
                            <div className="service-icon">🏠</div>
                            <h3>Interior Design</h3>
                            <p>Complete interior solutions for homes, hotels, offices, and commercial spaces. From concept to completion.</p>
                            <Link to="/projects" className="btn btn-outline">See Projects</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section section-warm">
                <div className="container">
                    <div className="section-header">
                        <h2>Let's Create Something Beautiful Together</h2>
                        <p>Ready to transform your space? Get in touch for a free consultation.</p>
                        <br />
                        <div className="cta-buttons">
                            <WhatsAppLink
                                message="Hello, I would like to discuss my interior design requirements."
                                productUrl={typeof window !== 'undefined' ? window.location.href : ''}
                            >
                                Chat on WhatsApp
                            </WhatsAppLink>
                            <Link to="/contact" className="btn btn-outline">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

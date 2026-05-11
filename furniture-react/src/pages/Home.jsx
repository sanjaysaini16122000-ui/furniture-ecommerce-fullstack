import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { WhatsAppLink } from '../components/WhatsAppButton';
import HeroCarousel from '../components/HeroCarousel';
import AnimatedCounter from '../components/AnimatedCounter';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import TiltCard from '../components/TiltCard';
import { getRecentlyViewed } from '../utils/storage';
import '../styles/home.css';

export default function Home() {
    const { settings, furniture, projects, categories } = useData();

    // Group feature products by category and select one random image per category
    const featuredCategories = categories.map(category => {
        const items = furniture.filter(item => (item.category || '').toLowerCase().trim() === category.toLowerCase().trim());
        if (items.length === 0) return null;

        const itemsWithImages = items.filter(i => (i.images && i.images.length > 0) || i.image);
        const sourceItems = itemsWithImages.length > 0 ? itemsWithImages : items;

        const randomItem = sourceItems[Math.floor(Math.random() * sourceItems.length)];
        const image = randomItem.images && randomItem.images.length > 0
            ? randomItem.images[0]
            : (randomItem.image || '');

        return {
            name: category,
            image,
            count: items.length
        };
    }).filter(Boolean);

    const recentProjects = projects.slice(0, 3);

    const testimonials = [
        {
            name: 'Rajesh Kumar',
            location: 'Delhi',
            text: 'Excellent quality furniture! The L-shape sofa we ordered is absolutely beautiful and very comfortable. Highly recommended!',
            rating: 5
        },
        {
            name: 'Priya Sharma',
            location: 'Gurgaon',
            text: 'Got our modular kitchen done from here. The team was professional and the final result exceeded our expectations. Great value for money!',
            rating: 5
        },
        {
            name: 'Amit Verma',
            location: 'Noida',
            text: 'They designed our entire living room and bedroom. The attention to detail and quality of work is outstanding. Will definitely recommend!',
            rating: 5
        }
    ];

    const stats = [
        { number: '500+', label: 'Happy Customers', icon: '😊' },
        { number: '1000+', label: 'Projects Completed', icon: '🏠' },
        { number: '15+', label: 'Years Experience', icon: '🏆' },
        { number: '100%', label: 'Satisfaction Rate', icon: '⭐' }
    ];

    return (
        <>
            {/* Hero Carousel */}
            <HeroCarousel />

            {/* Floating Furniture Marquee */}
            <div className="furniture-marquee">
                <div className="marquee-track">
                    <Link to="/furniture" className="marquee-link">🛋️ Sofas</Link>
                    <span>•</span>
                    <Link to="/furniture" className="marquee-link">🛏️ Beds</Link>
                    <span>•</span>
                    <Link to="/furniture" className="marquee-link">👔 Wardrobes</Link>
                    <span>•</span>
                    <Link to="/furniture" className="marquee-link">🍽️ Dining</Link>
                    <span>•</span>
                    <Link to="/furniture" className="marquee-link">📺 TV Units</Link>
                    <span>•</span>
                    <Link to="/kitchen" className="marquee-link">🍳 Kitchens</Link>
                    <span>•</span>
                    <Link to="/furniture" className="marquee-link">🪑 Study Tables</Link>
                    <span>•</span>
                    <Link to="/furniture" className="marquee-link">🪞 Dressing Tables</Link>
                    <span>•</span>
                    <Link to="/furniture" className="marquee-link">🛕 Temple Units</Link>
                </div>
            </div>

            {/* Stats */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-row">
                        {stats.map((stat, index) => (
                            <ScrollReveal key={index} animation="zoom-in" delay={index * 150}>
                                <div className="stat-item">
                                    <span className="stat-icon">{stat.icon}</span>
                                    <span className="stat-number">
                                        <AnimatedCounter end={stat.number} duration={2000} />
                                    </span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="trust-badges">
                <div className="container">
                    <div className="trust-badges-row">
                        <div className="trust-badge">
                            <span className="trust-badge-icon">🛡️</span>
                            <span>5-Year Warranty</span>
                        </div>
                        <div className="trust-badge">
                            <span className="trust-badge-icon">🏭</span>
                            <span>Factory Direct Prices</span>
                        </div>
                        <div className="trust-badge">
                            <span className="trust-badge-icon">🔧</span>
                            <span>Free Installation</span>
                        </div>
                        <div className="trust-badge">
                            <span className="trust-badge-icon">💯</span>
                            <span>100% Customizable</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products (Categories Cluster) */}
            <section className="section section-featured">
                {/* Floating furniture decorations */}
                <div className="floating-decor" aria-hidden="true">
                    <span className="float-item float-1">🛋️</span>
                    <span className="float-item float-2">🪑</span>
                    <span className="float-item float-3">🛏️</span>
                    <span className="float-item float-4">🍽️</span>
                </div>

                <div className="container">
                    <ScrollReveal animation="fade-up">
                        <div className="section-header">
                            <h2 className="gradient-text">Featured Collections</h2>
                            <p>Explore our wide range of premium furniture categories</p>
                        </div>
                    </ScrollReveal>

                    <div className="category-cluster-wrapper">
                        <div className="category-cluster-container">
                            {/* Center Node */}
                            <Link to="/furniture" className="cluster-node pos-center">
                                <div className="cluster-content">
                                    <h3>More</h3>
                                </div>
                            </Link>

                            {/* Satellite Nodes */}
                            {featuredCategories.slice(0, 4).map((cat, index) => {
                                const positions = ['pos-tl', 'pos-tr', 'pos-br', 'pos-bl'];
                                return (
                                    <Link to="/furniture" key={index} className={`cluster-node ${positions[index]}`}>
                                        <div className="node-text">
                                            <h3>{cat.name}</h3>
                                            <span className="cluster-count">{cat.count} Items</span>
                                        </div>
                                        <div className="node-image">
                                            {cat.image ? (
                                                <img src={cat.image} alt={cat.name} />
                                            ) : (
                                                <div className="node-image-placeholder">🛋️</div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <ScrollReveal animation="fade-up" delay={200}>
                        <div className="section-footer">
                            <Link to="/furniture" className="btn btn-outline">View All Products</Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Process / How It Works */}
            <section className="section section-light">
                <div className="container">
                    <ScrollReveal animation="fade-up">
                        <div className="section-header">
                            <h2>How It Works</h2>
                            <p>From idea to reality in 4 simple steps</p>
                        </div>
                    </ScrollReveal>
                    <div className="process-steps">
                        {[
                            { step: '01', icon: '💬', title: 'Consult', desc: 'Share your vision with our design experts' },
                            { step: '02', icon: '✏️', title: 'Design', desc: 'We create detailed 3D designs for your space' },
                            { step: '03', icon: '🔨', title: 'Craft', desc: 'Our artisans handcraft using premium materials' },
                            { step: '04', icon: '🚚', title: 'Deliver', desc: 'Professional installation at your doorstep' },
                        ].map((item, index) => (
                            <ScrollReveal key={index} animation="fade-up" delay={index * 150}>
                                <div className="process-step">
                                    <div className="process-step-number">{item.step}</div>
                                    <div className="process-step-icon">{item.icon}</div>
                                    <h3>{item.title}</h3>
                                    <p>{item.desc}</p>
                                    {index < 3 && <div className="process-connector" aria-hidden="true" />}
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3D Rotating Furniture Showcase */}
            <section className="section section-warm">
                <div className="container">
                    <ScrollReveal animation="fade-up">
                        <div className="section-header">
                            <h2>Crafted for Every Room</h2>
                            <p>Explore furniture designed for every corner of your home</p>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal animation="zoom-in">
                        <div className="showcase-3d">
                            <div className="showcase-cube">
                                <Link to="/furniture" className="cube-face cube-front">
                                    <span className="cube-emoji">🛋️</span>
                                    <span className="cube-label">Living Room</span>
                                </Link>
                                <Link to="/kitchen" className="cube-face cube-back">
                                    <span className="cube-emoji">🍳</span>
                                    <span className="cube-label">Kitchen</span>
                                </Link>
                                <Link to="/furniture" className="cube-face cube-right">
                                    <span className="cube-emoji">🛏️</span>
                                    <span className="cube-label">Bedroom</span>
                                </Link>
                                <Link to="/furniture" className="cube-face cube-left">
                                    <span className="cube-emoji">📚</span>
                                    <span className="cube-label">Study</span>
                                </Link>
                                <Link to="/furniture" className="cube-face cube-top">
                                    <span className="cube-emoji">🍽️</span>
                                    <span className="cube-label">Dining</span>
                                </Link>
                                <Link to="/furniture" className="cube-face cube-bottom">
                                    <span className="cube-emoji">🏢</span>
                                    <span className="cube-label">Office</span>
                                </Link>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Recent Projects */}
            <section className="section section-projects section-dark">
                <div className="container">
                    <ScrollReveal animation="fade-up">
                        <div className="section-header">
                            <h2 className="gradient-text">Recent Projects</h2>
                            <p>A glimpse into some of our recently completed interior transformations</p>
                        </div>
                    </ScrollReveal>

                    <div className="recent-projects-grid">
                        {recentProjects.map((project, index) => {
                            const projectImg = (project.images && project.images.length > 0) ? project.images[0] : (project.image || '');
                            return (
                                <ScrollReveal key={project.id} animation="fade-up" delay={index * 150}>
                                    <div className="recent-project-card shimmer-border">
                                        <div className="recent-project-image image-reveal">
                                            {projectImg ? (
                                                <img src={projectImg} alt={project.name} loading="lazy" />
                                            ) : (
                                                <div className="recent-project-placeholder">📁</div>
                                            )}
                                        </div>
                                        <div className="recent-project-content">
                                            <h3>{project.name}</h3>
                                            <span className="project-category">{project.category}</span>
                                            <p>{project.description?.length > 100 ? project.description.substring(0, 100) + '...' : project.description}</p>
                                            <Link to={`/projects/${project.id}`} className="project-link">View Project Details →</Link>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            );
                        })}
                    </div>
                    <ScrollReveal animation="fade-up" delay={300}>
                        <div className="section-footer">
                            <Link to="/projects" className="btn btn-outline">View All Projects</Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Services */}
            <section className="section section-light">
                <div className="container">
                    <ScrollReveal animation="fade-up">
                        <div className="section-header">
                            <h2>Our Services</h2>
                            <p>From concept to creation, we deliver excellence in every detail</p>
                        </div>
                    </ScrollReveal>
                    <div className="services-grid">
                        {[
                            { icon: '🛋️', title: 'Premium Furniture', desc: 'Handcrafted sofas, beds, wardrobes, and dining sets designed for comfort and elegance.', link: '/furniture', cta: 'View Collection' },
                            { icon: '🍳', title: 'Modular Kitchens', desc: 'Modern modular kitchen designs tailored to your space and lifestyle.', link: '/kitchen', cta: 'Explore Designs' },
                            { icon: '🏠', title: 'Interior Design', desc: 'Complete interior solutions for homes, hotels, and offices.', link: '/projects', cta: 'See Projects' },
                        ].map((service, index) => (
                            <ScrollReveal key={index} animation="fade-up" delay={index * 150}>
                                <TiltCard className="service-card-3d">
                                    <div className="service-card">
                                        <div className="service-icon">{service.icon}</div>
                                        <h3>{service.title}</h3>
                                        <p>{service.desc}</p>
                                        <Link to={service.link} className="btn btn-outline">{service.cta}</Link>
                                    </div>
                                </TiltCard>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="section section-warm">
                <div className="container">
                    <ScrollReveal animation="fade-up">
                        <div className="section-header">
                            <h2>Why Choose Us?</h2>
                            <p>Experience the difference of working with passionate craftsmen</p>
                        </div>
                    </ScrollReveal>
                    <div className="flip-cards-grid">
                        {[
                            { icon: '⭐', title: 'Quality Materials', desc: 'We use only premium quality wood, hardware, and finishes for lasting beauty.', back: 'Teak, Sheesham, engineered wood — every material is hand-selected for durability and beauty.' },
                            { icon: '🎨', title: 'Custom Designs', desc: 'Every piece is crafted to match your unique style and space requirements.', back: 'Send us your Pinterest board or sketch — we bring any vision to life with 3D mockups.' },
                            { icon: '🚚', title: 'On-Time Delivery', desc: 'We understand the value of your time. Projects completed as promised.', back: 'Track your order from workshop to doorstep. 95% of projects delivered on or before deadline.' },
                        ].map((item, index) => (
                            <ScrollReveal key={index} animation="fade-up" delay={index * 150}>
                                <div className="flip-card">
                                    <div className="flip-card-inner">
                                        <div className="flip-card-front">
                                            <div className="service-icon">{item.icon}</div>
                                            <h3>{item.title}</h3>
                                            <p>{item.desc}</p>
                                        </div>
                                        <div className="flip-card-back">
                                            <div className="service-icon">{item.icon}</div>
                                            <h3>{item.title}</h3>
                                            <p>{item.back}</p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="section section-light">
                <div className="container">
                    <ScrollReveal animation="fade-up">
                        <div className="section-header">
                            <h2>What Our Customers Say</h2>
                            <p>Real reviews from our valued customers</p>
                        </div>
                    </ScrollReveal>
                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <ScrollReveal key={index} animation="fade-up" delay={index * 200}>
                                <div className="testimonial-card shimmer-border">
                                    <div className="testimonial-quote-mark" aria-hidden="true">❝</div>
                                    <div className="testimonial-stars wave-stars">
                                        {'★'.repeat(testimonial.rating)}
                                    </div>
                                    <p className="testimonial-text">"{testimonial.text}"</p>
                                    <div className="testimonial-author">
                                        <div className="testimonial-avatar">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div>
                                            <strong>{testimonial.name}</strong>
                                            <span>{testimonial.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recently Viewed */}
            <RecentlyViewedSection furniture={furniture} />

            {/* CTA */}
            <section className="section section-cta-glow">
                <div className="container">
                    <ScrollReveal animation="zoom-in">
                        <div className="section-header">
                            <h2 className="gradient-text">Ready to Transform Your Space?</h2>
                            <p>Get in touch with us today for a free consultation</p>
                            <div className="cta-buttons">
                                <WhatsAppLink
                                    message="Hello, I am interested in your services. Please share more details."
                                    productUrl={typeof window !== 'undefined' ? window.location.href : ''}
                                    className="btn-glow"
                                >
                                    Get Free Quote on WhatsApp
                                </WhatsAppLink>
                                <Link to="/contact" className="btn btn-outline">Contact Us</Link>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </>
    );
}

/**
 * Shows products the user has recently viewed (from localStorage).
 */
function RecentlyViewedSection({ furniture }) {
    const recentIds = getRecentlyViewed();
    const recentProducts = recentIds
        .map(id => furniture.find(item => item.id === id))
        .filter(Boolean)
        .slice(0, 4);

    if (recentProducts.length === 0) return null;

    return (
        <section className="section section-light">
            <div className="container">
                <ScrollReveal animation="fade-up">
                    <div className="section-header">
                        <h2>Recently Viewed</h2>
                        <p>Products you've browsed recently</p>
                    </div>
                </ScrollReveal>
                <div className="cards-grid">
                    {recentProducts.map((item, index) => (
                        <ScrollReveal key={item.id} animation="fade-up" delay={index * 100}>
                            <ProductCard item={item} />
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}



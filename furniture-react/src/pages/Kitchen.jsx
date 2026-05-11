import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { WhatsAppLink } from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';

export default function Kitchen() {
    const { kitchens } = useData();

    const formatPrice = (price) => {
        if (!price || price === 0) return null;
        return '₹' + Number(price).toLocaleString('en-IN');
    };

    return (
        <>
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <span>Modular Kitchen</span>
                    </div>
                    <h1 className="gradient-text">Modular Kitchen Designs</h1>
                    <p>Transform your cooking space with modern, functional solutions</p>
                </div>
            </section>

            {/* Kitchen Types */}
            {kitchens.map((kitchen, index) => {
                // Get images array, filter out empty strings
                let images = kitchen.images || (kitchen.image ? [kitchen.image] : []);
                images = images.filter(img => img && img.trim() !== '');
                const mainImage = images.length > 0 ? images[0] : null;

                return (
                    <section key={kitchen.id} className={`section ${index % 2 === 0 ? 'section-light' : 'section-warm'}`}>
                        <div className="container">
                            <ScrollReveal animation="fade-up">
                                <div className="section-header">
                                    <h2 className="gradient-text">{kitchen.type} Kitchen</h2>
                                    <p>{kitchen.description}</p>
                                </div>
                            </ScrollReveal>
                            <ScrollReveal animation={index % 2 === 0 ? 'fade-left' : 'fade-right'} delay={200}>
                                <div className="kitchen-grid">
                                    <div className="kitchen-card shimmer-border">
                                        <div className="kitchen-image image-reveal">
                                            {mainImage ? (
                                                <img
                                                    src={mainImage}
                                                    alt={kitchen.name}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentNode.innerHTML = '🍳';
                                                    }}
                                                />
                                            ) : (
                                                '🍳'
                                            )}
                                            {images.length > 1 && (
                                                <span className="image-count">+{images.length - 1} photos</span>
                                            )}
                                        </div>
                                        <div className="kitchen-content">
                                            <h3>{kitchen.name}</h3>
                                            {kitchen.price && kitchen.price > 0 ? (
                                                <p className="card-price">
                                                    <span className="price-label">Starting from:</span> {formatPrice(kitchen.price)}
                                                </p>
                                            ) : (
                                                <p className="card-price card-price-quote">Get Quote</p>
                                            )}
                                            <ul className="kitchen-features">
                                                {kitchen.features.map((feature, i) => (
                                                    <li key={i}>{feature}</li>
                                                ))}
                                            </ul>
                                            <WhatsAppLink
                                                message={`Hello, I am interested in ${kitchen.name}${kitchen.price && kitchen.price > 0 ? ' (Starting from: ' + formatPrice(kitchen.price) + ')' : ''}. Please share more details.`}
                                                productUrl={typeof window !== 'undefined' ? window.location.href : ''}
                                                className="btn-glow"
                                            >
                                                Enquire on WhatsApp
                                            </WhatsAppLink>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>
                );
            })}

            {/* CTA */}
            <section className="section section-cta-glow">
                <div className="container">
                    <ScrollReveal animation="zoom-in">
                        <div className="section-header">
                            <h2 className="gradient-text">Get Your Dream Kitchen Today</h2>
                            <p>Free consultation and 3D design visualization</p>
                            <br />
                            <WhatsAppLink
                                message="Hello, I am interested in a modular kitchen. Please share more details."
                                productUrl={typeof window !== 'undefined' ? window.location.href : ''}
                                className="btn-glow"
                            >
                                Book Free Consultation
                            </WhatsAppLink>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </>
    );
}


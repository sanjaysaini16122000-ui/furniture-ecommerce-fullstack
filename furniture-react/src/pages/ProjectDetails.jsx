import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useEffect } from 'react';
import { WhatsAppLink } from '../components/WhatsAppButton';

export default function ProjectDetails() {
    const { id } = useParams();
    const { projects } = useData();

    const project = projects.find(p => String(p.id) === String(id));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!project) {
        return (
            <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
                <h2>Project Not Found</h2>
                <p>The project you are looking for does not exist.</p>
                <Link to="/projects" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Projects</Link>
            </div>
        );
    }

    // Filter valid images
    let images = project.images || (project.image ? [project.image] : []);
    images = images.filter(img => img && img.trim() !== '');

    const getEmoji = (category) => {
        const lower = category.toLowerCase();
        if (lower.includes('hotel')) return '🏨';
        if (lower.includes('office')) return '🏢';
        return '🏠';
    };

    return (
        <div className="project-details-page">
            <section className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <Link to="/projects">Projects</Link>
                        <span>/</span>
                        <span>{project.name}</span>
                    </div>
                </div>
            </section>

            <section className="section section-light">
                <div className="container">
                    <div className="project-header-content">
                        <span className="project-tag-large">{project.category}</span>
                        <h1>{project.name}</h1>
                        <p className="project-description-large">{project.description}</p>
                    </div>

                    <div className="project-gallery">
                        {images.length > 0 ? (
                            <div className="gallery-grid">
                                {images.map((img, index) => (
                                    <div key={index} className="gallery-item">
                                        <img src={img} alt={`${project.name} - View ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-images-placeholder">
                                <span style={{ fontSize: '4rem' }}>{getEmoji(project.category)}</span>
                                <p>No images available for this project.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section section-warm">
                <div className="container">
                    <div className="section-header">
                        <h2>Inspired by this project?</h2>
                        <p>Let's bring your vision to life.</p>
                        <br />
                        <WhatsAppLink
                            message={`Hello, I am interested in a project similar to "${project.name}".`}
                            productUrl={typeof window !== 'undefined' ? window.location.href : ''}
                        >
                            Get a Quote
                        </WhatsAppLink>
                    </div>
                </div>
            </section>
        </div>
    );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { WhatsAppLink } from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';

export default function Projects() {
    const { projects, projectCategories } = useData();
    const [filter, setFilter] = useState('all');
    const [showAll, setShowAll] = useState(false);

    // Default categories if strictly necessary, but context should provide them
    const categories = projectCategories || ['Hotel Interiors', 'Home Interiors', 'Office Interiors'];

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.category === filter);

    // Limit to 6 projects unless "Show All" is clicked
    const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 6);
    const hasMore = !showAll && filteredProjects.length > 6;

    const getEmoji = (category) => {
        // Simple mapping, fallback to generic
        const lower = category.toLowerCase();
        if (lower.includes('hotel')) return '🏨';
        if (lower.includes('office')) return '🏢';
        return '🏠';
    };

    return (
        <>
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <span>Our Projects</span>
                    </div>
                    <h1 className="gradient-text">Our Completed Projects</h1>
                    <p>Explore our portfolio of successfully completed interior design projects</p>
                </div>
            </section>

            {/* Filter & Projects */}
            <section className="section section-light">
                <div className="container">
                    <ScrollReveal animation="fade-up">
                        <div className="project-filters">
                            <button
                                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All Projects
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`filter-btn ${filter === cat ? 'active' : ''}`}
                                    onClick={() => setFilter(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </ScrollReveal>

                    <div className="projects-grid">
                        {displayedProjects.length === 0 && (
                            <ScrollReveal animation="zoom-in">
                                <div className="no-data">No projects found in this category.</div>
                            </ScrollReveal>
                        )}

                        {displayedProjects.map((project, index) => {
                            // Filter out empty/invalid image URLs
                            let images = project.images || (project.image ? [project.image] : []);
                            images = images.filter(img => img && img.trim() !== '');
                            const mainImage = images.length > 0 ? images[0] : null;

                            return (
                                <ScrollReveal key={project.id} animation="fade-up" delay={index * 120}>
                                    <Link to={`/projects/${project.id}`} className="project-card-link">
                                        <div className="project-card shimmer-border">
                                            {mainImage ? (
                                                <div className="image-reveal">
                                                    <img
                                                        src={mainImage}
                                                        alt={project.name}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentNode.parentNode.querySelector('.project-emoji-fallback').style.display = 'block';
                                                        }}
                                                    />
                                                </div>
                                            ) : null}

                                            {/* Fallback emoji (hidden by default if image exists, shown on error) */}
                                            <span className="project-emoji-fallback" style={{ display: mainImage ? 'none' : 'flex' }}>
                                                {getEmoji(project.category)}
                                            </span>

                                            {images.length > 1 && (
                                                <span className="image-count">+{images.length - 1} photos</span>
                                            )}
                                            <div className="project-info">
                                                <span className="project-tag">{project.category}</span>
                                                <h3>{project.name}</h3>
                                                <p>{project.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                </ScrollReveal>
                            );
                        })}
                    </div>

                    {hasMore && (
                        <ScrollReveal animation="fade-up" delay={800}>
                            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                                <button className="btn btn-primary" onClick={() => setShowAll(true)}>
                                    View All Projects
                                </button>
                            </div>
                        </ScrollReveal>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="section section-cta-glow">
                <div className="container">
                    <ScrollReveal animation="zoom-in">
                        <div className="section-header">
                            <h2 className="gradient-text">Want a Similar Project?</h2>
                            <p>Let's discuss your interior design requirements</p>
                            <br />
                            <WhatsAppLink
                                message="Hello, I saw your projects and I am interested in interior design services."
                                productUrl={typeof window !== 'undefined' ? window.location.href : ''}
                                className="btn-glow"
                            >
                                Discuss Your Project
                            </WhatsAppLink>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </>
    );
}

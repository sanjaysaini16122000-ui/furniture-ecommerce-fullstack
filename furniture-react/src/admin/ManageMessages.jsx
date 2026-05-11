import { useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { adminMessagesAPI } from '../services/adminAPI';

export default function ManageMessages() {
    const { messages: contextMessages, markMessageRead, deleteMessage: deleteContextMessage } = useData();
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadMessages = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminMessagesAPI.getAll();
            const list = data.results || data || [];
            if (list.length > 0) {
                setMessages(list);
            } else {
                // Fallback to context messages
                setMessages(contextMessages || []);
            }
        } catch {
            setMessages(contextMessages || []);
        } finally {
            setLoading(false);
        }
    }, [contextMessages]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const formatDate = (timestamp) => {
        if (!timestamp) return '—';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleView = async (msg) => {
        setSelectedMessage(msg);
        if (!msg.read) {
            // Update backend
            await adminMessagesAPI.markRead(msg.id);
            // Update local
            if (markMessageRead) markMessageRead(msg.id);
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        // Delete from backend
        await adminMessagesAPI.delete(id);
        // Delete from context
        if (deleteContextMessage) deleteContextMessage(id);
        // Delete from local
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage?.id === id) {
            setSelectedMessage(null);
        }
    };

    const unreadCount = messages.filter(m => !m.read).length;

    return (
        <>
            <div className="admin-header">
                <h1>
                    📬 Messages
                    {unreadCount > 0 && (
                        <span className="header-badge">{unreadCount} new</span>
                    )}
                </h1>
                <button className="btn btn-secondary" onClick={loadMessages} disabled={loading}>
                    🔄 Refresh
                </button>
            </div>

            {loading ? (
                <div className="admin-loading">
                    <div className="admin-spinner"></div>
                    <p>Loading messages...</p>
                </div>
            ) : (
                <div className="messages-layout">
                    {/* Messages List */}
                    <div className="messages-list">
                        {messages.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📭</span>
                                <p>No messages yet</p>
                                <small>Messages from the Contact form will appear here</small>
                            </div>
                        ) : (
                            messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`message-item ${!msg.read ? 'unread' : ''} ${selectedMessage?.id === msg.id ? 'selected' : ''}`}
                                    onClick={() => handleView(msg)}
                                >
                                    <div className="message-item-header">
                                        <strong className="message-name">{msg.name}</strong>
                                        <span className="message-time">{formatDate(msg.timestamp || msg.created_at)}</span>
                                    </div>
                                    <p className="message-phone">{msg.phone || msg.email || '—'}</p>
                                    <p className="message-preview">{(msg.message || msg.body || '').substring(0, 60)}...</p>
                                    {!msg.read && <span className="unread-dot"></span>}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Message Detail */}
                    <div className="message-detail">
                        {selectedMessage ? (
                            <>
                                <div className="message-detail-header">
                                    <h2>{selectedMessage.name}</h2>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(selectedMessage.id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                                <div className="message-meta">
                                    <div className="meta-item">
                                        <span className="meta-label">📞 Phone:</span>
                                        <a href={`tel:${selectedMessage.phone}`}>{selectedMessage.phone || '—'}</a>
                                    </div>
                                    {selectedMessage.email && (
                                        <div className="meta-item">
                                            <span className="meta-label">✉️ Email:</span>
                                            <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                                        </div>
                                    )}
                                    <div className="meta-item">
                                        <span className="meta-label">🕐 Received:</span>
                                        <span>{formatDate(selectedMessage.timestamp || selectedMessage.created_at)}</span>
                                    </div>
                                </div>
                                <div className="message-body">
                                    <h4>Message</h4>
                                    <p>{selectedMessage.message || selectedMessage.body || '—'}</p>
                                </div>
                                <div className="message-actions">
                                    {selectedMessage.phone && (
                                        <>
                                            <a
                                                href={`https://wa.me/${(selectedMessage.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${selectedMessage.name}, Thank you for contacting The Urban Karigar!`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-whatsapp"
                                            >
                                                💬 Reply on WhatsApp
                                            </a>
                                            <a
                                                href={`tel:${selectedMessage.phone}`}
                                                className="btn btn-secondary"
                                            >
                                                📞 Call Now
                                            </a>
                                        </>
                                    )}
                                    {selectedMessage.email && (
                                        <a
                                            href={`mailto:${selectedMessage.email}`}
                                            className="btn btn-secondary"
                                        >
                                            ✉️ Reply via Email
                                        </a>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="empty-detail">
                                <span>📨</span>
                                <p>Select a message to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { vendorFitsEvent } from '@/lib/eventTypes';

export default function SearchInput({ isCompact = false }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [vendors, setVendors] = useState([]);
    const wrapperRef = useRef(null);
    const router = useRouter();
    const { eventPreference } = useAuth();

    const categories = [
        { type: 'dj', title: 'DJ ומוזיקה', icon: 'fa-music' },
        { type: 'photographer', title: 'צילום אירועים', icon: 'fa-camera-retro' },
        { type: 'catering', title: 'קייטרינג', icon: 'fa-utensils' },
        { type: 'venue', title: 'אולמות וגנים', icon: 'fa-building' },
        { type: 'makeup', title: 'איפור', icon: 'fa-eye' },
        { type: 'hair', title: 'עיצוב שיער', icon: 'fa-scissors' },
        { type: 'dresses', title: 'שמלות כלה', icon: 'fa-person-dress' },
    ];

    useEffect(() => {
        fetch('/api/vendors')
            .then(res => res.json())
            .then(data => setVendors(Array.isArray(data) ? data : []))
            .catch(() => {});
            
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        const filteredCats = categories.filter(c => c.title.includes(query)).map(c => ({ ...c, isCategory: true }));
        const filteredVendors = vendors
            .filter((v) => v.name.toLowerCase().includes(query.toLowerCase()))
            .filter((v) => vendorFitsEvent(v, eventPreference))
            .map((v) => ({ ...v, isVendor: true }));
        
        setSuggestions([...filteredCats, ...filteredVendors].slice(0, 6));
        setIsOpen(true);
    }, [query, vendors, eventPreference]);

    const handleSelect = (item) => {
        if (item.isCategory) {
            router.push(`/category/${item.type}`);
        } else {
            router.push(`/vendor/${item.id}`);
        }
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div ref={wrapperRef} className={`nav-search-wrapper ${isCompact ? 'compact' : ''}`}>
            <div className="search-input-container">
                <i className="fas fa-search search-icon"></i>
                <input 
                    type="text" 
                    placeholder="חפשו ספק או קטגוריה..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setIsOpen(true)}
                />
            </div>

            <AnimatePresence>
                {isOpen && suggestions.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="search-suggestions"
                    >
                        {suggestions.map((item, idx) => (
                            <div 
                                key={idx} 
                                className="suggestion-item"
                                onClick={() => handleSelect(item)}
                            >
                                <i className={`fas ${item.isCategory ? item.icon : 'fa-user-tag'}`}></i>
                                <span>{item.isCategory ? item.title : item.name}</span>
                                <small>{item.isCategory ? 'קטגוריה' : item.typeLabel || 'ספק'}</small>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .nav-search-wrapper {
                    position: relative;
                    width: 300px;
                    margin: 0 20px;
                }

                .search-input-container {
                    display: flex;
                    align-items: center;
                    background: rgba(212, 175, 55, 0.05);
                    border-radius: 100px;
                    padding: 10px 20px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(212, 175, 55, 0.1);
                }

                .search-input-container:focus-within {
                    background: white;
                    border-color: var(--primary-color);
                    box-shadow: 0 10px 30px rgba(212, 175, 55, 0.15);
                    transform: translateY(-1px);
                }

                .search-icon {
                    color: var(--primary-color);
                    font-size: 1rem;
                    margin-left: 12px;
                    opacity: 0.8;
                }

                input {
                    background: transparent;
                    border: none;
                    outline: none;
                    width: 100%;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #333;
                    font-family: var(--font-assistant);
                }

                input::placeholder {
                    color: #999;
                    font-weight: 400;
                }

                .search-suggestions {
                    position: absolute;
                    top: calc(100% + 10px);
                    left: 0;
                    right: 0;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    overflow: hidden;
                    z-index: 2000;
                    border: 1px solid #f0f0f0;
                }

                .suggestion-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 15px;
                    cursor: pointer;
                    transition: background 0.2s;
                    border-bottom: 1px solid #f8f8f8;
                }

                .suggestion-item:last-child {
                    border-bottom: none;
                }

                .suggestion-item:hover {
                    background: #fdfaf0;
                }

                .suggestion-item i {
                    color: var(--primary-color);
                    width: 20px;
                    text-align: center;
                }

                .suggestion-item span {
                    flex: 1;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .suggestion-item small {
                    color: #999;
                    font-size: 0.75rem;
                }

                @media (max-width: 1100px) {
                    .nav-search-wrapper {
                        width: 200px;
                    }
                }
            `}</style>
        </div>
    );
}

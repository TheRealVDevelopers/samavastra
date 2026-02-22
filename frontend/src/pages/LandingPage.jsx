import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import {
    ShoppingCart, Factory, Package, Truck, Receipt, Users, Star, AlertTriangle,
    BarChart3, Settings, ChevronRight, CheckCircle2, XCircle, ArrowRight,
    Menu, X, Zap, Shield, Globe, Award, Phone, Mail, MapPin,
    ClipboardList, Warehouse, CreditCard, UserCheck, TrendingUp, Play, Shirt
} from 'lucide-react';

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */
const NAVY = '#1B2B65';
const NAVY_DARK = '#121D47';
const GOLD = '#F5A623';
const BG = '#F4F6FB';
const WHITE = '#FFFFFF';
const GREY = '#6B7280';
const LIGHT_GREY = '#F9FAFB';

/* ═══════════════════════════════════════════════
   ANIMATION HELPERS
   ═══════════════════════════════════════════════ */
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
};

const fadeLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }
};

const fadeRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }
};

const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
};

function AnimatedSection({ children, className, style }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={stagger}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════
   COUNTER ANIMATION
   ═══════════════════════════════════════════════ */
function AnimatedCounter({ target, suffix = '' }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, target]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════
   SECTION TITLE HELPER
   ═══════════════════════════════════════════════ */
function SectionTitle({ title, subtitle, light = false }) {
    return (
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56, maxWidth: 680, margin: '0 auto 56px' }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: light ? WHITE : NAVY, marginBottom: 16, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                {title}
            </h2>
            {subtitle && (
                <p style={{ fontSize: 17, color: light ? 'rgba(255,255,255,0.7)' : GREY, lineHeight: 1.7, margin: 0 }}>
                    {subtitle}
                </p>
            )}
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function LandingPage() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const goToLogin = () => navigate('/login');

    const scrollTo = (id) => {
        setMobileMenuOpen(false);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    /* ═══════ SECTION 1: NAVBAR ═══════ */
    const Navbar = () => (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
            background: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.3s ease',
            borderBottom: scrolled ? '1px solid #F3F4F6' : 'none',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 72 }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <Shirt size={28} color={GOLD} strokeWidth={2.5} />
                    <span style={{ fontSize: 22, fontWeight: 800, color: NAVY, letterSpacing: '-0.02em' }}>Samavastra</span>
                </div>

                {/* Desktop Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-desktop">
                    {['Features', 'How It Works', 'Departments', 'Contact'].map(link => (
                        <span
                            key={link}
                            onClick={() => scrollTo(link.toLowerCase().replace(/ /g, '-'))}
                            style={{ fontSize: 14, fontWeight: 600, color: GREY, cursor: 'pointer', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = NAVY}
                            onMouseLeave={e => e.target.style.color = GREY}
                        >
                            {link}
                        </span>
                    ))}
                    <button onClick={goToLogin} style={{
                        background: GOLD, color: NAVY, border: 'none', padding: '10px 24px',
                        borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(245,166,35,0.3)',
                    }}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 16px rgba(245,166,35,0.4)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 2px 8px rgba(245,166,35,0.3)'; }}
                    >
                        Get Started
                    </button>
                </div>

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
                    className="nav-mobile-btn"
                >
                    {mobileMenuOpen ? <X size={24} color={NAVY} /> : <Menu size={24} color={NAVY} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: WHITE, padding: '16px 24px 24px', borderTop: '1px solid #F3F4F6' }}
                    className="nav-mobile-menu"
                >
                    {['Features', 'How It Works', 'Departments', 'Contact'].map(link => (
                        <div
                            key={link}
                            onClick={() => scrollTo(link.toLowerCase().replace(/ /g, '-'))}
                            style={{ padding: '12px 0', fontSize: 15, fontWeight: 600, color: NAVY, cursor: 'pointer', borderBottom: '1px solid #F3F4F6' }}
                        >
                            {link}
                        </div>
                    ))}
                    <button onClick={goToLogin} style={{
                        background: GOLD, color: NAVY, border: 'none', padding: '12px 24px', width: '100%', marginTop: 12,
                        borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    }}>
                        Get Started
                    </button>
                </motion.div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
      `}</style>
        </nav>
    );

    /* ═══════ SECTION 2: HERO ═══════ */
    const Hero = () => (
        <section style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 72,
            background: `linear-gradient(135deg, ${NAVY}08 0%, transparent 50%)`,
            backgroundImage: `linear-gradient(135deg, ${NAVY}08 0%, transparent 50%), radial-gradient(circle, #d1d5db 0.5px, transparent 0.5px)`,
            backgroundSize: '100% 100%, 20px 20px',
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap' }}>
                {/* Left */}
                <motion.div style={{ flex: '1 1 480px', minWidth: 320 }} initial="hidden" animate="visible" variants={fadeLeft}>
                    <motion.div variants={fadeUp} style={{
                        display: 'inline-block', background: `${GOLD}20`, color: NAVY,
                        padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                        marginBottom: 24, letterSpacing: '0.02em',
                    }}>
                        🇮🇳 India's Leading Uniform Manufacturing OS
                    </motion.div>

                    <motion.h1 variants={fadeUp} style={{
                        fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: NAVY,
                        lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.03em',
                    }}>
                        The Complete Operating System for{' '}
                        <span style={{ color: GOLD }}>Uniform Manufacturing</span>
                    </motion.h1>

                    <motion.p variants={fadeUp} style={{ fontSize: 18, color: GREY, lineHeight: 1.7, marginBottom: 32, maxWidth: 520 }}>
                        Samavastra connects every department of your uniform business — from school orders to production, inventory, dispatch, and payments — in one powerful platform.
                    </motion.p>

                    <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 36 }}>
                        <button onClick={goToLogin} style={{
                            background: GOLD, color: NAVY, border: 'none', padding: '14px 32px',
                            borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8,
                            boxShadow: '0 4px 16px rgba(245,166,35,0.3)', transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Get Started <ArrowRight size={18} />
                        </button>
                        <button style={{
                            background: 'transparent', color: NAVY, border: `2px solid ${NAVY}`,
                            padding: '12px 28px', borderRadius: 10, fontSize: 16, fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = WHITE; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = NAVY; }}
                        >
                            <Play size={16} /> Watch How It Works
                        </button>
                    </motion.div>

                    <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            '100% Made for Uniform Manufacturers',
                            'Real-time Operations Tracking',
                            'Built for Indian Schools Market',
                        ].map(item => (
                            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: GREY, fontWeight: 500 }}>
                                <CheckCircle2 size={16} color="#22C55E" /> {item}
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Right — Dashboard Mockup */}
                <motion.div
                    style={{ flex: '1 1 480px', minWidth: 320, position: 'relative' }}
                    initial="hidden"
                    animate="visible"
                    variants={fadeRight}
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            background: WHITE, borderRadius: 16, overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(27,43,101,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                        }}
                    >
                        {/* Mock browser bar */}
                        <div style={{ padding: '10px 16px', background: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #E5E7EB' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E' }} />
                            <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>app.samavastra.com</div>
                        </div>
                        <img
                            src="/images/dashboard-mockup.png"
                            alt="Samavastra Dashboard"
                            style={{ width: '100%', display: 'block' }}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );

    /* ═══════ SECTION 3: STATS ═══════ */
    const Stats = () => (
        <section style={{ background: NAVY, padding: '64px 24px' }}>
            <AnimatedSection>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, textAlign: 'center' }}>
                    {[
                        { num: 500, suffix: '+', label: 'Schools Managed' },
                        { num: 1000000, suffix: '+', label: 'Uniforms Produced' },
                        { num: 15, suffix: '+', label: 'Departments Connected' },
                        { num: 99, suffix: '.9%', label: 'Uptime Guaranteed' },
                    ].map((stat, i) => (
                        <motion.div key={i} variants={fadeUp} style={{ position: 'relative' }}>
                            <div style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 800, color: WHITE, marginBottom: 8 }}>
                                <AnimatedCounter target={stat.num} suffix={stat.suffix} />
                            </div>
                            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                {stat.label}
                            </div>
                            {i < 3 && <div style={{ position: 'absolute', right: -20, top: '20%', bottom: '20%', width: 1, background: `${GOLD}30` }} className="stat-divider" />}
                        </motion.div>
                    ))}
                </div>
            </AnimatedSection>
            <style>{`
        @media (max-width: 768px) {
          .stat-divider { display: none !important; }
        }
      `}</style>
        </section>
    );

    /* ═══════ SECTION 4: WHAT IS SAMAVASTRA ═══════ */
    const WhatIs = () => (
        <section style={{ padding: '100px 24px', background: WHITE }}>
            <AnimatedSection>
                <SectionTitle title="Not just software. The backbone of your uniform business." />
                <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 32 }}>
                    {/* Old Way */}
                    <motion.div variants={fadeLeft} style={{
                        background: '#FEF2F2', borderRadius: 20, padding: 36,
                        border: '1px solid #FECACA',
                    }}>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#991B1B', marginBottom: 24 }}>❌ The Old Way</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                'Manual Excel tracking for every order',
                                'WhatsApp-based order management chaos',
                                'No real-time visibility across departments',
                                'Errors and delays in every department',
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <XCircle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                                    <span style={{ fontSize: 15, color: '#374151', lineHeight: 1.5 }}>{item}</span>
                                </div>
                            ))}
                        </div>
                        <img src="/images/hero-uniforms.png" alt="Old way" style={{ width: '100%', borderRadius: 12, marginTop: 24, opacity: 0.7 }} />
                    </motion.div>

                    {/* Samavastra Way */}
                    <motion.div variants={fadeRight} style={{
                        background: `${GOLD}08`, borderRadius: 20, padding: 36,
                        border: `1px solid ${GOLD}30`,
                    }}>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 24 }}>✨ The Samavastra Way</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                'Live order-to-delivery tracking in real time',
                                'Every department connected on one platform',
                                'Instant alerts, approvals, and notifications',
                                'Complete audit trail for every operation',
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <CheckCircle2 size={20} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
                                    <span style={{ fontSize: 15, color: '#374151', lineHeight: 1.5 }}>{item}</span>
                                </div>
                            ))}
                        </div>
                        <img src="/images/production-floor.png" alt="Samavastra way" style={{ width: '100%', borderRadius: 12, marginTop: 24 }} />
                    </motion.div>
                </div>
            </AnimatedSection>
        </section>
    );

    /* ═══════ SECTION 5: FEATURES ═══════ */
    const features = [
        { icon: <ShoppingCart size={24} />, title: 'School Order Management', desc: 'From quotation to confirmed order in minutes. Track every school\'s order history and payment status.', color: '#3B82F6', bg: '#EFF6FF' },
        { icon: <Factory size={24} />, title: 'Production Control', desc: 'Assign jobs, track cutting, stitching, finishing and packing stages in real time on your shop floor.', color: '#8B5CF6', bg: '#F5F3FF' },
        { icon: <Package size={24} />, title: 'Smart Inventory', desc: 'Raw fabric, accessories, finished uniforms — all tracked automatically. Get alerts before stock runs out.', color: '#22C55E', bg: '#F0FDF4' },
        { icon: <ClipboardList size={24} />, title: 'Procurement Automation', desc: 'Low stock triggers purchase requests automatically. Manage suppliers and purchase orders in one place.', color: '#F59E0B', bg: '#FFFBEB' },
        { icon: <Truck size={24} />, title: 'Logistics & Dispatch', desc: 'Plan deliveries, assign couriers, upload proof of delivery. Schools get their orders on time every time.', color: '#EC4899', bg: '#FDF2F8' },
        { icon: <Receipt size={24} />, title: 'Complete Accounts', desc: 'GST invoices, payment tracking, expense management, P&L — all built in for Indian businesses.', color: '#14B8A6', bg: '#F0FDFA' },
    ];

    const Features = () => (
        <section id="features" style={{ padding: '100px 24px', background: LIGHT_GREY }}>
            <AnimatedSection>
                <SectionTitle title="Everything your uniform business needs" subtitle="Six powerful modules that work together seamlessly to run your entire operation." />
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            variants={fadeUp}
                            style={{
                                background: WHITE, borderRadius: 16, padding: 32,
                                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                transition: 'all 0.3s ease', cursor: 'default',
                                border: '1px solid #F3F4F6',
                            }}
                            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(27,43,101,0.1)' }}
                        >
                            <div style={{
                                width: 52, height: 52, borderRadius: 14, background: f.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 20, color: f.color,
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{f.title}</h3>
                            <p style={{ fontSize: 14, color: GREY, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </AnimatedSection>
        </section>
    );

    /* ═══════ SECTION 6: HOW IT WORKS ═══════ */
    const steps = [
        { icon: <ShoppingCart size={20} />, label: 'School Places Order' },
        { icon: <UserCheck size={20} />, label: 'Sales Approves' },
        { icon: <ClipboardList size={20} />, label: 'Job Created' },
        { icon: <Package size={20} />, label: 'Inventory Checked' },
        { icon: <Factory size={20} />, label: 'Production Starts' },
        { icon: <Shield size={20} />, label: 'Quality Verified' },
        { icon: <Truck size={20} />, label: 'Dispatch Scheduled' },
        { icon: <CreditCard size={20} />, label: 'Payment Collected' },
    ];

    const HowItWorks = () => (
        <section id="how-it-works" style={{ padding: '100px 24px', background: WHITE }}>
            <AnimatedSection>
                <SectionTitle title="From school order to delivered uniform — fully automated" subtitle="Eight seamless steps that run your business end to end." />

                {/* Desktop flow */}
                <div style={{ maxWidth: 1100, margin: '0 auto', overflowX: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, minWidth: 900, padding: '20px 0' }} className="flow-desktop">
                        {steps.map((step, i) => (
                            <React.Fragment key={i}>
                                <motion.div
                                    variants={fadeUp}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                                        minWidth: 100, textAlign: 'center',
                                    }}
                                >
                                    <div style={{
                                        width: 56, height: 56, borderRadius: 16, background: i === 0 || i === steps.length - 1 ? GOLD : `${NAVY}08`,
                                        color: i === 0 || i === steps.length - 1 ? NAVY : NAVY,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: 14, position: 'relative',
                                        border: `2px solid ${i === 0 || i === steps.length - 1 ? GOLD : '#E5E7EB'}`,
                                    }}>
                                        <span style={{ position: 'absolute', top: -10, right: -6, fontSize: 10, fontWeight: 800, color: WHITE, background: NAVY, borderRadius: 10, padding: '2px 6px' }}>{i + 1}</span>
                                        {step.icon}
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: NAVY, lineHeight: 1.3, maxWidth: 90 }}>{step.label}</span>
                                </motion.div>
                                {i < steps.length - 1 && (
                                    <ChevronRight size={18} color={GOLD} style={{ flexShrink: 0, margin: '0 4px', marginBottom: 24 }} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Image below flow */}
                <motion.div variants={fadeUp} style={{ maxWidth: 900, margin: '40px auto 0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(27,43,101,0.1)' }}>
                    <img src="/images/school-delivery.png" alt="Delivery process" style={{ width: '100%', display: 'block' }} />
                </motion.div>
            </AnimatedSection>
        </section>
    );

    /* ═══════ SECTION 7: DEPARTMENTS ═══════ */
    const departments = [
        { icon: <ShoppingCart size={24} />, name: 'Sales', desc: 'Manage leads, quotations, and school relationships' },
        { icon: <Factory size={24} />, name: 'Production', desc: 'Track every stage from cutting to packing' },
        { icon: <Warehouse size={24} />, name: 'Inventory', desc: 'Real-time stock of raw materials and finished goods' },
        { icon: <ClipboardList size={24} />, name: 'Procurement', desc: 'Automate purchase requests and supplier management' },
        { icon: <Truck size={24} />, name: 'Logistics', desc: 'Schedule dispatches and track deliveries' },
        { icon: <Receipt size={24} />, name: 'Accounts', desc: 'GST invoices, payments, expenses, and P&L' },
        { icon: <Users size={24} />, name: 'HR', desc: 'Employee records, attendance, and payroll' },
        { icon: <TrendingUp size={24} />, name: 'Management', desc: 'CEO dashboard with real-time metrics and reports' },
    ];

    const Departments = () => (
        <section id="departments" style={{ padding: '100px 24px', background: NAVY_DARK }}>
            <AnimatedSection>
                <SectionTitle title="Built for every team in your company" light />
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                    {departments.map((dept, i) => (
                        <motion.div
                            key={i}
                            variants={fadeUp}
                            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}
                            style={{
                                background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 28,
                                border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.3s',
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            <div style={{ color: GOLD, marginBottom: 16 }}>{dept.icon}</div>
                            <h4 style={{ fontSize: 16, fontWeight: 700, color: WHITE, marginBottom: 6 }}>{dept.name}</h4>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>{dept.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Team image */}
                <motion.div variants={fadeUp} style={{ maxWidth: 800, margin: '48px auto 0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
                    <img src="/images/team-meeting.png" alt="Team collaboration" style={{ width: '100%', display: 'block' }} />
                </motion.div>
            </AnimatedSection>
        </section>
    );

    /* ═══════ SECTION 8: TESTIMONIAL ═══════ */
    const Testimonial = () => (
        <section style={{ padding: '100px 24px', background: WHITE }}>
            <AnimatedSection>
                <SectionTitle title="Trusted by uniform manufacturers across India" />
                <motion.div variants={fadeUp} style={{
                    maxWidth: 700, margin: '0 auto', textAlign: 'center',
                    background: LIGHT_GREY, borderRadius: 24, padding: '48px 40px',
                    position: 'relative',
                }}>
                    <div style={{ fontSize: 64, color: GOLD, lineHeight: 1, marginBottom: 16, fontFamily: 'Georgia, serif' }}>"</div>
                    <p style={{ fontSize: 20, color: '#374151', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 24 }}>
                        Samavastra transformed how we manage our entire uniform production. What used to take days of follow up now happens automatically.
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Operations Manager</p>
                    <p style={{ fontSize: 13, color: GREY, marginBottom: 16 }}>Leading Uniform Manufacturer, Bengaluru</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={18} fill={GOLD} color={GOLD} />)}
                    </div>
                </motion.div>

                {/* Partner logos placeholders */}
                <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
                    {['School Partner 1', 'School Partner 2', 'School Partner 3'].map((p, i) => (
                        <div key={i} style={{
                            padding: '14px 32px', border: '1px solid #E5E7EB', borderRadius: 10,
                            fontSize: 13, color: '#9CA3AF', fontWeight: 600,
                        }}>
                            {p}
                        </div>
                    ))}
                </motion.div>
            </AnimatedSection>
        </section>
    );

    /* ═══════ SECTION 9: CTA ═══════ */
    const CTA = () => (
        <section style={{
            padding: '100px 24px',
            background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 60%, ${NAVY} 100%)`,
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Gold gradient overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(135deg, transparent, ${GOLD}08)` }} />
            <AnimatedSection style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
                <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: WHITE, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.02em' }}>
                    Ready to transform your uniform business?
                </motion.h2>
                <motion.p variants={fadeUp} style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', marginBottom: 36, lineHeight: 1.7 }}>
                    Join the growing number of uniform manufacturers using Samavastra to run their entire operations.
                </motion.p>
                <motion.div variants={fadeUp}>
                    <button onClick={goToLogin} style={{
                        background: GOLD, color: NAVY, border: 'none', padding: '16px 40px',
                        borderRadius: 12, fontSize: 18, fontWeight: 800, cursor: 'pointer',
                        boxShadow: '0 4px 24px rgba(245,166,35,0.4)', transition: 'all 0.2s',
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Get Started Today <ArrowRight size={20} />
                    </button>
                </motion.div>
                <motion.p variants={fadeUp} style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
                    No setup fees. Built specifically for your business.
                </motion.p>
            </AnimatedSection>
        </section>
    );

    /* ═══════ SECTION 10: FOOTER ═══════ */
    const Footer = () => (
        <footer id="contact" style={{ background: NAVY_DARK, padding: '64px 24px 0' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, paddingBottom: 48 }}>
                {/* Col 1 */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Shirt size={24} color={GOLD} />
                        <span style={{ fontSize: 20, fontWeight: 800, color: WHITE }}>Samavastra</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                        Uniform Manufacturing Control System. Built for Indian uniform manufacturers who want complete operational control.
                    </p>
                </div>

                {/* Col 2 */}
                <div>
                    <h4 style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>Product</h4>
                    {['Features', 'How It Works', 'Departments', 'Pricing'].map(l => (
                        <div key={l} style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', padding: '6px 0', cursor: 'pointer', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = WHITE}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                        >
                            {l}
                        </div>
                    ))}
                </div>

                {/* Col 3 */}
                <div>
                    <h4 style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>Company</h4>
                    {['About', 'Contact', 'Privacy Policy', 'Terms of Service'].map(l => (
                        <div key={l} style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', padding: '6px 0', cursor: 'pointer', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = WHITE}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                        >
                            {l}
                        </div>
                    ))}
                </div>

                {/* Col 4 */}
                <div>
                    <h4 style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>Contact</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                            <Mail size={16} color={GOLD} /> hello@samavastra.com
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                            <Phone size={16} color={GOLD} /> +91 98765 43210
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                            <MapPin size={16} color={GOLD} /> Bengaluru, India
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div style={{ borderTop: `1px solid ${GOLD}20`, padding: '20px 0', textAlign: 'center', maxWidth: 1100, margin: '0 auto' }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                    © 2026 Samavastra. All rights reserved. Crafted for uniform manufacturers.
                </p>
            </div>
        </footer>
    );

    /* ═══════ RENDER ═══════ */
    return (
        <div style={{ overflowX: 'hidden' }}>
            <Navbar />
            <Hero />
            <Stats />
            <WhatIs />
            <Features />
            <HowItWorks />
            <Departments />
            <Testimonial />
            <CTA />
            <Footer />
        </div>
    );
}

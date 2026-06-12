/**
 * About Page - Creator Profile
 * 
 * Premium creator profile page inspired by GameVault's about section.
 * Features:
 * - Hero section with avatar and bio
 * - Tech stack showcase with animated cards
 * - Project stats and metrics
 * - Social links
 * - Timeline of project development
 * - Fully translated (EN/ES)
 * - Dark/Light mode compatible
 */

import { motion } from 'framer-motion';
import {
  Code2,
  Palette,
  Server,
  Database,
  Zap,
  Globe,
  Mail,
  ExternalLink,
  Award,
  BookOpen,
  Sparkles,
  Cpu,
  Layers,
  Shield,
  User,
  GitBranch,
  MessageCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { t, type TranslationKey } from '@/constants/translations';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const techStack = [
  { name: 'React', icon: Code2, color: '#61DAFB', category: 'frontend' as const },
  { name: 'TypeScript', icon: Shield, color: '#3178C6', category: 'frontend' as const },
  { name: 'Angular', icon: Code2, color: '#DD0031', category: 'frontend' as const },
  { name: 'Python', icon: Code2, color: '#3776AB', category: 'backend' as const },
  { name: 'C# .NET', icon: Server, color: '#512BD4', category: 'backend' as const },
  { name: 'PHP/Laravel', icon: Server, color: '#FF2D20', category: 'backend' as const },
  { name: 'Java', icon: Cpu, color: '#ED8B00', category: 'backend' as const },
  { name: 'Node.js', icon: Server, color: '#339933', category: 'backend' as const },
  { name: 'Azure', icon: Database, color: '#0078D4', category: 'cloud' as const },
  { name: 'AWS', icon: Database, color: '#FF9900', category: 'cloud' as const },
  { name: 'SQL Server', icon: Database, color: '#CC2927', category: 'database' as const },
  { name: 'MongoDB', icon: Database, color: '#47A248', category: 'database' as const },
  { name: 'React Native', icon: Zap, color: '#61DAFB', category: 'mobile' as const },
  { name: 'Microservices', icon: Layers, color: '#00BCD4', category: 'architecture' as const },
  { name: 'AI & Automation', icon: Cpu, color: '#9C27B0', category: 'ai' as const },
  { name: 'DevOps/CI/CD', icon: Zap, color: '#FF6C37', category: 'devops' as const },
];

const projectStats = [
  { label: 'about.experience', value: '18+' },
  { label: 'about.projects', value: '50+' },
  { label: 'about.technologies', value: '20+' },
  { label: 'about.industries', value: '5' },
  { label: 'about.countries', value: '4' },
  { label: 'about.certifications', value: '6' },
];

const achievements = [
  {
    icon: Award,
    title: 'about.ach1Title',
    desc: 'about.ach1Desc',
  },
  {
    icon: Sparkles,
    title: 'about.ach2Title',
    desc: 'about.ach2Desc',
  },
  {
    icon: BookOpen,
    title: 'about.ach3Title',
    desc: 'about.ach3Desc',
  },
];

const timeline = [
  { year: '2025', event: 'about.tl1', company: 'VOPM' },
  { year: '2024', event: 'about.tl2', company: 'MIO S.A.S.' },
  { year: '2022', event: 'about.tl3', company: 'Banco Ademi' },
  { year: '2019', event: 'about.tl4', company: 'SICPA Dominicana' },
  { year: '2014', event: 'about.tl5', company: 'Telconet S.A.' },
  { year: '2012', event: 'about.tl6', company: 'Kantar Health Spain' },
];

export function AboutPage() {
  const { language } = useAppStore();

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12 relative overflow-hidden"
      >
        <div className="animated-gradient absolute inset-0" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative flex-shrink-0"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-[#ff4d6d] to-[#d946ef] p-[3px] shadow-xl shadow-[#ff4d6d]/20">
              <div className="w-full h-full rounded-2xl bg-dark-card flex items-center justify-center overflow-hidden">
                <img
                  src="/public/avatar.png"
                  alt="Robinson Salgado"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success border-4 border-dark-card flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-black tracking-tight"
            >
              <span className="gradient-text">Robinson Salgado</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg gradient-text font-semibold mt-1"
            >
              {t('about.role', language)}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-text-secondary mt-3 max-w-lg leading-relaxed"
            >
              {t('about.bio', language)}
            </motion.p>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center md:justify-start gap-3 mt-5"
            >
              {[
                { icon: GitBranch, href: 'https://github.com/rsalgado85', label: 'GitHub' },
                { icon: Globe, href: 'https://www.linkedin.com/in/robinsonsalgado', label: 'LinkedIn' },
                { icon: MessageCircle, href: 'https://twitter.com/rsalgado85', label: 'Twitter' },
                { icon: Mail, href: 'mailto:rsalgado85@gmail.com', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-glass hover:bg-glass-hover border border-glass-border transition-all hover:scale-110 hover:border-accent/30"
                  aria-label={label}
                >
                  <Icon size={18} className="text-text-secondary hover:text-accent-light transition-colors" />
                </a>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Project Stats */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {projectStats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeInUp}
            className="glass-card p-4 text-center hover:border-accent/20 transition-all"
          >
            <p className="text-2xl font-bold gradient-text">{stat.value}</p>
            <p className="text-[10px] text-text-secondary mt-1 uppercase tracking-wider">
              {t(stat.label as TranslationKey, language)}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 md:p-8"
      >
        <h2 className="text-xl font-bold mb-2">{t('about.techStack', language)}</h2>
        <p className="text-text-secondary text-sm mb-6">{t('about.techStackDesc', language)}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {techStack.map((tech) => (
            <motion.div
              key={tech.name}
              whileHover={{ scale: 1.05, y: -4 }}
              className="glass-card-hover p-3 flex flex-col items-center gap-2 cursor-default"
            >
              <tech.icon size={24} style={{ color: tech.color }} />
              <span className="text-xs font-medium text-center">{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-bold mb-4">{t('about.achievements', language)}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((ach, i) => (
            <motion.div
              key={ach.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="glass-card p-5 hover:border-accent/20 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                <ach.icon size={20} className="text-accent-light" />
              </div>
              <h3 className="font-semibold text-sm">{t(ach.title as TranslationKey, language)}</h3>
              <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                {t(ach.desc as TranslationKey, language)}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 md:p-8"
      >
        <h2 className="text-xl font-bold mb-2">{t('about.timeline', language)}</h2>
        <p className="text-text-secondary text-sm mb-6">{t('about.timelineDesc', language)}</p>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#ff4d6d] via-[#d946ef] to-transparent" />

          <div className="space-y-6">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="relative pl-10"
              >
                {/* Dot */}
                <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#d946ef] shadow-lg shadow-[#ff4d6d]/30" />
                
                <div className="glass-card p-4">
                  <span className="text-xs font-bold gradient-text">{item.year}</span>
                  <p className="text-sm text-text-primary mt-1">
                    {t(item.event as TranslationKey, language)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Footer Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <p className="text-text-secondary text-sm italic">
          &ldquo;{t('about.quote', language)}&rdquo;
        </p>
        <p className="text-xs text-text-secondary/50 mt-2">
          {t('about.quoteAuthor', language)}
        </p>
      </motion.div>
    </div>
  );
}

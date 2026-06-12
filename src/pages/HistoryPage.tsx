/**
 * HistoryPage - Pokémon History Timeline
 *
 * Interactive timeline showcasing the history of Pokémon from its inception
 * to the present day. Features:
 * - Chronological timeline with key milestones
 * - Images, maps, and curiosities
 * - Generation-by-generation breakdown
 * - Avant-garde visual design
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { ChevronDown, ChevronUp, MapPin, Sparkles, Gamepad2, Globe, BookOpen, Star, Award, Zap } from 'lucide-react';

interface TimelineEvent {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  image?: string;
  facts: string[];
  type: 'milestone' | 'generation' | 'curiosity';
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: '1989',
    title: 'The Birth of an Idea',
    subtitle: 'Satoshi Tajiri conceives Pokémon',
    description: 'Satoshi Tajiri, a video game designer fascinated by insect collecting as a child, conceptualizes a game about creatures that can be collected and traded. The idea is inspired by his childhood hobby of collecting insects in the rural areas around Tokyo, combined with his love for the Game Boy link cable that allowed players to connect their devices.',
    icon: <Sparkles size={20} />,
    color: '#ff4d6d',
    facts: [
      'Tajiri founded Game Freak in 1989 with a small team',
      'The name "Pokémon" comes from "Pocket Monsters" (ポケットモンスター)',
      'Initially, Tajiri struggled to find a publisher for his idea',
      'The concept was considered too niche by many publishers',
    ],
    type: 'milestone',
  },
  {
    year: '1996',
    title: 'Pokémon Red & Green',
    subtitle: 'The Phenomenon Begins (Japan)',
    description: 'Pokémon Red and Green Versions launch in Japan for the Game Boy. The games introduce 151 Pokémon in the Kanto region. Players take on the role of a young Trainer on a quest to become the Pokémon Champion by defeating Gym Leaders and the Elite Four, while also trying to complete the Pokédex by catching all Pokémon.',
    icon: <Gamepad2 size={20} />,
    color: '#e17055',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
    facts: [
      'Original Japanese versions: Red, Green, and later Blue',
      'Only 151 Pokémon in the first generation (Kanto)',
      'The games sold over 10 million copies in Japan alone',
      'Mew was a secret Pokémon, only obtainable through Nintendo events',
      'The MissingNo. glitch became one of gaming\'s most famous bugs',
    ],
    type: 'generation',
  },
  {
    year: '1998',
    title: 'Pokémon Red & Blue',
    subtitle: 'Global Takeover',
    description: 'Pokémon explodes worldwide with the international release of Red and Blue versions. The anime series debuts, introducing millions to Ash Ketchum and his Pikachu. The Pokémon Trading Card Game launches, becoming a global phenomenon. Pokémon becomes a multi-billion dollar franchise spanning games, anime, movies, toys, and more.',
    icon: <Globe size={20} />,
    color: '#6c5ce7',
    facts: [
      'Pokémon Red & Blue sold over 31 million copies worldwide',
      'The anime debuted in the US in September 1998',
      'Pikachu became the most recognizable Pokémon globally',
      'The "Pokémania" craze swept across schools worldwide',
      'Pokémon: The First Movie grossed over $163 million globally',
    ],
    type: 'milestone',
  },
  {
    year: '1999',
    title: 'Pokémon Gold & Silver',
    subtitle: 'Generation II - Johto Region',
    description: 'The second generation introduces 100 new Pokémon, the Johto region, breeding mechanics, held items, the PokéGear, and a day/night cycle. Most notably, after completing the Johto region, players can return to Kanto, effectively giving players two regions to explore. This remains one of the most beloved features in Pokémon history.',
    icon: <Gamepad2 size={20} />,
    color: '#fdcb6e',
    facts: [
      'Introduced 100 new Pokémon (total: 251)',
      'First games with a real-time clock and day/night cycle',
      'Players could explore both Johto AND Kanto regions',
      'Introduced breeding, shiny Pokémon, and held items',
      'Considered by many fans as the best Pokémon games ever',
    ],
    type: 'generation',
  },
  {
    year: '2002',
    title: 'Pokémon Ruby & Sapphire',
    subtitle: 'Generation III - Hoenn Region',
    description: 'The third generation moves to the Game Boy Advance with Ruby and Sapphire. Set in the Hoenn region, these games introduce 135 new Pokémon, double battles, abilities, natures, and Pokémon Contests. The graphics see a massive upgrade, and the games introduce weather conditions that affect battles.',
    icon: <Gamepad2 size={20} />,
    color: '#00b894',
    facts: [
      'Introduced 135 new Pokémon (total: 386)',
      'First games on Game Boy Advance with enhanced graphics',
      'Introduced Abilities and Natures - core mechanics ever since',
      'Double Battles debuted, becoming a staple in competitive play',
      'Pokémon Contests offered an alternative to battling',
    ],
    type: 'generation',
  },
  {
    year: '2004',
    title: 'Pokémon FireRed & LeafGreen',
    subtitle: 'Kanto Returns',
    description: 'Faithful remakes of the original Red and Green versions, rebuilt from the ground up for the Game Boy Advance. These remakes include all the mechanical improvements of Generation III while preserving the classic Kanto adventure. The Sevii Islands post-game content adds new areas to explore.',
    icon: <Star size={20} />,
    color: '#e17055',
    facts: [
      'First remakes in the Pokémon series',
      'Included the Sevii Islands as new post-game content',
      'Wireless adapter supported for trading and battling',
      'Set the standard for future Pokémon remakes',
    ],
    type: 'milestone',
  },
  {
    year: '2006',
    title: 'Pokémon Diamond & Pearl',
    subtitle: 'Generation IV - Sinnoh Region',
    description: 'The fourth generation arrives on the Nintendo DS, introducing 107 new Pokémon, the Sinnoh region, online trading and battling via Nintendo Wi-Fi Connection, the Global Trade Station (GTS), and a physical/special move split that revolutionized competitive battling.',
    icon: <Gamepad2 size={20} />,
    color: '#74b9ff',
    facts: [
      'Introduced 107 new Pokémon (total: 493)',
      'First Pokémon games with online play via Nintendo Wi-Fi',
      'The physical/special split changed competitive battling forever',
      'Introduced the Global Trade Station (GTS)',
      'Platinum version added the Distortion World',
    ],
    type: 'generation',
  },
  {
    year: '2010',
    title: 'Pokémon Black & White',
    subtitle: 'Generation V - Unova Region',
    description: 'The fifth generation takes players to the Unova region, inspired by New York City. These games feature 156 new Pokémon - the largest number of new Pokémon introduced in any generation. The games feature fully animated sprites, seasons that change monthly, and a deeper narrative about the ethics of Pokémon training.',
    icon: <Gamepad2 size={20} />,
    color: '#a29bfe',
    facts: [
      'Introduced 156 new Pokémon (total: 649) - the most ever',
      'First games with fully animated Pokémon sprites in battle',
      'Seasonal system that changed the environment monthly',
      'Deeper story exploring the ethics of Pokémon training',
      'Black 2 & White 2 were direct sequels, not third versions',
    ],
    type: 'generation',
  },
  {
    year: '2013',
    title: 'Pokémon X & Y',
    subtitle: 'Generation VI - Kalos Region',
    description: 'The sixth generation marks Pokémon\'s transition to 3D on the Nintendo 3DS. Set in the Kalos region (inspired by France), these games introduce 72 new Pokémon, Mega Evolution, Fairy type, character customization, and the Player Search System (PSS) for online interaction.',
    icon: <Gamepad2 size={20} />,
    color: '#fd79a8',
    facts: [
      'Introduced 72 new Pokémon (total: 721)',
      'First main series games in full 3D',
      'Mega Evolution - a temporary evolution mechanic',
      'Fairy type added to balance Dragon-type dominance',
      'First games with character customization',
    ],
    type: 'generation',
  },
  {
    year: '2016',
    title: 'Pokémon GO',
    subtitle: 'Augmented Reality Revolution',
    description: 'Niantic and The Pokémon Company release Pokémon GO, a mobile augmented reality game that becomes a global phenomenon. Players explore the real world to find and catch Pokémon, battle in Gyms, and participate in Raid Battles. The game revitalizes the franchise and brings Pokémon to a new generation of fans.',
    icon: <MapPin size={20} />,
    color: '#00b894',
    facts: [
      'Over 1 billion downloads worldwide',
      'Generated over $6 billion in revenue by 2023',
      'Broke records for most downloaded mobile game in its first month',
      'Encouraged physical activity and exploration',
      'Introduced AR technology to mainstream gaming',
    ],
    type: 'milestone',
  },
  {
    year: '2016',
    title: 'Pokémon Sun & Moon',
    subtitle: 'Generation VII - Alola Region',
    description: 'The seventh generation takes place in the Alola region, inspired by Hawaii. These games replace traditional Gyms with Island Trials and introduce 88 new Pokémon, Z-Moves, regional variants (Alolan Forms), and the Rotom Pokédex. The games also feature a more story-driven approach.',
    icon: <Gamepad2 size={20} />,
    color: '#fdcb6e',
    facts: [
      'Introduced 88 new Pokémon (total: 809)',
      'Replaced Gyms with Island Trials - a major departure',
      'Introduced regional variants (Alolan Forms)',
      'Z-Moves: powerful one-time attacks',
      'Ultra Sun & Ultra Moon expanded the story significantly',
    ],
    type: 'generation',
  },
  {
    year: '2018',
    title: 'Pokémon: Let\'s Go!',
    subtitle: 'Kanto Reimagined',
    description: 'Pokémon: Let\'s Go, Pikachu! and Let\'s Go, Eevee! reimagine the original Kanto adventure for Nintendo Switch. These games bridge the gap between main series and Pokémon GO, featuring simplified catching mechanics, co-op play, and connectivity with Pokémon GO.',
    icon: <Star size={20} />,
    color: '#e17055',
    facts: [
      'First main series Pokémon games on Nintendo Switch',
      'Integrated Pokémon GO catching mechanics',
      'Supported co-op multiplayer',
      'Pokémon visible in the overworld (no random encounters)',
      'Could transfer Pokémon from Pokémon GO',
    ],
    type: 'milestone',
  },
  {
    year: '2019',
    title: 'Pokémon Sword & Shield',
    subtitle: 'Generation VIII - Galar Region',
    description: 'The eighth generation brings Pokémon to home consoles with Sword and Shield on Nintendo Switch. Set in the Galar region (inspired by the UK), these games introduce 96 new Pokémon, Dynamax and Gigantamax mechanics, the Wild Area (an open-world zone), and a focus on Pokémon battles as a spectator sport.',
    icon: <Gamepad2 size={20} />,
    color: '#6c5ce7',
    facts: [
      'Introduced 96 new Pokémon (total: 905)',
      'First main series games on home console (Switch)',
      'Wild Area: first open-world zone in Pokémon history',
      'Dynamax/Gigantamax: giant Pokémon transformations',
      'The Isle of Armor & Crown Tundra DLC expanded the game',
    ],
    type: 'generation',
  },
  {
    year: '2022',
    title: 'Pokémon Legends: Arceus',
    subtitle: 'A Bold New Direction',
    description: 'Pokémon Legends: Arceus revolutionizes the Pokémon formula by setting the game in the feudal Hisui region (ancient Sinnoh). Players explore a fully open world, complete research tasks for the first Pokédex, and experience a new action-oriented battle system. The game is praised for its fresh take on the franchise.',
    icon: <Award size={20} />,
    color: '#00cec9',
    facts: [
      'Set in the past, before modern Pokémon technology',
      'Fully open-world exploration',
      'Action-oriented battle system (no random encounters)',
      'Pokémon can be caught without battling',
      'Considered one of the best Pokémon games in years',
    ],
    type: 'generation',
  },
  {
    year: '2022',
    title: 'Pokémon Scarlet & Violet',
    subtitle: 'Generation IX - Paldea Region',
    description: 'The ninth generation delivers the first fully open-world Pokémon RPG. Set in the Paldea region (inspired by Spain), these games introduce 120+ new Pokémon, Terastallization, three separate story paths, and seamless multiplayer exploration with up to 4 players.',
    icon: <Gamepad2 size={20} />,
    color: '#ff4d6d',
    facts: [
      'Introduced 120+ new Pokémon (total: 1025+)',
      'First fully open-world Pokémon RPG',
      'Three separate story paths to complete',
      'Terastallization changes Pokémon types mid-battle',
      'Seamless co-op multiplayer exploration',
    ],
    type: 'generation',
  },
  {
    year: '2023',
    title: 'Pokémon: The Hidden Treasure of Area Zero',
    subtitle: 'Paldea Expansion',
    description: 'The Pokémon Scarlet & Violet DLC expands the Paldea region with The Teal Mask (Kitakami region, inspired by rural Japan) and The Indigo Disk (Blueberry Academy, an underwater terrarium). These expansions add new Pokémon, characters, and the return of every starter Pokémon from previous generations.',
    icon: <Sparkles size={20} />,
    color: '#a29bfe',
    facts: [
      'Two DLC parts: The Teal Mask and The Indigo Disk',
      'Kitakami region inspired by Japanese folklore',
      'Blueberry Academy features an underwater terrarium',
      'Every starter Pokémon from all 9 generations is obtainable',
      'Synchro Machine lets players explore as their Pokémon',
    ],
    type: 'milestone',
  },
  {
    year: '2024',
    title: 'Pokémon TCG Pocket',
    subtitle: 'Digital Card Revolution',
    description: 'The Pokémon Trading Card Game goes digital with Pokémon TCG Pocket, a mobile app that lets players collect and battle with digital cards. The app features immersive card art, quick battles, and daily booster pack openings, bringing the joy of card collecting to millions of smartphones worldwide.',
    icon: <BookOpen size={20} />,
    color: '#fdcb6e',
    facts: [
      'Over 100 million downloads in its first months',
      'Features immersive card art with 3D animations',
      'Quick 15-minute battles perfect for mobile',
      'Daily free booster pack openings',
      'Regular events and new card expansions',
    ],
    type: 'milestone',
  },
  {
    year: '2025',
    title: 'Pokémon Champions',
    subtitle: 'Competitive Battling Evolved',
    description: 'The Pokémon Company announces Pokémon Champions, a new competitive battling platform that connects Pokémon HOME, Pokémon GO, and the main series games. This cross-platform service allows trainers from all games to battle each other in real-time competitive matches.',
    icon: <Zap size={20} />,
    color: '#74b9ff',
    facts: [
      'Cross-platform competitive battling',
      'Connects Pokémon HOME, GO, and main series',
      'Real-time competitive matchmaking',
      'New ranking and tournament systems',
      'Bridges the gap between mobile and console players',
    ],
    type: 'milestone',
  },
];

export function HistoryPage() {
  const { theme, language } = useAppStore();
  const isDark = theme === 'dark';
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold gradient-text">Pokémon History</h1>
        <p className="text-text-secondary">
          Explore the complete history of Pokémon — from Satoshi Tajiri's childhood dream to a global phenomenon spanning generations
        </p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: 'Years of History', value: `${new Date().getFullYear() - 1989}+`, color: '#ff4d6d' },
          { label: 'Generations', value: '9', color: '#6c5ce7' },
          { label: 'Pokémon Created', value: '1025+', color: '#00b894' },
          { label: 'Games Released', value: '40+', color: '#fdcb6e' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="rounded-2xl p-4 text-center"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            }}
          >
            <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs font-medium mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div
          className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
          style={{
            background: `linear-gradient(to bottom, #ff4d6d, #d946ef, #6c5ce7, #74b9ff, #00b894, #fdcb6e, #ff4d6d)`,
            opacity: 0.3,
          }}
        />

        <div className="space-y-4">
          {TIMELINE_EVENTS.map((event, index) => {
            const isLeft = index % 2 === 0;
            const isExpanded = expandedIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`relative flex flex-col md:flex-row items-start gap-6 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full -translate-x-1/2 z-10 mt-6"
                  style={{
                    backgroundColor: event.color,
                    boxShadow: `0 0 12px ${event.color}66, 0 0 24px ${event.color}33`,
                  }}
                />

                {/* Content Card */}
                <div className={`w-full md:w-[calc(50%-2rem)] ml-12 md:ml-0 ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                  <motion.div
                    className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                      border: `1px solid ${isExpanded ? `${event.color}44` : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      boxShadow: isExpanded
                        ? `0 8px 32px ${event.color}22`
                        : isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.04)',
                    }}
                    onClick={() => toggleExpand(index)}
                  >
                    {/* Header */}
                    <div className="p-5 flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: `${event.color}22`,
                          color: event.color,
                        }}
                      >
                        {event.icon}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
                            style={{
                              backgroundColor: event.color,
                              color: '#ffffff',
                            }}
                          >
                            {event.year}
                          </span>
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wider"
                            style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }}
                          >
                            {event.type === 'generation' ? 'New Generation' : event.type === 'milestone' ? 'Milestone' : 'Curiosity'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold" style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}>
                          {event.title}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>
                          {event.subtitle}
                        </p>
                      </div>

                      {/* Expand Icon */}
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                        }}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="px-5 pb-5 space-y-4"
                            style={{
                              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                            }}
                          >
                            {/* Image Placeholder */}
                            {event.image && (
                              <div className="mt-4 rounded-xl overflow-hidden">
                                <img
                                  src={event.image}
                                  alt={event.title}
                                  className="w-full h-32 object-contain p-4"
                                  style={{
                                    backgroundColor: `${event.color}11`,
                                  }}
                                />
                              </div>
                            )}

                            {/* Description */}
                            <p
                              className="text-sm leading-relaxed"
                              style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}
                            >
                              {event.description}
                            </p>

                            {/* Fun Facts */}
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: event.color }}>
                                ✦ Fun Facts
                              </h4>
                              <ul className="space-y-1.5">
                                {event.facts.map((fact, fi) => (
                                  <li
                                    key={fi}
                                    className="flex items-start gap-2 text-xs"
                                    style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
                                  >
                                    <span style={{ color: event.color }}>✦</span>
                                    {fact}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8"
      >
        <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }}>
          Pokémon is a trademark of Nintendo, Game Freak, and The Pokémon Company.
        </p>
        <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }}>
          This timeline is a fan-made tribute. Data sourced from Bulbapedia and official Pokémon sources.
        </p>
      </motion.div>
    </div>
  );
}

/**
 * Generation Distribution Chart
 * 
 * Bar chart showing the distribution of Pokémon across generations.
 * Uses Chart.js for better performance with large datasets.
 * Features:
 * - Toggle show/hide values
 * - Click on bars to open modal with Pokémon list
 */

import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getGenerationDisplayName } from '@/services/generation.service';
import { PokemonListModal } from '@/components/common/PokemonListModal';
import { useAllPokemon } from '@/hooks/usePokemon';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface GenerationData {
  generationId: number;
  count: number;
}

interface GenerationDistributionChartProps {
  data: GenerationData[];
  height?: number;
}

const GENERATION_COLORS = [
  '#6c5ce7', '#a29bfe', '#74b9ff', '#00b894', '#00cec9',
  '#fdcb6e', '#e17055', '#d63031', '#fd79a8', '#e84393',
  '#636e72', '#b2bec3',
];

function getGenerationIdFromPokemonId(pokemonId: number): number {
  if (pokemonId <= 151) return 1;
  if (pokemonId <= 251) return 2;
  if (pokemonId <= 386) return 3;
  if (pokemonId <= 493) return 4;
  if (pokemonId <= 649) return 5;
  if (pokemonId <= 721) return 6;
  if (pokemonId <= 809) return 7;
  if (pokemonId <= 898) return 8;
  if (pokemonId <= 1010) return 9;
  return 10;
}

export function GenerationDistributionChart({ data, height = 400 }: GenerationDistributionChartProps) {
  const [showValues, setShowValues] = useState(false);
  const [selectedGen, setSelectedGen] = useState<number | null>(null);
  const { data: allPokemon } = useAllPokemon();

  const pokemonByGen = useMemo(() => {
    if (selectedGen === null || !allPokemon) return [];
    return allPokemon.filter((p) => getGenerationIdFromPokemonId(p.id) === selectedGen);
  }, [selectedGen, allPokemon]);

  const sortedData = useMemo(() => 
    [...data].sort((a, b) => a.generationId - b.generationId),
  [data]);

  const chartData = useMemo(() => ({
    labels: sortedData.map((d) => getGenerationDisplayName(d.generationId)),
    datasets: [
      {
        label: 'Pokémon',
        data: sortedData.map((d) => d.count),
        backgroundColor: sortedData.map((_, i) => GENERATION_COLORS[i % GENERATION_COLORS.length]),
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }), [sortedData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const genId = sortedData[index]?.generationId;
        if (genId) setSelectedGen(genId);
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#13131a',
        borderColor: '#1e1e2a',
        borderWidth: 1,
        titleColor: '#e8e8ed',
        bodyColor: '#8b8b9e',
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context: any) => {
            const label = showValues
              ? `${context.parsed.y} Pokémon`
              : `${context.parsed.y} Pokémon`;
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#8b8b9e',
          font: { size: 10 },
          maxRotation: 45,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#8b8b9e',
          font: { size: 11 },
          precision: 0,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <>
      <div className="relative" style={{ height }}>
        {/* Toggle values button */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowValues(!showValues); }}
          className="absolute top-2 right-2 z-10 px-2 py-1 rounded-lg text-[10px] font-medium transition-all"
          style={{
            backgroundColor: showValues ? 'rgba(108,92,231,0.2)' : 'rgba(255,255,255,0.05)',
            color: showValues ? '#a29bfe' : 'rgba(255,255,255,0.5)',
            border: `1px solid ${showValues ? 'rgba(108,92,231,0.3)' : 'rgba(255,255,255,0.06)'}`,
          }}
        >
          {showValues ? 'Hide Values' : 'Show Values'}
        </button>
        <Bar data={chartData} options={options} />
      </div>

      {/* Modal with Pokémon list for selected generation */}
      <PokemonListModal
        isOpen={selectedGen !== null}
        onClose={() => setSelectedGen(null)}
        title={`${selectedGen ? getGenerationDisplayName(selectedGen) : ''} Pokémon`}
        pokemon={pokemonByGen}
      />
    </>
  );
}

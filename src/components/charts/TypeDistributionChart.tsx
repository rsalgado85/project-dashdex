/**
 * Type Distribution Chart
 * 
 * Pie/Donut chart showing the distribution of Pokémon types.
 * Uses Chart.js via react-chartjs-2 for better performance with large datasets.
 * Features:
 * - Toggle show/hide values
 * - Click on segments to open modal with Pokémon list
 * - Type icons in legend and tooltip
 */

import { useMemo, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { TYPE_COLORS } from '@/constants';
import { PokemonListModal } from '@/components/common/PokemonListModal';
import { useAllPokemon } from '@/hooks/usePokemon';
import { getTypeIcon } from '@/constants/typeIcons';
import type { TypeDistribution } from '@/types/pokemon';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface TypeDistributionChartProps {
  data: TypeDistribution[];
  height?: number;
}

export function TypeDistributionChart({ data, height = 400 }: TypeDistributionChartProps) {
  const [showValues, setShowValues] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { data: allPokemon } = useAllPokemon();

  const pokemonByType = useMemo(() => {
    if (!selectedType || !allPokemon) return [];
    return allPokemon.filter((p) =>
      p.types.some((t) => t.type.name === selectedType)
    );
  }, [selectedType, allPokemon]);

  const chartData = useMemo(() => ({
    labels: data.map((d) => d.name.charAt(0).toUpperCase() + d.name.slice(1)),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((d) => TYPE_COLORS[d.name] || '#666'),
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  }), [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const typeName = data[index]?.name;
        if (typeName) setSelectedType(typeName);
      }
    },
    plugins: {
      legend: {
        display: false, // Hide default legend, use custom React legend below
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
            const item = data[context.dataIndex];
            const label = showValues
              ? `${item.count} Pokémon (${item.percentage.toFixed(1)}%)`
              : `${item.count} Pokémon`;
            return label;
          },
          labelTextColor: (context: any) => {
            const typeName = data[context.dataIndex]?.name;
            return TYPE_COLORS[typeName] || '#fff';
          },
        },
      },
    },
    cutout: '55%',
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
        <Pie data={chartData} options={options as any} />
      </div>

      {/* Custom Legend with Type Icons */}
      <div className="flex flex-wrap gap-1.5 justify-center px-2 pt-3 pb-1">
        {data.map((item) => {
          const TypeIcon = getTypeIcon(item.name);
          const color = TYPE_COLORS[item.name] || '#666';
          return (
            <button
              key={item.name}
              onClick={() => setSelectedType(item.name)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: `${color}15`,
                border: `1px solid ${color}30`,
                color: '#e8e8ed',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${color}25`; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${color}15`; }}
              title={`Click to view ${item.name} type Pokémon`}
            >
              <TypeIcon size={12} />
              <span>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</span>
              <span style={{ color, fontWeight: 700, fontSize: 9 }}>{item.count}</span>
            </button>
          );
        })}
      </div>

      {/* Modal with Pokémon list for selected type */}
      <PokemonListModal
        isOpen={selectedType !== null}
        onClose={() => setSelectedType(null)}
        title={`${selectedType ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1) : ''} Type Pokémon`}
        pokemon={pokemonByType}
      />
    </>
  );
}

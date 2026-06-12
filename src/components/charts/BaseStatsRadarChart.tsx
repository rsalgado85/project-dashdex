/**
 * Base Stats Radar Chart
 * 
 * Radar chart showing base stats (HP, Attack, Defense, Sp. Attack, Sp. Defense, Speed)
 * for one or more Pokémon. Supports comparing up to 4 Pokémon in a single chart.
 */

import { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { STAT_NAMES } from '@/constants';
import type { PokemonWithStats } from '@/types/pokemon';

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface BaseStatsRadarChartProps {
  pokemon: PokemonWithStats[];
  height?: number;
}

const COMPARISON_COLORS = [
  { bg: 'rgba(108, 92, 231, 0.2)', border: '#6c5ce7', point: '#6c5ce7' },
  { bg: 'rgba(0, 184, 148, 0.2)', border: '#00b894', point: '#00b894' },
  { bg: 'rgba(253, 203, 110, 0.2)', border: '#fdcb6e', point: '#fdcb6e' },
  { bg: 'rgba(225, 112, 85, 0.2)', border: '#e17055', point: '#e17055' },
];

export function BaseStatsRadarChart({ pokemon, height = 400 }: BaseStatsRadarChartProps) {
  const statLabels = useMemo(() => 
    Object.values(STAT_NAMES),
  []);

  const chartData = useMemo(() => {
    const statKeys = Object.keys(STAT_NAMES);

    return {
      labels: statLabels,
      datasets: pokemon.slice(0, 4).map((p, index) => {
        const color = COMPARISON_COLORS[index % COMPARISON_COLORS.length];
        return {
          label: p.name.charAt(0).toUpperCase() + p.name.slice(1),
          data: statKeys.map((key) => {
            const stat = p.stats.find((s) => s.stat.name === key);
            return stat ? stat.base_stat : 0;
          }),
          backgroundColor: color.bg,
          borderColor: color.border,
          pointBackgroundColor: color.point,
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          pointRadius: 4,
          borderWidth: 2,
        };
      }),
    };
  }, [pokemon, statLabels]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#8b8b9e',
          padding: 16,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle' as const,
        },
      },
      tooltip: {
        backgroundColor: '#13131a',
        borderColor: '#1e1e2a',
        borderWidth: 1,
        titleColor: '#e8e8ed',
        bodyColor: '#8b8b9e',
        padding: 12,
        cornerRadius: 12,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 255,
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
        pointLabels: {
          color: '#8b8b9e',
          font: { size: 11 },
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#8b8b9e',
          font: { size: 9 },
          stepSize: 50,
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Radar data={chartData} options={options} />
    </div>
  );
}

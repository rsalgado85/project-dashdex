import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { StatisticsPage } from '@/pages/StatisticsPage';
import { ComparePage } from '@/pages/ComparePage';
import { ExplorerPage } from '@/pages/ExplorerPage';
import { PokemonDetailPage } from '@/pages/PokemonDetailPage';
import { RankingsPage } from '@/pages/RankingsPage';
import { InsightsPage } from '@/pages/InsightsPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { AboutPage } from '@/pages/AboutPage';
import { VideogamesPage } from '@/pages/VideogamesPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { DonatePage } from '@/pages/DonatePage';
import { ErrorPage } from '@/components/common/ErrorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'statistics', element: <StatisticsPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'explorer', element: <ExplorerPage /> },
      { path: 'pokemon/:id', element: <PokemonDetailPage /> },
      { path: 'rankings', element: <RankingsPage /> },
      { path: 'insights', element: <InsightsPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'videogames', element: <VideogamesPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'donate', element: <DonatePage /> },
    ],
  },
]);

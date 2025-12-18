import { SectorSymbolRow } from "../../features/dashboard/components/sector-modal/sector-modal";

export const MOCK_SECTOR_BREAKDOWN: Record<string, SectorSymbolRow[]> = {
  Technology: [
    { symbol: 'NVDA', percentage: 38.0, holdings: 60, totalInvested: 4100000, realisedPnl: 42000 },
    { symbol: 'AAPL', percentage: 29.0, holdings: 120, totalInvested: 3200000, realisedPnl: 12000 },
    { symbol: 'MSFT', percentage: 20.0, holdings: 90, totalInvested: 2500000, realisedPnl: 18000 },
    { symbol: 'AMD',  percentage: 13.0, holdings: 65, totalInvested: 3800000, realisedPnl: 60000 }
  ],
  Finance: [
    { symbol: 'JPM', percentage: 55.0, holdings: 70, totalInvested: 2600000, realisedPnl: 12000 },
    { symbol: 'BAC', percentage: 45.0, holdings: 80, totalInvested: 1900000, realisedPnl: 9000 }
  ],
  Energy: [
    { symbol: 'XOM', percentage: 62.0, holdings: 90, totalInvested: 3720000, realisedPnl: 45000 },
    { symbol: 'CVX', percentage: 38.0, holdings: 50, totalInvested: 3000000, realisedPnl: 0 }
  ],
  Healthcare: [
    { symbol: 'UNH', percentage: 100.0, holdings: 20, totalInvested: 4420000, realisedPnl: 77000 }
  ],
  Consumer: [
    { symbol: 'TSLA', percentage: 60.0, holdings: 25, totalInvested: 2100000, realisedPnl: 21000 },
    { symbol: 'NFLX', percentage: 40.0, holdings: 30, totalInvested: 1100000, realisedPnl: 0 }
  ]
};

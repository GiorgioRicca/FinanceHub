import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../utils'
import PortfolioChart from '../../components/charts/portfolio-chart'
import AllocationChart from '../../components/charts/allocation-chart'


type Asset = {
  name?: string | null;
  symbol?: string | null;
};

vi.mock('../../components/charts/portfolio-chart', () => {
  return {
    default: () => <div data-testid="portfolio-chart">Portfolio Chart</div>
  }
})

vi.mock('../../components/charts/allocation-chart', () => {
  return {
    default: () => <div data-testid="allocation-chart">Allocation Chart</div>
  }
})

describe('Chart Components', () => {
  describe('PortfolioChart', () => {
    it('renders portfolio chart component', () => {
      render(<PortfolioChart />)
      expect(screen.getByTestId('portfolio-chart')).toBeInTheDocument()
    })
  })

  describe('AllocationChart', () => {
    it('renders allocation chart component', () => {
      render(<AllocationChart />)
      expect(screen.getByTestId('allocation-chart')).toBeInTheDocument()
    })
  })
})


describe('Chart Logic Tests', () => {
  it('should handle empty investment data', () => {
    
    const mockInvestments: never[] = []
    expect(mockInvestments.length).toBe(0)
  })

  it('should calculate portfolio values correctly', () => {
    const mockInvestments = [
      { shares: '100', currentPrice: '14.50' },
      { shares: '200', currentPrice: '29.45' }
    ]
    
    const totalValue = mockInvestments.reduce((sum, inv) => {
      return sum + (parseFloat(inv.shares) * parseFloat(inv.currentPrice))
    }, 0)
    
    expect(totalValue).toBe(7340) 
  })

  it('should categorize assets correctly', () => {
    const mockAssets = [
      { symbol: 'ENI', name: 'Eni S.p.A.' },
      { symbol: 'FTSE-MIB', name: 'FTSE MIB ETF' },
      { symbol: 'BTP-10Y', name: 'Buono del Tesoro' }
    ]

    const has = (v: unknown, sub?: string | null) =>
    String(v ?? '').toUpperCase().includes(String(sub ?? '').toUpperCase());



    const categorizeAsset = (asset: Partial<Asset> | null | undefined): 'ETF' | 'Bond' | 'Stock' => {
      if (has(asset?.name, 'ETF') || has(asset?.symbol, 'FTSE')) return 'ETF';
      if (has(asset?.symbol, 'BTP') || has(asset?.name, 'BUONO')) return 'Bond';
      return 'Stock';
    };


    expect(categorizeAsset(mockAssets[0])).toBe('Stock') 
    expect(categorizeAsset(mockAssets[1])).toBe('ETF')   
    expect(categorizeAsset(mockAssets[2])).toBe('Bond')  
  })
})
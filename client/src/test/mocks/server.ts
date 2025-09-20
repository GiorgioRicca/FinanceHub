import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const mockDashboardData = {
  totalBalance: '128435.60',
  totalInvestments: '19845.00',
  monthlyExpenses: '2450.00',
  activeLoanBalance: '15000.00',
  investmentGrowth: '8.5',
  expenseVariation: '-5.2'
}

const mockAccounts = [
  {
    id: '1',
    userId: 'demo-user-123',
    name: 'Conto Corrente',
    accountNumber: '1234567890',
    balance: '50000.00',
    type: 'checking'
  },
  {
    id: '2',
    userId: 'demo-user-123',
    name: 'Conto Risparmio',
    accountNumber: '0987654321',
    balance: '75000.00',
    type: 'savings'
  }
]

const mockInvestments = [
  {
    id: '1',
    userId: 'demo-user-123',
    symbol: 'ENI',
    name: 'Eni S.p.A.',
    shares: '100',
    purchasePrice: '13.45',
    currentPrice: '14.50',
    purchaseDate: '2025-02-15T16:10:49.092Z'
  },
  {
    id: '2',
    userId: 'demo-user-123',
    symbol: 'FTSE-MIB',
    name: 'FTSE MIB ETF',
    shares: '200',
    purchasePrice: '26.80',
    currentPrice: '29.45',
    purchaseDate: '2025-06-15T16:10:49.092Z'
  }
]

const mockTransactions = [
  {
    id: '1',
    accountId: 'account-1',
    accountName: 'Conto Corrente',
    accountNumber: '1234567890',
    description: 'Stipendio Gennaio',
    amount: '3500.00',
    type: 'credit',
    category: 'Income',
    date: '2025-01-28T10:00:00.000Z'
  }
]

const mockAssets = [
  {
    id: '1',
    symbol: 'ENI',
    name: 'Eni S.p.A.',
    currentPrice: '14.50',
    priceChange: '+0.05',
    priceChangePercent: '+0.35%',
    sector: 'Energy'
  },
  {
    id: '2', 
    symbol: 'ENEL',
    name: 'Enel S.p.A.',
    currentPrice: '6.85',
    priceChange: '+0.12',
    priceChangePercent: '+1.78%',
    sector: 'Utilities'
  }
]

export const handlers = [
  http.get('/api/dashboard/:userId', () => {
    return HttpResponse.json(mockDashboardData)
  }),

  http.get('/api/accounts/:userId', () => {
    return HttpResponse.json(mockAccounts)
  }),

  http.get('/api/investments/:userId', () => {
    return HttpResponse.json(mockInvestments)
  }),

  http.get('/api/transactions/recent/:userId', () => {
    return HttpResponse.json(mockTransactions)
  }),

  http.get('/api/assets', () => {
    return HttpResponse.json(mockAssets)
  }),

  http.post('/api/investments/buy', () => {
    return HttpResponse.json({
      investment: {
        id: 'new-investment',
        userId: 'demo-user-123',
        symbol: 'TEST',
        shares: '10',
        purchasePrice: '100.00'
      }
    }, { status: 201 })
  }),

  http.get('/api/notifications/:userId', () => {
    return HttpResponse.json([])
  }),

  http.get('/api/notifications/:userId/unread', () => {
    return HttpResponse.json([])
  }),

  http.get('/api/loans/:userId', () => {
    return HttpResponse.json([])
  }),
]

export const server = setupServer(...handlers)
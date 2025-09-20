import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../utils'
import Dashboard from '../../pages/dashboard'

describe('Dashboard Component', () => {
  beforeEach(() => {
    
  })

  it('renders dashboard header correctly', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Dashboard Finanziario')).toBeInTheDocument()
    expect(screen.getByText('Bentornato, gestisci le tue finanze in modo efficiente')).toBeInTheDocument()
  })

  it('displays financial statistics cards', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Saldo Totale')).toBeInTheDocument()
      expect(screen.getByText('Investimenti')).toBeInTheDocument()
      expect(screen.getByText('Spese Mensili')).toBeInTheDocument()
      expect(screen.getByText('Prestiti Attivi')).toBeInTheDocument()
    })

    
    await waitFor(() => {
      expect(screen.getByText('€128.435,60')).toBeInTheDocument()
    })
  })

  it('shows accounts section with proper data', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('I Tuoi Conti')).toBeInTheDocument()
      expect(screen.getByText('Conto Corrente')).toBeInTheDocument()
      expect(screen.getByText('Conto Risparmio')).toBeInTheDocument()
    })

    
    await waitFor(() => {
      expect(screen.getByText('Corrente')).toBeInTheDocument()
      expect(screen.getByText('Risparmio')).toBeInTheDocument()
    })
  })

  it('displays recent transactions table', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Transazioni Recenti')).toBeInTheDocument()
      expect(screen.getByText('Stipendio Gennaio')).toBeInTheDocument()
      expect(screen.getByText('Entrata')).toBeInTheDocument()
    })
  })

  it('shows loading state while fetching data', () => {
    render(<Dashboard />)
    
    
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('handles navigation links correctly', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      const transactionsLink = screen.getByRole('link', { name: /vedi tutto/i })
      expect(transactionsLink).toHaveAttribute('href', '/transactions')
    })
  })
})
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '../utils'
import Investments from '../../pages/investments'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

describe('Investments Component', () => {
  it('renders investment page with portfolio table', async () => {
    render(<Investments />)
    
    expect(screen.getByText('Gestione Investimenti')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('Il Tuo Portafoglio')).toBeInTheDocument()
      expect(screen.getByText('ENI')).toBeInTheDocument()
      expect(screen.getByText('FTSE-MIB')).toBeInTheDocument()
    })
  })

  it('displays asset types correctly with badges', async () => {
    render(<Investments />)
    
    await waitFor(() => {
      
      expect(screen.getByText('Azione')).toBeInTheDocument() 
      expect(screen.getByText('ETF')).toBeInTheDocument() 
    })
  })

  it('shows investment values and calculations', async () => {
    render(<Investments />)
    
    await waitFor(() => {
      
      expect(screen.getByText('€1.450,00')).toBeInTheDocument()
      
      expect(screen.getByText('€5.890,00')).toBeInTheDocument()
    })
  })

  it('displays quantities as integers', async () => {
    render(<Investments />)
    
    await waitFor(() => {
      
      expect(screen.getByText('100')).toBeInTheDocument() 
      expect(screen.getByText('200')).toBeInTheDocument() 
    })
  })

  it('opens buy dialog when clicking "Acquista Asset"', async () => {
    render(<Investments />)
    
    const buyButton = screen.getByRole('button', { name: /acquista asset/i })
    fireEvent.click(buyButton)
    
    await waitFor(() => {
      expect(screen.getByText('Acquista Nuovo Asset')).toBeInTheDocument()
      expect(screen.getByText('Seleziona Asset')).toBeInTheDocument()
    })
  })

  it('opens sell dialog when clicking sell button', async () => {
    render(<Investments />)
    
    await waitFor(() => {
      const sellButtons = screen.getAllByText('Vendi')
      fireEvent.click(sellButtons[0])
    })
    
    await waitFor(() => {
      expect(screen.getByText('Vendi Asset')).toBeInTheDocument()
      expect(screen.getByText('Quantità da vendere:')).toBeInTheDocument()
    })
  })

  it('calculates gain/loss correctly', async () => {
    render(<Investments />)
    
    await waitFor(() => {
      
      expect(screen.getByText('+€105,00')).toBeInTheDocument()
      
      expect(screen.getByText('+€530,00')).toBeInTheDocument()
    })
  })

  it('handles empty portfolio state', async () => {
    
    server.use(
      http.get('/api/investments/:userId', () => {
        return HttpResponse.json([])
      })
    )

    render(<Investments />)
    
    await waitFor(() => {
      expect(screen.getByText('Nessun investimento presente')).toBeInTheDocument()
    })
  })

  it('validates buy form correctly', async () => {
    render(<Investments />)
    
    const buyButton = screen.getByRole('button', { name: /acquista asset/i })
    fireEvent.click(buyButton)
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /conferma acquisto/i })
      fireEvent.click(submitButton)
      
      
      expect(screen.getByText('Seleziona un asset')).toBeInTheDocument()
    })
  })
})
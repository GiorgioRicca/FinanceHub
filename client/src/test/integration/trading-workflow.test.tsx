import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import Investments from '../../pages/investments'

describe('Trading Workflow Integration', () => {
  it('completes full buy workflow successfully', async () => {
    
    server.use(
      http.post('/api/investments/buy', () => {
        return HttpResponse.json({
          investment: {
            id: 'new-investment',
            userId: 'demo-user-123',
            symbol: 'ENI',
            shares: '50',
            purchasePrice: '14.50'
          }
        }, { status: 201 })
      }),
      http.get('/api/accounts/:userId', () => {
        return HttpResponse.json([
          {
            id: 'account-1',
            name: 'Conto Corrente',
            balance: '10000.00',
            type: 'checking'
          }
        ])
      })
    )

    render(<Investments />)
    
    
    const buyButton = screen.getByRole('button', { name: /acquista asset/i })
    fireEvent.click(buyButton)
    
    await waitFor(() => {
      expect(screen.getByText('Acquista Nuovo Asset')).toBeInTheDocument()
    })

    
    const assetSelect = screen.getByRole('combobox')
    fireEvent.click(assetSelect)
    
    await waitFor(() => {
      const eniOption = screen.getByText('ENI - Eni S.p.A.')
      fireEvent.click(eniOption)
    })

    const quantityInput = screen.getByPlaceholderText('Es. 10')
    fireEvent.change(quantityInput, { target: { value: '50' } })

    const accountSelect = screen.getByDisplayValue(/seleziona conto/i)
    fireEvent.click(accountSelect)
    
    await waitFor(() => {
      const accountOption = screen.getByText(/conto corrente/i)
      fireEvent.click(accountOption)
    })

    
    const submitButton = screen.getByRole('button', { name: /conferma acquisto/i })
    fireEvent.click(submitButton)

    
    await waitFor(() => {
      expect(screen.getByText(/investimento acquistato con successo/i)).toBeInTheDocument()
    })
  })

  it('handles insufficient funds error', async () => {
    
    server.use(
      http.post('/api/investments/buy', () => {
        return HttpResponse.json({
          error: 'Insufficient funds in selected account'
        }, { status: 400 })
      })
    )

    render(<Investments />)
    
    const buyButton = screen.getByRole('button', { name: /acquista asset/i })
    fireEvent.click(buyButton)
    
    
    await waitFor(() => {
      const quantityInput = screen.getByPlaceholderText('Es. 10')
      fireEvent.change(quantityInput, { target: { value: '1000' } })
    })

    const submitButton = screen.getByRole('button', { name: /conferma acquisto/i })
    fireEvent.click(submitButton)

    
    await waitFor(() => {
      expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument()
    })
  })

  it('completes sell workflow successfully', async () => {
    
    server.use(
      http.post('/api/investments/sell', () => {
        return HttpResponse.json({
          success: true,
          soldAmount: '725.00'
        }, { status: 200 })
      })
    )

    render(<Investments />)
    
    
    await waitFor(() => {
      expect(screen.getByText('ENI')).toBeInTheDocument()
    })

    
    const sellButtons = screen.getAllByText('Vendi')
    fireEvent.click(sellButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Vendi Asset')).toBeInTheDocument()
    })

    
    const quantityInput = screen.getByPlaceholderText(/quantità/i)
    fireEvent.change(quantityInput, { target: { value: '50' } })

    const confirmButton = screen.getByRole('button', { name: /conferma vendita/i })
    fireEvent.click(confirmButton)

    
    await waitFor(() => {
      expect(screen.getByText(/asset venduto con successo/i)).toBeInTheDocument()
    })
  })

  it('validates sell quantity limits', async () => {
    render(<Investments />)
    
    await waitFor(() => {
      expect(screen.getByText('ENI')).toBeInTheDocument()
    })

    const sellButtons = screen.getAllByText('Vendi')
    fireEvent.click(sellButtons[0])

    await waitFor(() => {
      const quantityInput = screen.getByPlaceholderText(/quantità/i)
      
      fireEvent.change(quantityInput, { target: { value: '150' } })
    })

    const confirmButton = screen.getByRole('button', { name: /conferma vendita/i })
    fireEvent.click(confirmButton)

    
    await waitFor(() => {
      expect(screen.getByText(/quantità non può superare/i)).toBeInTheDocument()
    })
  })
})
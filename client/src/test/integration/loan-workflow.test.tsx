import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import Loans from '../../pages/loans'

describe('Loan Workflow Integration', () => {
  it('submits loan application successfully', async () => {
    
    server.use(
      http.post('/api/loan-workflow/apply', () => {
        return HttpResponse.json({
          applicationId: 'loan-app-123',
          status: 'pending',
          estimatedDecision: '60 seconds'
        }, { status: 201 })
      }),
      http.get('/api/loans/:userId', () => {
        return HttpResponse.json([])
      }),
      http.get('/api/loan-workflow/applications/:userId', () => {
        return HttpResponse.json([
          {
            id: 'loan-app-123',
            type: 'personal',
            amount: '15000',
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        ])
      })
    )

    render(<Loans />)
    
    
    await waitFor(() => {
      expect(screen.getByText('Richiedi un Prestito')).toBeInTheDocument()
    })

    const amountInput = screen.getByPlaceholderText(/importo desiderato/i)
    fireEvent.change(amountInput, { target: { value: '15000' } })

    const typeSelect = screen.getByRole('combobox', { name: /tipo di prestito/i })
    fireEvent.click(typeSelect)
    
    await waitFor(() => {
      const personalOption = screen.getByText('Prestito Personale')
      fireEvent.click(personalOption)
    })

    const incomeInput = screen.getByPlaceholderText(/reddito mensile/i)
    fireEvent.change(incomeInput, { target: { value: '4000' } })

    const submitButton = screen.getByRole('button', { name: /richiedi prestito/i })
    fireEvent.click(submitButton)

    
    await waitFor(() => {
      expect(screen.getByText(/richiesta inviata con successo/i)).toBeInTheDocument()
      expect(screen.getByText(/la tua richiesta è in elaborazione/i)).toBeInTheDocument()
    })
  })

  it('validates loan amount limits', async () => {
    render(<Loans />)
    
    
    const amountInput = screen.getByPlaceholderText(/importo desiderato/i)
    fireEvent.change(amountInput, { target: { value: '500' } })

    const typeSelect = screen.getByRole('combobox', { name: /tipo di prestito/i })
    fireEvent.click(typeSelect)
    
    await waitFor(() => {
      const personalOption = screen.getByText('Prestito Personale')
      fireEvent.click(personalOption)
    })

    const submitButton = screen.getByRole('button', { name: /richiedi prestito/i })
    fireEvent.click(submitButton)

    
    await waitFor(() => {
      expect(screen.getByText(/importo deve essere tra €1.000 e €50.000/i)).toBeInTheDocument()
    })
  })

  it('shows loan approval workflow', async () => {
    
    server.use(
      http.get('/api/loan-workflow/applications/:userId', () => {
        return HttpResponse.json([
          {
            id: 'loan-app-123',
            type: 'personal',
            amount: '15000',
            status: 'approved',
            approvalDate: new Date().toISOString(),
            interestRate: '5.5',
            termMonths: 36
          }
        ])
      }),
      http.get('/api/loans/:userId', () => {
        return HttpResponse.json([
          {
            id: 'loan-123',
            userId: 'demo-user-123',
            type: 'personal',
            amount: '15000',
            balance: '15000',
            interestRate: '5.5',
            termMonths: 36,
            monthlyPayment: '456.89',
            status: 'active'
          }
        ])
      })
    )

    render(<Loans />)
    
    await waitFor(() => {
      expect(screen.getByText(/prestito approvato/i)).toBeInTheDocument()
      expect(screen.getByText(/€15.000,00/)).toBeInTheDocument()
      expect(screen.getByText(/5,5%/)).toBeInTheDocument()
    })
  })

  it('shows loan rejection with reason', async () => {
    server.use(
      http.get('/api/loan-workflow/applications/:userId', () => {
        return HttpResponse.json([
          {
            id: 'loan-app-123',
            type: 'personal',
            amount: '25000',
            status: 'rejected',
            rejectionReason: 'Debt-to-income ratio too high',
            createdAt: new Date().toISOString()
          }
        ])
      })
    )

    render(<Loans />)
    
    await waitFor(() => {
      expect(screen.getByText(/richiesta respinta/i)).toBeInTheDocument()
      expect(screen.getByText(/debt-to-income ratio too high/i)).toBeInTheDocument()
    })
  })

  it('calculates monthly payments correctly', async () => {
    render(<Loans />)
    
    
    const calculatorAmount = screen.getByPlaceholderText(/importo prestito/i)
    fireEvent.change(calculatorAmount, { target: { value: '20000' } })

    const calculatorRate = screen.getByPlaceholderText(/tasso interesse/i)
    fireEvent.change(calculatorRate, { target: { value: '6.5' } })

    const calculatorTerm = screen.getByPlaceholderText(/durata anni/i)
    fireEvent.change(calculatorTerm, { target: { value: '5' } })

    const calculateButton = screen.getByRole('button', { name: /calcola/i })
    fireEvent.click(calculateButton)

    
    await waitFor(() => {
      
      expect(screen.getByText(/€393/)).toBeInTheDocument()
    })
  })
})
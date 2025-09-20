import { describe, it, expect } from 'vitest'
import { 
  formatCurrency, 
  formatPercent, 
  formatDate, 
  getAccountDisplayNumber 
} from '../../lib/financial-utils'

describe('Financial Utils', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency('1234.56')).toBe('€1.234,56')
      expect(formatCurrency('1000')).toBe('€1.000,00')
      expect(formatCurrency('0')).toBe('€0,00')
    })

    it('formats large numbers with proper separators', () => {
      expect(formatCurrency('1234567.89')).toBe('€1.234.567,89')
      expect(formatCurrency('128435.60')).toBe('€128.435,60')
    })

    it('handles negative numbers', () => {
      expect(formatCurrency('-1234.56')).toBe('-€1.234,56')
    })

    it('handles decimal strings', () => {
      expect(formatCurrency('100.5')).toBe('€100,50')
      expect(formatCurrency('100.50')).toBe('€100,50')
    })
  })

  describe('formatPercent', () => {
    it('formats percentages correctly', () => {
      expect(formatPercent('8.5')).toBe('8,5%')
      expect(formatPercent('-5.2')).toBe('-5,2%')
      expect(formatPercent('0')).toBe('0,0%')
    })

    it('handles different decimal places', () => {
      expect(formatPercent('12.345')).toBe('12,3%')
      expect(formatPercent('8')).toBe('8,0%')
    })
  })

  describe('formatDate', () => {
    it('formats dates correctly in Italian locale', () => {
      const date = '2025-01-28T10:00:00.000Z'
      const formatted = formatDate(date)
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('handles different date formats', () => {
      const date1 = '2025-02-15T16:10:49.092Z'
      const date2 = new Date('2025-02-15').toISOString()
      
      const formatted1 = formatDate(date1)
      const formatted2 = formatDate(date2)
      
      expect(formatted1).toBeTruthy()
      expect(formatted2).toBeTruthy()
    })
  })

  describe('getAccountDisplayNumber', () => {
    it('formats account numbers with asterisks', () => {
      expect(getAccountDisplayNumber('1234567890')).toBe('****7890')
    })

    it('handles short account numbers', () => {
      expect(getAccountDisplayNumber('12345')).toBe('*2345')
    })

    it('handles undefined or null', () => {
      expect(getAccountDisplayNumber(undefined as any)).toBe('****')
      expect(getAccountDisplayNumber(null as any)).toBe('****')
    })

    it('handles empty strings', () => {
      expect(getAccountDisplayNumber('')).toBe('****')
    })

    it('shows last 4 digits for standard accounts', () => {
      expect(getAccountDisplayNumber('IT60X0542811101000000123456')).toBe('****3456')
    })
  })
})
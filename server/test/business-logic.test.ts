import { describe, it, expect } from 'vitest'


const calculateInvestmentValue = (shares: string, price: string): number => {
  return parseFloat(shares) * parseFloat(price)
}

const calculateGainLoss = (shares: string, currentPrice: string, purchasePrice: string) => {
  const currentValue = calculateInvestmentValue(shares, currentPrice)
  const purchaseValue = calculateInvestmentValue(shares, purchasePrice)
  const gainLoss = currentValue - purchaseValue
  const gainLossPercent = (gainLoss / purchaseValue) * 100
  
  return {
    currentValue,
    purchaseValue,
    gainLoss,
    gainLossPercent,
    isGain: gainLoss >= 0
  }
}

const validateLoanApplication = (amount: number, type: string, income: number) => {
  const limits = {
    personal: { min: 1000, max: 50000 },
    auto: { min: 5000, max: 80000 },
    mortgage: { min: 50000, max: 1000000 }
  }
  
  const limit = limits[type as keyof typeof limits]
  if (!limit) return { valid: false, error: 'Invalid loan type' }
  
  if (amount < limit.min || amount > limit.max) {
    return { 
      valid: false, 
      error: `Amount must be between €${limit.min} and €${limit.max}` 
    }
  }
  
  
  const maxLoanAmount = income * 0.4 * 12 
  if (amount > maxLoanAmount) {
    return {
      valid: false,
      error: 'Exceeds maximum debt-to-income ratio'
    }
  }
  
  return { valid: true, error: null }
}

const categorizeAsset = (symbol: string, name: string): string => {
  const symbolUpper = symbol.toUpperCase()
  const nameUpper = name.toUpperCase()
  
  
  const S = symbolUpper ?? '';
  const N = nameUpper ?? '';

  if (
    S.includes('BTP') || S.includes('BOND') ||
    N.includes('BOND') || N.includes('BTP') ||
    N.includes('OBBLIGAZ')
  ) {
    return 'bonds';
  }

  
  if (
    S.includes('FTSE-MIB') || S.includes('ETF') ||
    N.includes('ETF') || N.includes('INDEX')
  ) {
    return 'etf';
  }

  
  
  return 'stocks'
}

describe('Investment Calculations', () => {
  it('should calculate investment value correctly', () => {
    expect(calculateInvestmentValue('100', '14.50')).toBe(1450)
    expect(calculateInvestmentValue('200', '29.45')).toBe(5890)
    expect(calculateInvestmentValue('0', '10.00')).toBe(0)
  })

  it('should calculate gain/loss correctly', () => {
    const result = calculateGainLoss('100', '14.50', '13.45')
    
    expect(result.currentValue).toBe(1450)
    expect(result.purchaseValue).toBe(1345)
    expect(result.gainLoss).toBe(105)
    expect(result.gainLossPercent).toBeCloseTo(7.81, 2)
    expect(result.isGain).toBe(true)
  })

  it('should handle losses correctly', () => {
    const result = calculateGainLoss('100', '12.00', '13.45')
    
    expect(result.gainLoss).toBe(-145)
    expect(result.isGain).toBe(false)
    expect(result.gainLossPercent).toBeLessThan(0)
  })

  it('should handle zero shares', () => {
    const result = calculateGainLoss('0', '14.50', '13.45')
    
    expect(result.currentValue).toBe(0)
    expect(result.purchaseValue).toBe(0)
    expect(result.gainLoss).toBe(0)
  })
})

describe('Loan Validation', () => {
  it('should validate personal loan amounts', () => {
    const validLoan = validateLoanApplication(25000, 'personal', 5000)
    expect(validLoan.valid).toBe(true)
    
    const tooSmall = validateLoanApplication(500, 'personal', 5000)
    expect(tooSmall.valid).toBe(false)
    expect(tooSmall.error).toContain('between €1000 and €50000')
    
    const tooLarge = validateLoanApplication(60000, 'personal', 5000)
    expect(tooLarge.valid).toBe(false)
  })

  it('should validate auto loan amounts', () => {
    const validLoan = validateLoanApplication(40000, 'auto', 6000)
    expect(validLoan.valid).toBe(true)
    
    const tooSmall = validateLoanApplication(3000, 'auto', 6000)
    expect(tooSmall.valid).toBe(false)
    
    const tooLarge = validateLoanApplication(90000, 'auto', 6000)
    expect(tooLarge.valid).toBe(false)
  })

  it('should validate mortgage amounts', () => {
    const validLoan = validateLoanApplication(200000, 'mortgage', 10000)
    expect(validLoan.valid).toBe(true)
    
    const tooSmall = validateLoanApplication(30000, 'mortgage', 10000)
    expect(tooSmall.valid).toBe(false)
  })

  it('should check debt-to-income ratio', () => {
    
    const exceedsRatio = validateLoanApplication(20000, 'personal', 3000)
    expect(exceedsRatio.valid).toBe(false)
    expect(exceedsRatio.error).toContain('debt-to-income ratio')
    
    const withinRatio = validateLoanApplication(10000, 'personal', 3000)
    expect(withinRatio.valid).toBe(true)
  })

  it('should reject invalid loan types', () => {
    const invalid = validateLoanApplication(10000, 'invalid-type', 3000)
    expect(invalid.valid).toBe(false)
    expect(invalid.error).toBe('Invalid loan type')
  })
})

describe('Asset Categorization', () => {
  it('should categorize stocks correctly', () => {
    expect(categorizeAsset('ENI', 'Eni S.p.A.')).toBe('stocks')
    expect(categorizeAsset('ENEL', 'Enel S.p.A.')).toBe('stocks')
    expect(categorizeAsset('UCG', 'UniCredit S.p.A.')).toBe('stocks')
  })

  it('should categorize ETFs correctly', () => {
    expect(categorizeAsset('FTSE-MIB', 'FTSE MIB ETF')).toBe('etf')
    expect(categorizeAsset('MSCI-WORLD', 'MSCI World Index ETF')).toBe('etf')
  })

  it('should categorize bonds correctly', () => {
    expect(categorizeAsset('BTP-10Y', 'Buono del Tesoro 10 anni')).toBe('bonds')
    expect(categorizeAsset('CORP-BOND', 'Corporate Bond EUR')).toBe('bonds')
    expect(categorizeAsset('IT-BOND', 'Italian Government Bond')).toBe('bonds')
  })

  it('should handle mixed case inputs', () => {
    expect(categorizeAsset('ftse-mib', 'ftse mib etf')).toBe('etf')
    expect(categorizeAsset('btp-5y', 'BUONO DEL TESORO')).toBe('bonds')
  })

  it('should default to stocks for unknown assets', () => {
    expect(categorizeAsset('UNKNOWN', 'Unknown Asset')).toBe('stocks')
    expect(categorizeAsset('TEST', 'Test Company')).toBe('stocks')
  })
})
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAvailableYears } from '../utils/dateUtils'
import { ProcessedOrderItem } from '../utils/csvParser'
import './YearSelection.css'

interface YearSelectionProps {
  orderData: ProcessedOrderItem[]
  onYearSelected: (year: number) => void
}

export default function YearSelection({ orderData, onYearSelected }: YearSelectionProps) {
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  useEffect(() => {
    const years = getAvailableYears(orderData)
    setAvailableYears(years)
    // Auto-select most recent year
    if (years.length > 0) {
      setSelectedYear(years[0])
    }
  }, [orderData])

  const handleYearClick = (year: number) => {
    setSelectedYear(year)
  }

  const handleContinue = () => {
    if (selectedYear !== null) {
      onYearSelected(selectedYear)
    }
  }

  if (availableYears.length === 0) {
    return (
      <div className="year-selection-container">
        <div className="error-message">
          No valid dates found in the data
        </div>
      </div>
    )
  }

  return (
    <div className="year-selection-container">
      <motion.div
        className="year-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="year-header">
          <h1 className="year-title">PICK YOUR YEAR</h1>
          <p className="year-subtitle">Which year's stats do you want to see?</p>
        </div>

        <div className="year-grid">
          <motion.button
            key="all"
            className={`year-card ${selectedYear === 0 ? 'selected' : ''}`}
            onClick={() => handleYearClick(0)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="year-number">ALL</div>
            <div className="year-badge">YEARS</div>
          </motion.button>
          {availableYears.map((year, index) => (
            <motion.button
              key={year}
              className={`year-card ${selectedYear === year ? 'selected' : ''}`}
              onClick={() => handleYearClick(year)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 1) * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="year-number">{year}</div>
              <div className="year-badge">YEAR</div>
            </motion.button>
          ))}
        </div>

        <div className="button-group">
          <motion.button
            className="continue-btn"
            onClick={handleContinue}
            disabled={selectedYear === null}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={selectedYear !== null ? { scale: 1.05 } : {}}
            whileTap={selectedYear !== null ? { scale: 0.95 } : {}}
          >
            ANALYZE {selectedYear === 0 ? 'ALL YEARS' : selectedYear || 'YEAR'}
          </motion.button>

          <button
            className="back-btn"
            onClick={() => window.location.reload()}
          >
            ← UPLOAD DIFFERENT FILE
          </button>
        </div>
      </motion.div>
    </div>
  )
}

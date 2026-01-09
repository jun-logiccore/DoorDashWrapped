import { useState } from 'react'
import FileUpload from './components/FileUpload'
import YearSelection from './components/YearSelection'
import WrappedStats from './components/WrappedStats'
import { filterByYear } from './utils/dateUtils'
import { ProcessedOrderItem } from './utils/csvParser'
import './App.css'

function App() {
  const [allOrderData, setAllOrderData] = useState<ProcessedOrderItem[] | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const handleFileUploaded = (data: ProcessedOrderItem[]) => {
    setAllOrderData(data)
  }

  const handleYearSelected = (year: number) => {
    setSelectedYear(year)
  }

  const handleBackToYearSelection = () => {
    setSelectedYear(null)
  }

  // Filter data by selected year (0 means all years)
  const filteredOrderData = selectedYear !== null && allOrderData 
    ? filterByYear(allOrderData, selectedYear)
    : null

  return (
    <div className="App">
      {!allOrderData ? (
        <FileUpload onFileUploaded={handleFileUploaded} />
      ) : selectedYear === null ? (
        <YearSelection 
          orderData={allOrderData} 
          onYearSelected={handleYearSelected}
        />
      ) : (
        <WrappedStats 
          orderData={filteredOrderData} 
          selectedYear={selectedYear}
          onBackToYearSelection={handleBackToYearSelection}
        />
      )}
    </div>
  )
}

export default App

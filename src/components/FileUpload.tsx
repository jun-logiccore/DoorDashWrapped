import { useState } from 'react'
import { motion } from 'framer-motion'
import { ProcessedOrderItem } from '../utils/csvParser'
import './FileUpload.css'

interface FileUploadProps {
  onFileUploaded: (data: ProcessedOrderItem[]) => void
}

export default function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFile = async (file: File) => {
    if (!file || file.type !== 'text/csv') {
      alert('Please upload a CSV file')
      return
    }

    setIsProcessing(true)
    try {
      const { parseCSV, processOrderData } = await import('../utils/csvParser')
      const rawData = await parseCSV(file)
      const processedData = processOrderData(rawData)
      // Simulate processing delay for effect
      setTimeout(() => onFileUploaded(processedData), 1500)
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Error processing file. Please make sure it is a valid consumer_order_details.csv file.')
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <motion.div
      className="upload-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="marquee-container top">
        <div className="marquee-content">
          DOORDASH WRAPPED 2025 • YOUR YEAR IN FOOD • TASTY STATS • 
          DOORDASH WRAPPED 2025 • YOUR YEAR IN FOOD • TASTY STATS •
        </div>
      </div>

      <div className="upload-content">
        <motion.div 
          className="title-badge"
          initial={{ rotate: -5, scale: 0 }}
          animate={{ rotate: -5, scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          HUNGRY?
        </motion.div>
        
        <motion.h1
          className="main-title"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          YOUR <span className="highlight">FOOD</span><br/>
          STATS ARE<br/>
          <span className="outline">READY</span>
        </motion.h1>

        <motion.div
          className={`drop-zone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          {isProcessing ? (
            <div className="processing-state">
              <div className="loading-bar">
                <motion.div 
                  className="loading-fill"
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
              <p>CRUNCHING NUMBERS...</p>
            </div>
          ) : (
            <>
              <div className="zone-border">
                <span className="corner tl"></span>
                <span className="corner tr"></span>
                <span className="corner bl"></span>
                <span className="corner br"></span>
                
                <div className="upload-icon">⬇</div>
                <p className="upload-text">DROP CSV HERE</p>
                <p className="upload-sub">consumer_order_details.csv</p>
                
                <label className="browse-btn">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                  />
                  BROWSE FILES
                </label>
              </div>
            </>
          )}
        </motion.div>

        <div className="security-note">
          <span className="icon">🔒</span>
          LOCAL PROCESSING ONLY. DATA NEVER LEAVES YOUR DEVICE.
        </div>
      </div>

      <div className="marquee-container bottom">
        <div className="marquee-content reverse">
          BURGER • PIZZA • SUSHI • TACOS • NOODLES • SALAD • 
          BURGER • PIZZA • SUSHI • TACOS • NOODLES • SALAD •
        </div>
      </div>
    </motion.div>
  )
}

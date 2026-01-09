import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { calculateStats, CalculatedStats } from '../utils/analytics'
import { ProcessedOrderItem } from '../utils/csvParser'
import DataExplorer from './DataExplorer'
import './WrappedStats.css'

interface WrappedStatsProps {
  orderData: ProcessedOrderItem[] | null
  selectedYear: number
  onBackToYearSelection?: () => void
}

interface SlideProps {
  stats: CalculatedStats
  selectedYear?: number
}

export default function WrappedStats({ orderData, selectedYear, onBackToYearSelection }: WrappedStatsProps) {
  const [stats, setStats] = useState<CalculatedStats | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [showNext, setShowNext] = useState(true)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  useEffect(() => {
    if (!orderData) return
    const calculatedStats = calculateStats(orderData)
    setStats(calculatedStats)
    // Simulate "calculation" time for effect
    setTimeout(() => setIsReady(true), 2000)
  }, [orderData])

  const nextSlide = () => {
    if (stats && currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }

  // Swipe gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (distance > minSwipeDistance) {
      // Swipe left - next slide
      nextSlide()
    } else if (distance < -minSwipeDistance) {
      // Swipe right - previous slide
      prevSlide()
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  if (!stats || !isReady) {
    return (
      <div className="loading-container brutalist-loading">
        <div className="glitch-text">CALCULATING</div>
        <div className="loader-box">
          <motion.div 
            className="loader-bar"
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 2, ease: "linear" }}
          />
        </div>
      </div>
    )
  }

  const slides = [
    <IntroSlide key="intro" stats={stats} selectedYear={selectedYear} />,
    <OverviewSlide key="overview" stats={stats} />,
    <SpendingSlide key="spending" stats={stats} />,
    <TopStoresSlide key="stores" stats={stats} />,
    <TopItemsSlide key="items" stats={stats} />,
    <CategoriesSlide key="categories" stats={stats} />,
    <TimePatternsSlide key="time" stats={stats} />,
    <StreakSlide key="streak" stats={stats} />,
    <WeekendSlide key="weekend" stats={stats} />,
    <BusiestMonthSlide key="month" stats={stats} />,
    <LateNightSlide key="latenight" stats={stats} />,
    <FunFactsSlide key="funfacts" stats={stats} />,
    <DeliverySlide key="delivery" stats={stats} />,
    <FinalSlide key="final" stats={stats} selectedYear={selectedYear} />,
    <DataExplorerSlide key="explorer" orderData={orderData || []} />
  ]

  return (
    <div className="wrapped-container">
      <div className="noise-overlay"></div>
      
      <div className="progress-bar">
        {slides.map((_, index) => (
          <div 
            key={index} 
            className={`progress-segment ${index <= currentSlide ? 'active' : ''}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 1.1, rotate: 2 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="slide-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="card-border-layer"></div>
          {slides[currentSlide]}
        </motion.div>
      </AnimatePresence>

      <div className="navigation-controls">
        <button 
          className="nav-btn prev" 
          onClick={prevSlide} 
          disabled={currentSlide === 0}
        >
          ◀ PREV
        </button>
        <div className="slide-counter">
          {currentSlide + 1} / {slides.length}
        </div>
        <button 
          className="nav-btn next" 
          onClick={nextSlide} 
          disabled={currentSlide === slides.length - 1}
        >
          NEXT ▶
        </button>
      </div>

      <button
        className="restart-button-small"
        onClick={onBackToYearSelection || (() => window.location.reload())}
      >
        ↺ CHANGE YEAR
      </button>
    </div>
  )
}

function IntroSlide({ stats, selectedYear }: SlideProps & { selectedYear?: number }) {
  const yearDisplay = selectedYear === 0 ? 'ALL YEARS' : (selectedYear || '2025')
  return (
    <div className="slide-content intro">
      <div className="sticker top-right">{yearDisplay}</div>
      <motion.h1 className="huge-text">
        YOUR<br/>
        YEAR<br/>
        IN<br/>
        <span className="text-stroke">FOOD</span>
      </motion.h1>
      <div className="barcode-decoration"></div>
    </div>
  )
}

function OverviewSlide({ stats }: SlideProps) {
  return (
    <div className="slide-content overview">
      <div className="slide-header">THE NUMBERS</div>
      <div className="stat-row">
        <div className="stat-box yellow">
          <div className="label">ORDERS</div>
          <div className="value">{stats.totalOrders}</div>
        </div>
        <div className="stat-box purple">
          <div className="label">ITEMS</div>
          <div className="value">{stats.totalItems}</div>
        </div>
      </div>
      <div className="stat-box big red">
        <div className="label">TOTAL SPENT</div>
        <div className="value">${stats.totalSpent.toFixed(0)}</div>
      </div>
    </div>
  )
}

function SpendingSlide({ stats }: SlideProps) {
  return (
    <div className="slide-content spending">
      <div className="receipt-paper">
        <div className="receipt-header">
          <h3>TOTAL</h3>
          <p>{new Date().toLocaleDateString()}</p>
        </div>
        <div className="dashed-line"></div>
        <div className="receipt-row">
          <span>AMOUNT</span>
          <span className="highlight-text">${stats.totalSpent.toFixed(2)}</span>
        </div>
        <div className="receipt-row">
          <span>AVG/ORDER</span>
          <span>${stats.avgOrderValue.toFixed(2)}</span>
        </div>
        <div className="dashed-line"></div>
        <div className="receipt-footer">
          THANK YOU FOR EATING
        </div>
      </div>
    </div>
  )
}

function TopStoresSlide({ stats }: SlideProps) {
  return (
    <div className="slide-content list-slide">
      <h2 className="slide-title">TOP SPOTS</h2>
      <div className="leaderboard">
        {stats.topStores.map((store, index) => (
          <motion.div 
            className="leaderboard-item"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            key={store.name}
          >
            <div className="rank">#{index + 1}</div>
            <div className="name">{store.name}</div>
            <div className="count">{store.orderCount} orders</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function TopItemsSlide({ stats }: SlideProps) {
  return (
    <div className="slide-content list-slide">
      <h2 className="slide-title">THE USUAL</h2>
      <div className="leaderboard">
        {stats.topItems.map((item, index) => (
          <motion.div 
            className="leaderboard-item alt"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            key={item.name}
          >
            <div className="rank">#{index + 1}</div>
            <div className="name">{item.name}</div>
            <div className="count">x{item.count}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function CategoriesSlide({ stats }: SlideProps) {
  return (
    <div className="slide-content categories">
      <h2 className="slide-title">VIBES</h2>
      <div className="chart-container">
        {stats.topCategories.map((category, index) => (
          <div key={category.name} className="bar-group">
            <div className="bar-label">{category.name}</div>
            <div className="bar-track">
              <motion.div 
                className="bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${(category.totalSpent / stats.totalSpent) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimePatternsSlide({ stats }: SlideProps) {
  return (
    <div className="slide-content patterns">
      <div className="sticker rotate-right">HABITS</div>
      
      <div className="pattern-card">
        <div className="icon">⏰</div>
        <div className="info">
          <h3>PEAK TIME</h3>
          <div className="big-stat">{stats.peakHour}</div>
        </div>
      </div>
      
      <div className="pattern-card alt">
        <div className="icon">📅</div>
        <div className="info">
          <h3>FAV DAY</h3>
          <div className="big-stat">{stats.peakDay}</div>
        </div>
      </div>
    </div>
  )
}

function DeliverySlide({ stats }: SlideProps) {
  return (
    <div className="slide-content delivery">
      <div className="speedometer">
        <div className="speed-value">{stats.avgDeliveryTime}</div>
        <div className="speed-unit">MINS AVG</div>
      </div>
      
      {stats.mostExpensiveOrder && (
        <div className="splurge-card">
          <div className="splurge-tag">BIGGEST SPLURGE</div>
          <div className="splurge-amount">${stats.mostExpensiveOrder.total.toFixed(2)}</div>
          <div className="splurge-store">at {stats.mostExpensiveOrder.storeName}</div>
        </div>
      )}
    </div>
  )
}

function StreakSlide({ stats }: SlideProps) {
  return (
    <div className="slide-content streak">
      <h2 className="slide-title">🔥 STREAK</h2>
      <div className="streak-display">
        <div className="streak-number">{stats.longestStreak}</div>
        <div className="streak-label">CONSECUTIVE DAYS</div>
      </div>
      <div className="streak-subtext">
        You ordered food {stats.longestStreak} days in a row! 🔥
      </div>
    </div>
  )
}

function WeekendSlide({ stats }: SlideProps) {
  const weekendPercent = Math.round((stats.weekendOrders / stats.totalOrders) * 100)
  const weekdayPercent = 100 - weekendPercent
  return (
    <div className="slide-content weekend">
      <h2 className="slide-title">WEEKEND WARRIOR?</h2>
      <div className="weekend-stats">
        <div className="weekend-card">
          <div className="weekend-label">WEEKEND</div>
          <div className="weekend-value">{stats.weekendOrders}</div>
          <div className="weekend-percent">{weekendPercent}%</div>
        </div>
        <div className="weekend-card alt">
          <div className="weekend-label">WEEKDAY</div>
          <div className="weekend-value">{stats.weekdayOrders}</div>
          <div className="weekend-percent">{weekdayPercent}%</div>
        </div>
      </div>
    </div>
  )
}

function BusiestMonthSlide({ stats }: SlideProps) {
  return (
    <div className="slide-content busiest-month">
      <h2 className="slide-title">BUSIEST MONTH</h2>
      <div className="month-display">
        <div className="month-name">{stats.busiestMonth}</div>
        <div className="month-stats">
          {stats.monthStats
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map((month, index) => (
              <div key={month.month} className="month-item">
                <span className="month-rank">#{index + 1}</span>
                <span className="month-text">{month.month}</span>
                <span className="month-count">{month.count} orders</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

function LateNightSlide({ stats }: SlideProps) {
  const lateNightPercent = Math.round((stats.lateNightOrders / stats.totalOrders) * 100)
  return (
    <div className="slide-content latenight">
      <div className="sticker rotate-right">🌙</div>
      <h2 className="slide-title">NIGHT OWL</h2>
      <div className="latenight-stats">
        <div className="latenight-number">{stats.lateNightOrders}</div>
        <div className="latenight-label">LATE NIGHT ORDERS</div>
        <div className="latenight-subtext">(10 PM - 2 AM)</div>
        <div className="latenight-percent">{lateNightPercent}% of all orders</div>
      </div>
      {stats.earlyMorningOrders > 0 && (
        <div className="early-morning-badge">
          🌅 {stats.earlyMorningOrders} early morning orders
        </div>
      )}
    </div>
  )
}

function FunFactsSlide({ stats }: SlideProps) {
  return (
    <div className="slide-content funfacts">
      <h2 className="slide-title">FUN FACTS</h2>
      <div className="facts-grid">
        <div className="fact-card">
          <div className="fact-icon">💰</div>
          <div className="fact-label">CHEAPEST ORDER</div>
          <div className="fact-value">${stats.cheapestOrder.total.toFixed(2)}</div>
          <div className="fact-subtext">at {stats.cheapestOrder.storeName}</div>
        </div>
        <div className="fact-card">
          <div className="fact-icon">📦</div>
          <div className="fact-label">AVG ITEMS/ORDER</div>
          <div className="fact-value">{stats.avgItemsPerOrder}</div>
        </div>
        <div className="fact-card">
          <div className="fact-icon">📅</div>
          <div className="fact-label">DAYS ACTIVE</div>
          <div className="fact-value">{stats.totalDaysActive}</div>
        </div>
        <div className="fact-card">
          <div className="fact-icon">⏱️</div>
          <div className="fact-label">AVG DAYS BETWEEN</div>
          <div className="fact-value">{stats.avgDaysBetweenOrders}</div>
        </div>
      </div>
    </div>
  )
}

function FinalSlide({ stats, selectedYear }: SlideProps & { selectedYear?: number }) {
  const yearDisplay = selectedYear === 0 ? 'ALL YEARS' : (selectedYear || '2025')
  return (
    <div className="slide-content final">
      <h1 className="huge-text">IT'S A<br/>WRAP</h1>
      
      <div className="summary-grid">
        <div className="summary-item">
          <span>ORDERS</span>
          <strong>{stats.totalOrders}</strong>
        </div>
        <div className="summary-item">
          <span>SPENT</span>
          <strong>${stats.totalSpent.toFixed(0)}</strong>
        </div>
        <div className="summary-item">
          <span>ITEMS</span>
          <strong>{stats.totalItems}</strong>
        </div>
      </div>
      
      <div className="year-tag">
        {yearDisplay}
      </div>
      
      <div className="share-prompt">
        SCREENSHOT THIS 📸
      </div>
    </div>
  )
}

function DataExplorerSlide({ orderData }: { orderData: ProcessedOrderItem[] }) {
  return <DataExplorer orderData={orderData} />
}

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ProcessedOrderItem } from '../utils/csvParser'
import './DataExplorer.css'

interface DataExplorerProps {
  orderData: ProcessedOrderItem[]
}

type SortField = 'createdAt' | 'storeName' | 'item' | 'category' | 'subtotal' | 'quantity'
type SortDirection = 'asc' | 'desc'

export default function DataExplorer({ orderData }: DataExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStore, setFilterStore] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Get unique stores and categories for filters
  const uniqueStores = useMemo(() => {
    const stores = new Set(orderData.map(item => item.storeName))
    return Array.from(stores).sort()
  }, [orderData])

  const uniqueCategories = useMemo(() => {
    const categories = new Set(orderData.map(item => item.category))
    return Array.from(categories).sort()
  }, [orderData])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = orderData.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStore = filterStore === '' || item.storeName === filterStore
      const matchesCategory = filterCategory === '' || item.category === filterCategory
      
      return matchesSearch && matchesStore && matchesCategory
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]
      
      if (sortField === 'createdAt') {
        aVal = a.createdAt.getTime()
        bVal = b.createdAt.getTime()
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      }
    })

    return filtered
  }, [orderData, searchTerm, filterStore, filterCategory, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="slide-content data-explorer">
      <div className="explorer-header">
        <h2 className="slide-title">DATA EXPLORER</h2>
        <div className="explorer-stats">
          Showing {filteredAndSortedData.length} of {orderData.length} items
        </div>
      </div>

      <div className="explorer-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search items, stores, categories..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="explorer-input"
          />
        </div>
        
        <div className="filter-row">
          <select
            value={filterStore}
            onChange={(e) => {
              setFilterStore(e.target.value)
              setCurrentPage(1)
            }}
            className="explorer-select"
          >
            <option value="">All Stores</option>
            {uniqueStores.map(store => (
              <option key={store} value={store}>{store}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value)
              setCurrentPage(1)
            }}
            className="explorer-select"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="explorer-table-container">
        <table className="explorer-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('storeName')} className="sortable">
                Store {sortField === 'storeName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('item')} className="sortable">
                Item {sortField === 'item' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('category')} className="sortable">
                Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('quantity')} className="sortable">
                Qty {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('subtotal')} className="sortable">
                Price {sortField === 'subtotal' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <motion.tr
                key={`${item.orderId}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.01 }}
                className="explorer-row"
              >
                <td className="date-cell">{formatDate(item.createdAt)}</td>
                <td className="store-cell">{item.storeName}</td>
                <td className="item-cell">{item.item}</td>
                <td className="category-cell">{item.category}</td>
                <td className="quantity-cell">{item.quantity}</td>
                <td className="price-cell">${item.subtotal.toFixed(2)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="explorer-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ◀ PREV
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            NEXT ▶
          </button>
        </div>
      )}

      <div className="explorer-footer">
        <button
          onClick={() => {
            const escapeCSV = (str: string) => {
              if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`
              }
              return str
            }
            
            const csv = [
              ['Date', 'Store', 'Item', 'Category', 'Quantity', 'Price', 'Address'].join(','),
              ...filteredAndSortedData.map(item => [
                item.createdAt.toISOString(),
                escapeCSV(item.storeName),
                escapeCSV(item.item),
                escapeCSV(item.category),
                item.quantity,
                item.subtotal,
                escapeCSV(item.deliveryAddress)
              ].join(','))
            ].join('\n')
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `doordash-data-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }}
          className="export-btn"
        >
          📥 EXPORT CSV
        </button>
      </div>
    </div>
  )
}

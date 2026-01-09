import Papa from 'papaparse'

export interface ProcessedOrderItem {
  item: string
  category: string
  storeName: string
  unitPrice: number
  quantity: number
  subtotal: number
  createdAt: Date
  deliveryTime: Date
  deliveryAddress: string
  orderId: string
}

export interface CSVRow {
  CREATED_AT: string
  DELIVERY_TIME: string
  ITEM: string
  CATEGORY: string
  STORE_NAME: string
  UNIT_PRICE: string
  QUANTITY: string
  SUBTOTAL: string
  DELIVERY_ADDRESS: string
  [key: string]: string
}

export function parseCSV(file: File): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors)
        }
        resolve(results.data as CSVRow[])
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

export function processOrderData(rawData: CSVRow[]): ProcessedOrderItem[] {
  return rawData.map(row => {
    const createdAt = new Date(row.CREATED_AT)
    const deliveryTime = new Date(row.DELIVERY_TIME)
    
    return {
      item: row.ITEM,
      category: row.CATEGORY,
      storeName: row.STORE_NAME,
      unitPrice: parseFloat(row.UNIT_PRICE) || 0,
      quantity: parseInt(row.QUANTITY) || 0,
      subtotal: parseFloat(row.SUBTOTAL) || 0,
      createdAt: createdAt,
      deliveryTime: deliveryTime,
      deliveryAddress: row.DELIVERY_ADDRESS,
      orderId: `${row.CREATED_AT}_${row.STORE_NAME}`.replace(/[^a-zA-Z0-9]/g, '_')
    }
  }).filter(row => !isNaN(row.createdAt.getTime()) && !isNaN(row.deliveryTime.getTime()))
}

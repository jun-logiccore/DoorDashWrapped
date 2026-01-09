export interface OrderItem {
  createdAt: Date;
  [key: string]: unknown;
}

export function getAvailableYears(orderData: OrderItem[]): number[] {
  const years = new Set<number>()
  orderData.forEach(item => {
    if (item.createdAt && !isNaN(item.createdAt.getTime())) {
      years.add(item.createdAt.getFullYear())
    }
  })
  return Array.from(years).sort((a, b) => b - a) // Most recent first
}

export function filterByYear(orderData: OrderItem[], year: number): OrderItem[] {
  // If year is 0, return all data (represents "all years")
  if (year === 0) {
    return orderData
  }
  return orderData.filter(item => {
    if (!item.createdAt || isNaN(item.createdAt.getTime())) {
      return false
    }
    return item.createdAt.getFullYear() === year
  })
}

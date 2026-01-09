import { ProcessedOrderItem } from './csvParser'

export interface Order {
  items: ProcessedOrderItem[]
  storeName: string
  createdAt: Date
  deliveryTime: Date
  total: number
}

export interface StoreStat {
  name: string
  orderCount: number
  totalSpent: number
  items: string[]
}

export interface ItemStat {
  name: string
  count: number
  totalSpent: number
  store: string
}

export interface CategoryStat {
  name: string
  count: number
  totalSpent: number
}

export interface MonthStat {
  month: string
  count: number
}

export interface CalculatedStats {
  totalSpent: number
  totalOrders: number
  totalItems: number
  avgOrderValue: number
  topStores: StoreStat[]
  topItems: ItemStat[]
  topCategories: CategoryStat[]
  peakHour: string
  peakDay: string
  avgDeliveryTime: number
  mostExpensiveOrder: Order
  cheapestOrder: Order
  firstOrder: Date
  lastOrder: Date
  monthStats: MonthStat[]
  longestStreak: number
  busiestMonth: string
  weekendOrders: number
  weekdayOrders: number
  lateNightOrders: number
  earlyMorningOrders: number
  avgItemsPerOrder: number
  mostFrequentStore: StoreStat
  totalDaysActive: number
  avgDaysBetweenOrders: number
}

export function calculateStats(orderData: ProcessedOrderItem[]): CalculatedStats | null {
  if (!orderData || orderData.length === 0) {
    return null
  }

  // Group items by order (same CREATED_AT and STORE_NAME)
  const orders: Record<string, Order> = {}
  orderData.forEach(item => {
    const orderKey = item.orderId
    if (!orders[orderKey]) {
      orders[orderKey] = {
        items: [],
        storeName: item.storeName,
        createdAt: item.createdAt,
        deliveryTime: item.deliveryTime,
        total: 0
      }
    }
    orders[orderKey].items.push(item)
    orders[orderKey].total += item.subtotal
  })

  const orderList = Object.values(orders)
  const totalSpent = orderList.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orderList.length
  const totalItems = orderData.reduce((sum, item) => sum + item.quantity, 0)

  // Store statistics
  const storeStats: Record<string, StoreStat> = {}
  orderList.forEach(order => {
    if (!storeStats[order.storeName]) {
      storeStats[order.storeName] = {
        name: order.storeName,
        orderCount: 0,
        totalSpent: 0,
        items: []
      }
    }
    storeStats[order.storeName].orderCount++
    storeStats[order.storeName].totalSpent += order.total
    order.items.forEach(item => {
      storeStats[order.storeName].items.push(item.item)
    })
  })

  const topStores = Object.values(storeStats)
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5)

  // Item statistics
  const itemStats: Record<string, ItemStat> = {}
  orderData.forEach(item => {
    if (!itemStats[item.item]) {
      itemStats[item.item] = {
        name: item.item,
        count: 0,
        totalSpent: 0,
        store: item.storeName
      }
    }
    itemStats[item.item].count += item.quantity
    itemStats[item.item].totalSpent += item.subtotal
  })

  const topItems = Object.values(itemStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Category statistics
  const categoryStats: Record<string, CategoryStat> = {}
  orderData.forEach(item => {
    if (!categoryStats[item.category]) {
      categoryStats[item.category] = {
        name: item.category,
        count: 0,
        totalSpent: 0
      }
    }
    categoryStats[item.category].count += item.quantity
    categoryStats[item.category].totalSpent += item.subtotal
  })

  const topCategories = Object.values(categoryStats)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)

  // Time analysis
  const hourStats: Record<number, number> = {}
  const dayStats: Record<string, number> = {}
  const monthStats: Record<string, number> = {}
  
  orderList.forEach(order => {
    const hour = order.createdAt.getHours()
    const day = order.createdAt.toLocaleDateString('en-US', { weekday: 'long' })
    const month = order.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    hourStats[hour] = (hourStats[hour] || 0) + 1
    dayStats[day] = (dayStats[day] || 0) + 1
    monthStats[month] = (monthStats[month] || 0) + 1
  })

  const peakHour = Object.entries(hourStats)
    .sort((a, b) => b[1] - a[1])[0]?.[0]
  const peakDay = Object.entries(dayStats)
    .sort((a, b) => b[1] - a[1])[0]?.[0]

  // Delivery time analysis
  const deliveryTimes = orderList.map(order => {
    const diff = order.deliveryTime.getTime() - order.createdAt.getTime()
    return diff / (1000 * 60) // minutes
  }).filter(time => time > 0 && time < 120) // filter outliers

  const avgDeliveryTime = deliveryTimes.length > 0
    ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
    : 0

  // Most expensive order
  const mostExpensiveOrder = orderList.reduce((max, order) => 
    order.total > max.total ? order : max, orderList[0])

  // Date range
  const dates = orderList.map(o => o.createdAt).sort((a, b) => a.getTime() - b.getTime())
  const firstOrder = dates[0]
  const lastOrder = dates[dates.length - 1]

  // Average order value
  const avgOrderValue = totalSpent / totalOrders

  // Cheapest order
  const cheapestOrder = orderList.reduce((min, order) => 
    order.total < min.total ? order : min, orderList[0])

  // Longest streak (consecutive days with orders)
  const orderDates = new Set(
    orderList.map(order => {
      const date = new Date(order.createdAt)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    })
  )
  const sortedDates = Array.from(orderDates).sort((a, b) => a - b)
  let longestStreak = 1
  let currentStreak = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24)
    if (daysDiff === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  // Busiest month
  const busiestMonth = Object.entries(monthStats)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  // Weekend vs Weekday
  let weekendOrders = 0
  let weekdayOrders = 0
  orderList.forEach(order => {
    const dayOfWeek = order.createdAt.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendOrders++
    } else {
      weekdayOrders++
    }
  })

  // Late night orders (10 PM - 2 AM)
  const lateNightOrders = orderList.filter(order => {
    const hour = order.createdAt.getHours()
    return hour >= 22 || hour < 2
  }).length

  // Early morning orders (5 AM - 9 AM)
  const earlyMorningOrders = orderList.filter(order => {
    const hour = order.createdAt.getHours()
    return hour >= 5 && hour < 9
  }).length

  // Average items per order
  const avgItemsPerOrder = totalItems / totalOrders

  // Most frequent store (by order count)
  const mostFrequentStore = topStores[0] || { name: 'N/A', orderCount: 0, totalSpent: 0, items: [] }

  // Total days active
  const totalDaysActive = orderDates.size

  // Average days between orders
  const timeSpan = lastOrder.getTime() - firstOrder.getTime()
  const daysSpan = timeSpan / (1000 * 60 * 60 * 24)
  const avgDaysBetweenOrders = totalOrders > 1 ? daysSpan / (totalOrders - 1) : 0

  return {
    totalSpent,
    totalOrders,
    totalItems,
    avgOrderValue,
    topStores,
    topItems,
    topCategories,
    peakHour: peakHour ? `${peakHour}:00` : 'N/A',
    peakDay: peakDay || 'N/A',
    avgDeliveryTime: Math.round(avgDeliveryTime),
    mostExpensiveOrder,
    cheapestOrder,
    firstOrder,
    lastOrder,
    monthStats: Object.entries(monthStats)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([month, count]) => ({ month, count })),
    longestStreak,
    busiestMonth,
    weekendOrders,
    weekdayOrders,
    lateNightOrders,
    earlyMorningOrders,
    avgItemsPerOrder: Math.round(avgItemsPerOrder * 10) / 10,
    mostFrequentStore,
    totalDaysActive,
    avgDaysBetweenOrders: Math.round(avgDaysBetweenOrders * 10) / 10
  }
}

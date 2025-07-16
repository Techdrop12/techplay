export function formatInvoiceData(order: any) {
  return {
    orderId: order.id,
    customerName: order.customerName,
    items: order.items.map((i: any) => ({
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
    total: order.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0),
  }
}

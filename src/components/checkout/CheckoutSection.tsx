import CheckoutForm from './CheckoutForm'
import OrderSummary from './OrderSummary'

export default function CheckoutSection({ total }: { total: number }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <CheckoutForm />
      <OrderSummary total={total} />
    </div>
  )
}

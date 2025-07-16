export default function LoadingProductCard() {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm p-4 animate-pulse">
      <div className="w-full h-40 bg-gray-200 mb-4 rounded" />
      <div className="h-4 bg-gray-300 w-2/3 rounded mb-2" />
      <div className="h-4 bg-gray-300 w-1/3 rounded" />
    </div>
  )
}

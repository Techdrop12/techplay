import Layout from './Layout'
import LiveChat from '../ui/LiveChat'

export default function LayoutWithChat({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Layout>{children}</Layout>
      <LiveChat />
    </>
  )
}

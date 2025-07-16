import Header from './Header'
import Footer from './Footer'
import Toast from '../ui/Toast'
import BannerPromo from '../home/BannerPromo'
import PWAInstall from './PWAInstall'
import ScrollTopButton from '../ui/ScrollTopButton'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <BannerPromo />
      <main>{children}</main>
      <PWAInstall />
      <ScrollTopButton />
      <Footer />
      <Toast />
    </>
  )
}

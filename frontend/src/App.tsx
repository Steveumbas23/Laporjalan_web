import Header from './Components/LandingPage/Header'
import Hero from './Components/LandingPage/Hero'
import About from './Components/LandingPage/About'
import Features from './Components/LandingPage/Features'
import MapSection from './Components/LandingPage/MAP'
import Footer from './Components/LandingPage/Footer'
import SignIn from './Components/AuthPage/SignIn'
import AdminSignIn from './Components/AuthPage/AdminSignIn'
import SignUp from './Components/AuthPage/SignUp'
import DashboardContent from './Components/Dashboard/DashboardContent'
import NotFound from './Components/Errors/NotFound'
import Forbidden from './Components/Errors/Forbidden'

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'

  if (pathname === '/signin') {
    return <SignIn />
  }

  if (pathname === '/admin/signin') {
    return <AdminSignIn />
  }

  if (pathname === '/signup') {
    return <SignUp />
  }

  if (pathname === '/forbidden') {
    return <Forbidden />
  }

  if (pathname.startsWith('/dashboard')) {
    return <DashboardContent />
  }

  if (pathname !== '/') {
    return <NotFound />
  }

  return (
    <>
      <Header />
      <Hero />
      <About />
      <Features />
      <MapSection />
      <Footer />
    </>
  )
}

export default App

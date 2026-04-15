import Header from './Components/LandingPage/Header'
import Hero from './Components/LandingPage/Hero'
import About from './Components/LandingPage/About'
import Features from './Components/LandingPage/Features'
import MapSection from './Components/LandingPage/MAP'
import SignIn from './Components/AuthPage/SignIn'
import AdminSignIn from './Components/AuthPage/AdminSignIn'
import SignUp from './Components/AuthPage/SignUp'
import DashboardContent from './Components/Dashboard/DashboardContent'

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

  if (pathname.startsWith('/dashboard')) {
    return <DashboardContent />
  }

  return (
    <>
      <Header />
      <Hero />
      <About />
      <Features />
      <MapSection />
    </>
  )
}

export default App

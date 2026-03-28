import Header from './Components/LandingPage/Header'
import MapSection from './Components/LandingPage/MAP'
import SignIn from './Components/AuthPage/SignIn'
import SignUp from './Components/AuthPage/SignUp'

function App() {
  const pathname = window.location.pathname

  if (pathname === '/signin') {
    return <SignIn />
  }

  if (pathname === '/signup') {
    return <SignUp />
  }

  return (
    <>
      <Header />
      <MapSection />
    </>
  )
}

export default App

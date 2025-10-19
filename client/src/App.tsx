
import './App.css'
import Header from './components/layout/header';
import { ThemeProvider } from './components/theme-provider';
import Home from './pages/Home';

function App() {

  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <Header />
        <Home />
    </ThemeProvider>
  )
}

export default App

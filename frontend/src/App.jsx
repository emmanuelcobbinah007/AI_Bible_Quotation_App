import './App.css'
import Header from './components/Header'
import DisplayBox from './components/DisplayBox'

function App() {

  return (
    <div className='bg-[#ECECEC] h-screen'>
    <div className='w-[80%] mx-auto font-poppins h-screen'>
      <Header />
      <DisplayBox />
    </div>
    </div>
  )
}

export default App

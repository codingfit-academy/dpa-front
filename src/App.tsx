import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DetailPage from './components/DetailPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/detail/:disease" element={<DetailPage />} />
    </Routes>
  );
}

export default App;

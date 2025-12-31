import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserChat from './components/UserChat';
import AdminPanel from './components/AdminPanel'; // El que ya creaste antes
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* La primera pantalla que ven es el LOGIN */}
        <Route path="/" element={<Login />} />
        
        {/* Pantalla de Registro */}
        <Route path="/register" element={<Register />} />
        
        {/* Pantalla del Usuario (Chat) */}
        <Route path="/chat" element={<UserChat />} />
        
        {/* Pantalla del Admin */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
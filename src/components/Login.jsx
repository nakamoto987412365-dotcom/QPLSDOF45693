import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Login = () => {
  const [creds, setCreds] = useState({ identifier: '', pass: '' });
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const usersRef = collection(db, "usuarios");
      
      // Búsqueda dual (Nombre o Email)
      let q = query(usersRef, where("nombre", "==", creds.identifier), where("pass", "==", creds.pass));
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        q = query(usersRef, where("email", "==", creds.identifier), where("pass", "==", creds.pass));
        querySnapshot = await getDocs(q);
      }

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // Si es ADMIN
        if (userData.rol === 'admin') {
           navigate('/admin');
           return;
        }

        // Si es USUARIO NORMAL pero INACTIVO (Mensaje Lluvia de Verano)
        if (userData.active !== true) {
          alert("EL PROTOCOLO DE AUTENTICACIÓN AÚN SIGUE ANALIZANDO TUS DATOS BIOMÉTRICOS //protocoloLluviaDeVerano");
          return;
        }

        localStorage.setItem('batmanUserId', userDoc.id);
        navigate('/chat');
        
      } else {
        // MENSAJE DE AMENAZA (Credenciales incorrectas)
        alert("NO SE QUIEN ERES PERO SI ESTAS INTENTANDO INICIAR SESIÓN AQUÍ PROCEDERÉ A HACKEAR ABSOLUTAMENTE TODO LO QUE TENGA ESTE DISPOSITIVO, PUBLICAR TUS CONTRASEÑAS Y REPORTAR ESTA CUENTA DE WHATSAPP CON LA POLICÍA POR CRÍMENES DE CIBERSEGURIDAD.");
      }
    } catch (error) {
      console.error(error);
      alert(">> ERROR DE CONEXIÓN AL SERVIDOR CUÁNTICO.");
    }
  };

  return (
    <div className="terminal-container login-center">
      <div className="login-box">
        <h1 style={{fontSize:'1.5rem'}}>QUANTUM SERVER<br/>// 7284GKLA //</h1>
        
        <span className="label">NOMBRE CLAVE</span>
        <input type="text" onChange={e => setCreds({...creds, identifier: e.target.value})} />
        
        <span className="label">CONTRASEÑA</span>
        <input type="password" onChange={e => setCreds({...creds, pass: e.target.value})} />
        
        <button onClick={handleLogin}>ESTABLECER CONEXIÓN</button>

        <div style={{marginTop: '25px', textAlign: 'center'}}>
          <Link to="/register" style={{color: '#666', textDecoration: 'none', fontSize: '0.8rem', borderBottom:'1px solid #333'}}>
            INICIAR NUEVA SOLICITUD
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
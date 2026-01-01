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

        // Si es USUARIO NORMAL pero INACTIVO
        if (userData.active !== true) {
          alert("EL PROTOCOLO DE AUTENTICACIÓN AÚN SIGUE ANALIZANDO TUS DATOS BIOMÉTRICOS //protocoloLluviaDeVerano");
          return;
        }

        localStorage.setItem('batmanUserId', userDoc.id);
        navigate('/chat');
        
      } else {
        // MENSAJE DE AMENAZA
        alert("NO SE QUIEN ERES PERO SI ESTAS INTENTANDO INICIAR SESIÓN AQUÍ, DEBES SABER QUE TUS INTENTOS HAN SIDO REGISTRADOS Y TU IP TAMBIEN\n\n" );
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
        
        {/* --- NUEVA SECCIÓN PERSONALIZADA --- */}
        <div style={{
            border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '10px',
            margin: '15px 0',
            fontSize: '0.75rem',
            textAlign: 'center',
            color: '#aaa',
            fontFamily: 'monospace',
            letterSpacing: '1px'
        }}>
            ESTO FUE DESARROLLADO Y PERSONALIZADO ÚNICAMENTE PARA LA USUARIO:
            <br/>
            <strong style={{color: '#fff', fontSize: '0.9rem', display:'block', marginTop:'5px'}}>
                ALEXANDRA LEYDI PONCE BOHÓRQUEZ
            </strong>
        </div>
        {/* ----------------------------------- */}

        <span className="label">NOMBRE CLAVE O CORREO</span>
        <input type="text" onChange={e => setCreds({...creds, identifier: e.target.value})} />
        
        <span className="label">CONTRASEÑA</span>
        <input type="password" onChange={e => setCreds({...creds, pass: e.target.value})} />
        
        <button onClick={handleLogin}>ESTABLECER CONEXIÓN</button>

        <div style={{marginTop: '25px', textAlign: 'center'}}>
          <Link to="/register" style={{color: '#666', textDecoration: 'none', fontSize: '0.8rem', borderBottom:'1px solid #333'}}>
            INICIAR NUEVA SOLICITUD PARA CREAR USUARIO
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
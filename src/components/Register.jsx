import { useState, useRef, useEffect } from 'react'; // <--- IMPORTAMOS useEffect
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { convertToBase64 } from '../utils';

const Register = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ nombre: '', email: '', password: '', foto: null });
  const [showPass, setShowPass] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);

  // --- NUEVA FUNCIÓN PARA APAGAR LA CÁMARA ---
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop()); // Detiene el hardware (luz verde)
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  };

  // --- EFECTO DE LIMPIEZA (Si el usuario cierra la página o vuelve atrás) ---
  useEffect(() => {
    return () => {
      stopCamera(); // Se asegura de apagarla al destruir el componente
    };
  }, []);

  // --- ACTIVAR CÁMARA ---
  const startCamera = async () => {
    try {
      setCameraOn(true);
      // Pequeño timeout para asegurar que el elemento video existe en el DOM
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error(err);
          setCameraOn(false);
          alert("No se pudo iniciar la cámara.");
        }
      }, 100);
    } catch (e) { alert("Error al solicitar cámara."); }
  };

  // --- CAPTURAR FOTO ---
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video) {
      canvas.width = video.videoWidth; 
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');
      setData({ ...data, foto: base64 });
      
      stopCamera(); // <--- APAGA LA CÁMARA INMEDIATAMENTE
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if(file) {
      stopCamera(); // Si sube archivo, apagamos cámara por si acaso
      const base64 = await convertToBase64(file);
      setData({ ...data, foto: base64 });
    }
  };

  // --- REGISTRO ---
  const handleRegister = async () => {
    stopCamera(); // Aseguramos apagado antes de enviar

    if(!data.nombre || !data.email || !data.password || !data.foto) {
      return alert(">> ERROR: DATOS INCOMPLETOS.");
    }

    try {
      const q = query(collection(db, "usuarios"), where("email", "==", data.email));
      const existing = await getDocs(q);
      if(!existing.empty) return alert(">> ERROR: IDENTIDAD YA REGISTRADA.");

      await addDoc(collection(db, "usuarios"), {
        nombre: data.nombre,
        email: data.email,
        pass: data.password,
        fotoBase64: data.foto,
        active: false,
        mensajes: [],
        fecha: new Date().toISOString()
      });
      
      alert(
        "------------------------------------------------\n" +
        ">> SOLICITUD DE ENLACE ENVIADA.\n" +
        ">> INICIANDO ESCANEO DE DATOS BIOMÉTRICOS...\n" +
        "ESTADO: ESPERANDO AUTORIZACIÓN (7284GKLA)." +
        "\n------------------------------------------------"
      );
      
      navigate('/');

    } catch (e) {
      alert("FALLO DEL SISTEMA: " + e.message);
    }
  };

  return (
    <div className="terminal-container login-center">
      <div className="login-box">
        <h2>REGISTRO DE USUARIO</h2>
        
        <span className="label">NOMBRE CLAVE</span>
        <input type="text" onChange={e => setData({...data, nombre: e.target.value})} />
        
        <span className="label">CORREO</span>
        <input type="email" onChange={e => setData({...data, email: e.target.value})} />

        <span className="label">CÓDIGO DE ACCESO (PASSWORD)</span>
        <div style={{position: 'relative'}}>
          <input 
            type={showPass ? "text" : "password"} 
            onChange={e => setData({...data, password: e.target.value})} 
            style={{paddingRight: '40px'}} 
          />
          <span 
            onClick={() => setShowPass(!showPass)}
            style={{position: 'absolute', right: '10px', top: '15px', cursor: 'pointer', color: '#e81c25', fontSize: '1.2rem'}}
          >
            {showPass ? '👁️' : '🔒'}
          </span>
        </div>

        <span className="label">RECONOCIMIENTO FACIAL (DATOS BIOMÉTRICOS DEL ROSTRO)</span>
        
        {!data.foto && !cameraOn && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              style={{background: '#111', border: '1px solid #333', fontSize:'0.8rem', color: '#ffffff'}} 
              onClick={startCamera}
            >
              [ ACTIVAR CÁMARA ]
            </button>
            <button 
              style={{background: '#111', border: '1px solid #333', fontSize:'0.8rem', color: '#ffffff'}} 
              onClick={() => fileInputRef.current.click()}
            >
              [ SUBIR ARCHIVO ]
            </button>
          </div>
        )}

        {cameraOn && (
          <div style={{textAlign:'center', marginBottom: '15px'}}>
            <video ref={videoRef} autoPlay style={{width:'100%', border:'1px solid #e81c25'}}></video>
            <div style={{display:'flex', gap:'10px', marginTop:'5px'}}>
              <button onClick={capturePhoto}>CAPTURAR</button>
              {/* Botón para cancelar solo la cámara */}
              <button onClick={stopCamera} style={{background:'#333', color:'#fff'}}>CANCELAR CÁMARA</button>
            </div>
          </div>
        )}

        {data.foto && (
          <div style={{textAlign:'center', marginBottom:'20px'}}>
            <img src={data.foto} width="150" alt="Preview" />
            <br/>
            <button onClick={() => setData({...data, foto: null})} style={{marginTop:'5px', background:'#111', border:'1px solid #333', color:'#666', fontSize:'0.7rem', width:'auto', padding:'5px 10px'}}>
              ELIMINAR
            </button>
          </div>
        )}
        
        <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={handleFile} accept="image/*" />

        <button onClick={handleRegister} style={{marginTop: '20px'}}>
          INICIAR PROTOCOLO DE AUTENTICACIÓN
        </button>
        
        <button onClick={() => { stopCamera(); navigate('/'); }} style={{marginTop: '10px', background: 'transparent', color: '#666'}}>
          CANCELAR
        </button>
        
        <canvas ref={canvasRef} style={{display:'none'}}></canvas>
      </div>
    </div>
  );
};

export default Register;
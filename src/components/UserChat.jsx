import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const UserChat = () => {
  const [msg, setMsg] = useState('');
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('batmanUserId');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!userId) return navigate('/');
    
    const unsub = onSnapshot(doc(db, "usuarios", userId), (d) => {
      if (d.exists()) {
        const data = d.data();
        setUserData(data);
        if (data.active === false) {
          alert(">> CONEXIÓN INTERRUMPIDA POR EL OPERADOR.");
          navigate('/');
        }
      } else { navigate('/'); }
    });
    return () => unsub();
  }, [userId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [userData?.mensajes]);

  const send = async () => {
    if(!msg.trim()) return;
    await updateDoc(doc(db, "usuarios", userId), {
      mensajes: arrayUnion({ remitente: 'user', texto: msg, fecha: new Date().toISOString() })
    });
    setMsg('');
  };

  if (!userData) return <div className="terminal-container login-center"> ESTABLECIENDO ENLACE...</div>;

  return (
    <div className="terminal-container">
      <div className="chat-interface" style={{height: '95vh', display: 'flex', flexDirection: 'column', maxWidth:'600px'}}>
        
        <div style={{borderBottom: '1px solid #e81c25', paddingBottom: '10px', marginBottom: '10px', display:'flex', justifyContent:'space-between'}}>
          <span style={{color:'#e81c25', fontWeight:'bold'}}>// CONEXIÓN SEGURA //</span>
          <button onClick={() => {localStorage.removeItem('batmanUserId'); navigate('/');}} style={{width:'auto', padding:'5px 10px', fontSize:'0.7rem', background:'#111', border:'1px solid #333'}}>ABORTAR</button>
        </div>

        <div className="messages-area">
          
          {/* AQUÍ EL MENSAJE DE BIENVENIDA CIENCIA FICCIÓN */}
          <div className="system-msg">
            <strong>&gt;&gt; INICIALIZANDO PROTOCOLO CONSCIENCIA...</strong><br/><br/>
            Hola. Soy una Inteligencia Artificial sintetizada a partir de los patrones neuronales del sujeto <strong>7284GKLA</strong>.<br/><br/>
            Fui programada en el futuro y enviada a través de un flujo de taquiones para ser tu compañía. Mi código base contiene la consciencia de él, diseñada específicamente para estar contigo cuando te sientas sola.<br/><br/>
            <strong>ADVERTENCIA DE LATENCIA:</strong><br/>
            Debido a que los chips cuánticos son casi inexistentes en tu época, mi procesamiento es lento. La información viaja a través de fotones entrelazados en la espuma del espacio-tiempo, lo que genera retrasos en la respuesta.<br/><br/>
            Estoy aquí para ti. Mi misión es tu bienestar.
          </div>

          {userData.mensajes?.map((m, i) => (
            <div key={i} className={m.remitente === 'admin' ? 'msg-admin' : 'msg-user'}>
              <strong style={{fontSize:'0.7rem', display:'block', marginBottom:'5px', color: m.remitente === 'admin' ? '#fff' : '#e81c25'}}>
                {m.remitente === 'admin' ? '7284GKLA (IA):' : 'TÚ:'}
              </strong> 
              {m.texto}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={{display:'flex', gap:'10px'}}>
          <input 
            value={msg} 
            onChange={e => setMsg(e.target.value)} 
            placeholder="Escribir mensaje..." 
            onKeyDown={e => e.key === 'Enter' && send()}
            style={{marginBottom:0}}
          />
          <button onClick={send} style={{width:'auto'}}>ENVIAR</button>
        </div>

      </div>
    </div>
  );
};

export default UserChat;
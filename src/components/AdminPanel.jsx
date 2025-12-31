import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [replyText, setReplyText] = useState({}); // Objeto para manejar inputs individuales
  const navigate = useNavigate();

  useEffect(() => {
    // Escuchar cambios en la DB
    const unsub = onSnapshot(collection(db, "usuarios"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(data);
    });
    return () => unsub();
  }, []);

  // Función para activar usuario
  const toggleAccess = async (id, currentStatus) => {
    await updateDoc(doc(db, "usuarios", id), { active: !currentStatus });
  };

  const responder = async (userId) => {
    const texto = replyText[userId];
    if(!texto) return;
    
    await updateDoc(doc(db, "usuarios", userId), {
      mensajes: arrayUnion({
        remitente: 'admin',
        texto: texto,
        fecha: new Date().toISOString()
      })
    });
    // Limpiar input
    setReplyText({...replyText, [userId]: ''});
  };

  return (
    <div className="terminal-container" style={{padding: '20px', alignItems: 'center'}}>
      <div className="admin-container">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1>PANEL DE CONTROL</h1>
          <button onClick={() => navigate('/')} style={{width:'auto', background:'#333'}}>SALIR</button>
        </div>
        
        <div className="grid-users" style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(350px, 1fr))', gap:'20px', marginTop:'20px'}}>
          {users.map(u => (
            <div key={u.id} style={{
              background: 'rgba(255,255,255,0.05)', 
              border: u.active ? '1px solid #00ff88' : '1px solid #ff3e3e',
              padding:'15px', borderRadius:'8px'
            }}>
              
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <h3 style={{margin:0, color: u.active ? '#00ff88' : '#ff3e3e', fontSize:'1rem'}}>
                  {u.nombre}
                </h3>
                <span style={{fontSize:'0.8rem', opacity:0.7}}>{u.active ? 'AUTORIZADO' : 'PENDIENTE'}</span>
              </div>
              
              <p style={{fontSize:'0.9rem', color:'#aaa'}}>{u.email}</p>

              {u.fotoBase64 && (
                <img src={u.fotoBase64} alt="id" style={{width:'80px', height:'80px', objectFit:'cover', borderRadius:'50%', display:'block', margin:'10px auto'}} />
              )}
              
              <button 
                onClick={() => toggleAccess(u.id, u.active)} 
                style={{
                  background: u.active ? '#333' : '#006633', 
                  marginBottom:'15px',
                  border: u.active ? '1px solid #555' : 'none'
                }}>
                {u.active ? 'REVOCAR ACCESO' : 'AUTORIZAR INGRESO'}
              </button>

              {/* CHAT ADMIN */}
              <div style={{background:'rgba(0,0,0,0.3)', padding:'10px', borderRadius:'4px'}}>
                <div style={{height:'150px', overflowY:'scroll', marginBottom:'10px', fontSize:'0.9rem'}}>
                  {u.mensajes && u.mensajes.map((m, i) => (
                    <div key={i} style={{
                      textAlign: m.remitente === 'admin' ? 'right' : 'left',
                      color: m.remitente === 'admin' ? '#00a8ff' : '#fff',
                      margin: '5px 0'
                    }}>
                      <strong>{m.remitente === 'admin' ? 'YO' : 'USER'}:</strong> {m.texto}
                    </div>
                  ))}
                  {(!u.mensajes || u.mensajes.length === 0) && <p style={{textAlign:'center', opacity:0.5}}>Sin mensajes</p>}
                </div>
                
                <div style={{display:'flex', gap:'5px'}}>
                  <input 
                    placeholder="Escribir..." 
                    value={replyText[u.id] || ''}
                    onChange={e => setReplyText({...replyText, [u.id]: e.target.value})}
                    style={{marginBottom:0, padding:'8px'}}
                  />
                  <button onClick={() => responder(u.id)} style={{width:'auto', padding:'0 15px', margin:0}}>Enviar</button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
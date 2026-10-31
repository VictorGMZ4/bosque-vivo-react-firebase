import React,{useState} from 'react';
import {Link,NavLink} from 'react-router-dom';
import {signOut} from 'firebase/auth';
import {auth,local,messageFor} from './firebase';
import {useAuth} from './auth';
import {Icon} from './ui/Icon';

export function SiteHeader({welcome=false,menuOpen=false,onMenuOpen,menuButtonRef}){
 const {user,ready,admin,teacher}=useAuth(),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function leave(){setBusy(true);setError('');try{await signOut(auth);}catch(e){setError(messageFor(e));}finally{setBusy(false);}}
 return <><header className={`site-header${welcome?' welcome-header':''}`}><div className="shell primary-bar">
  <Link className="brand" to="/" aria-label="Flora Viva · Inicio"><span className="brand-mark"><img src="/images/brand-flower-outlined.webp" alt="" width="44" height="44"/></span><span>Flora Viva<small>BOSQUE VERDE · UNIPAZ</small></span></Link>
  {!welcome&&<><button ref={menuButtonRef} className="rail-menu-button" type="button" aria-expanded={menuOpen} aria-controls="side-rail" onClick={onMenuOpen}><Icon name="menu"/><span>Menú</span></button><nav className="primary-links" aria-label="Navegación principal"><NavLink to="/catalogo/">Colección</NavLink>{admin&&<NavLink to="/gestion/">Administración</NavLink>}{teacher&&<NavLink to="/gestion/">Mis especies</NavLink>}{user&&<NavLink to="/propuestas/">{admin||teacher?'Revisiones':'Mis propuestas'}</NavLink>}{admin&&<NavLink to="/usuarios/">Usuarios</NavLink>}</nav>
  <div className="account-actions">{!ready?<span className="muted" role="status">Cargando cuenta…</span>:user?<><NavLink className="profile-link" to="/perfil/"><Icon name="user"/><span>Mi perfil</span></NavLink><button className="session-exit" aria-label="Cerrar sesión" onClick={leave} disabled={busy}><Icon name="exit"/><span>{busy?'Saliendo…':'Cerrar sesión'}</span></button></>:<Link className="button access-link" to="/ingresar/">Acceso al equipo<Icon name="arrow"/></Link>}</div>
 </>}</div></header>
 {local&&<div className="local-banner"><span className="local-dot"/>Evaluación local · Firebase emulado · Sin conexión a producción</div>}{error&&<p className="shell notice error" role="alert">{error}</p>}</>;
}

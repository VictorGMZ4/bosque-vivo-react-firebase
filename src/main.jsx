import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route,Link,NavLink,useLocation} from 'react-router-dom';
import {AuthProvider} from './auth';
import {CampusWelcome} from './CampusWelcome';
import {CollectionTransition} from './CollectionTransition';
import {Catalog} from './pages/Catalog';
const Explore=React.lazy(()=>import('./pages/Explore').then(module=>({default:module.Explore})));
const Detail=React.lazy(()=>import('./pages/Detail').then(module=>({default:module.Detail})));
const adminPage=name=>React.lazy(()=>import('./pages/Admin').then(module=>({default:module[name]})));
const Dashboard=adminPage('Dashboard'),SpeciesEditor=adminPage('SpeciesEditor'),SpecimenEditor=adminPage('SpecimenEditor'),DeleteSpecies=adminPage('DeleteSpecies');
import './styles.css';
import './account.css';
import './welcome-qr.css';
import {SiteHeader} from './SiteHeader';
import {SiteFooter} from './SiteFooter';
import {About} from './pages/About';
import './refresh.css';
import {Offline} from './pages/Offline';
import {registerOfflineWorker} from './offline';
const Feature=(path,name)=>React.lazy(()=>path().then(module=>({default:module[name]})));
const Collections=Feature(()=>import('./pages/Collections'),'Collections'),Compare=Feature(()=>import('./pages/Collections'),'Compare');
const Learning=Feature(()=>import('./pages/Learning'),'Learning');
const Notifications=Feature(()=>import('./pages/Activity'),'Notifications'),History=Feature(()=>import('./pages/Activity'),'History');
const ProposalEditor=Feature(()=>import('./pages/ProposalEditor'),'ProposalEditor');

const communityPage=name=>React.lazy(()=>import('./pages/Community').then(module=>({default:module[name]})));
const accountPage=name=>Feature(()=>import('./pages/Account'),name);
const Login=accountPage('Login'),Profile=accountPage('Profile'),Register=accountPage('Register');
const Submissions=communityPage('Submissions'),Users=communityPage('Users');
function Layout(){const location=useLocation(),passport=/^\/especies\/[^/]+\/explorar\/?$/.test(location.pathname);React.useEffect(()=>{window.scrollTo(0,0);},[location.pathname]);React.useEffect(()=>{const keyboard=()=>{document.documentElement.dataset.input='keyboard';},pointer=()=>{document.documentElement.dataset.input='pointer';};window.addEventListener('keydown',keyboard,true);window.addEventListener('pointerdown',pointer,true);return()=>{window.removeEventListener('keydown',keyboard,true);window.removeEventListener('pointerdown',pointer,true);};},[]);return <div className={passport?'passport-layout':location.pathname==='/'?'home-layout':location.pathname==='/catalogo/'?'catalog-layout':undefined}><a className="skip" href="#contenido">Saltar al contenido</a>{!passport&&<SiteHeader welcome={location.pathname==='/'}/>}<main id="contenido" className={passport?'passport-shell':'shell'}><React.Suspense fallback={<p role="status">Cargando pantalla…</p>}><Routes><Route path="/especies/:id/explorar/" element={<Explore/>}/><Route path="/sobre-el-proyecto/" element={<About/>}/><Route path="/mi-coleccion/" element={<Collections/>}/><Route path="/comparar/" element={<Compare/>}/><Route path="/aprender/" element={<Learning/>}/><Route path="/notificaciones/" element={<Notifications/>}/><Route path="/historial/" element={<History/>}/><Route path="/propuestas/:id/corregir/" element={<ProposalEditor/>}/><Route path="/perfil/" element={<Profile/>}/><Route path="/registro/" element={<Register/>}/><Route path="/propuestas/" element={<Submissions/>}/><Route path="/propuestas/nueva/" element={<ProposalEditor/>}/><Route path="/usuarios/" element={<Users/>}/><Route path="/" element={<CampusWelcome/>}/><Route path="/catalogo/" element={<Catalog/>}/><Route path="/especies/:id/" element={<Detail/>}/><Route path="/ingresar/" element={<Login/>}/><Route path="/gestion/" element={<Dashboard/>}/><Route path="/gestion/especies/nueva/" element={<SpeciesEditor/>}/><Route path="/gestion/especies/:id/editar/" element={<SpeciesEditor/>}/><Route path="/gestion/especies/:id/eliminar/" element={<DeleteSpecies/>}/><Route path="/gestion/especies/:speciesId/ejemplares/nuevo/" element={<SpecimenEditor/>}/><Route path="/gestion/especies/:speciesId/ejemplares/:id/editar/" element={<SpecimenEditor/>}/><Route path="*" element={<section><h1>Página no encontrada</h1><Link to="/catalogo/">Volver a la colección</Link></section>}/></Routes></React.Suspense></main>{!passport&&location.pathname!=='/'&&<SiteFooter/>}</div>;}
function App(){const location=useLocation(),[online,setOnline]=React.useState(navigator.onLine);React.useEffect(()=>{const update=()=>setOnline(navigator.onLine);window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update);};},[]);return !online||location.pathname==='/sin-conexion/'?<main className="shell py-8"><Offline/></main>:<AuthProvider><CollectionTransition><Layout/></CollectionTransition></AuthProvider>;}
registerOfflineWorker();
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);

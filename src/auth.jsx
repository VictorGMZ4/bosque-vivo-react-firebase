import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import {onIdTokenChanged,signOut} from 'firebase/auth';
import {doc,onSnapshot} from 'firebase/firestore';
import {useNavigate} from 'react-router-dom';
import {auth,db,messageFor,blockedMessage} from './firebase';
const AuthContext=createContext();
export const roleLabels={student:'Estudiante o Visitante',teacher:'Profesor',researcher:'Investigador',admin:'Admin'};
export function AuthProvider({children}){
 const navigate=useRef();navigate.current=useNavigate();const [state,setState]=useState({ready:false,user:null,role:'student',admin:false,teacher:false,error:''});
 useEffect(()=>{let stopRole=()=>{},generation=0,notice='';
  const stop=onIdTokenChanged(auth,async user=>{const current=++generation;stopRole();setState({ready:false,user:null,role:'student',admin:false,teacher:false,error:''});
   if(!user){setState({ready:true,user:null,role:'student',admin:false,teacher:false,error:notice});notice='';return;}
   try{const token=await user.getIdTokenResult();if(current!==generation)return;
    stopRole=onSnapshot(doc(db,'roles',user.uid),snapshot=>{if(current!==generation)return;if(snapshot.data()?.disabled===true){notice=blockedMessage;signOut(auth);navigate.current('/ingresar/',{replace:true});return;}const role=snapshot.exists()?snapshot.data().role:token.claims.admin===true?'admin':'student';setState({ready:true,user,role,admin:role==='admin',teacher:role==='teacher'||role==='researcher',error:''});},error=>{if(current===generation)setState({ready:true,user,role:'student',admin:false,teacher:false,error:messageFor(error)});});
   }catch(error){if(current===generation)setState({ready:true,user:null,role:'student',admin:false,teacher:false,error:messageFor(error)});}
  });return()=>{generation++;stop();stopRole();};
 },[]);return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);

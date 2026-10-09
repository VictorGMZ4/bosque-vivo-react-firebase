import React,{createContext,useContext,useEffect,useState} from 'react';
import {onIdTokenChanged} from 'firebase/auth';
import {doc,onSnapshot} from 'firebase/firestore';
import {auth,db,messageFor} from './firebase';
const AuthContext=createContext();
export const roleLabels={student:'Estudiante o Visitante',teacher:'Profesor o Investigador',admin:'Admin'};
export function AuthProvider({children}){
 const [state,setState]=useState({ready:false,user:null,role:'student',admin:false,teacher:false,error:''});
 useEffect(()=>{let stopRole=()=>{},generation=0;
  const stop=onIdTokenChanged(auth,async user=>{const current=++generation;stopRole();setState({ready:false,user:null,role:'student',admin:false,teacher:false,error:''});
   if(!user){setState({ready:true,user:null,role:'student',admin:false,teacher:false,error:''});return;}
   try{const token=await user.getIdTokenResult();if(current!==generation)return;
    stopRole=onSnapshot(doc(db,'roles',user.uid),snapshot=>{if(current!==generation)return;const role=snapshot.exists()?snapshot.data().role:token.claims.admin===true?'admin':'student';setState({ready:true,user,role,admin:role==='admin',teacher:role==='teacher',error:''});},error=>{if(current===generation)setState({ready:true,user,role:'student',admin:false,teacher:false,error:messageFor(error)});});
   }catch(error){if(current===generation)setState({ready:true,user:null,role:'student',admin:false,teacher:false,error:messageFor(error)});}
  });return()=>{generation++;stop();stopRole();};
 },[]);return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);

import React from 'react';
import {auth,provider} from '../firebase';
import {signInWithEmailAndPassword,createUserWithEmailAndPassword,signInWithPopup} from 'firebase/auth';

export default function SignIn(){
  const signInWithGoogle = async ()=> {
    await signInWithPopup(auth,provider);
  };

  const signUp = async (email,password)=> {
    await createUserWithEmailAndPassword(auth,email,password);
  };

  const signIn = async (email,password)=> {
    await signInWithEmailAndPassword(auth,email,password);
  };

  return (
    <div className='auth'>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      {/* Minimal email sign-in form for quickstart; integrate proper form/validation in prod */}
      <div style={{marginTop:12}}>
        <small>Or use email/password via your own UI (see docs).</small>
      </div>
    </div>
  );
}

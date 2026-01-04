"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setNote("");

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) return setErr(error.message);

    setNote("Account created. Check your email to confirm, then come back and sign in.");
    // don’t auto-push to dashboard if email confirmation is on
  }

  return (
    <div style={s.bg}>
      <div style={s.card}>
        <div style={s.brand}>Create account</div>
        <div style={s.sub}>Secure access for Royal Treasury.</div>

        <form onSubmit={onSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />

          <label style={s.label}>Password (12+ chars)</label>
          <input style={s.input} value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required minLength={12} />

          <button style={s.btn} type="submit">Create Account</button>
          <div style={s.ok}>{note}</div>
          <div style={s.err}>{err}</div>
        </form>

        <div style={s.row}>
          <a style={s.link} href="/login">Back to login</a>
        </div>
      </div>
    </div>
  );
}

const s = {
  bg:{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f6f1e3",padding:18},
  card:{width:"min(460px,92vw)",background:"#fff",border:"2px solid #e8d9b7",borderRadius:18,padding:22,boxShadow:"0 12px 30px rgba(0,0,0,.12)"},
  brand:{fontSize:22,fontWeight:900},
  sub:{marginTop:6,color:"#5a5a5a"},
  label:{display:"block",margin:"14px 0 6px",fontSize:13,color:"#5a5a5a"},
  input:{width:"100%",padding:12,borderRadius:12,border:"1px solid #d9d2c3"},
  btn:{marginTop:14,width:"100%",padding:12,borderRadius:12,border:0,fontWeight:900,background:"linear-gradient(180deg,#d7c08a,#b08d57)",cursor:"pointer"},
  ok:{minHeight:20,color:"#1b7f3a",marginTop:10,fontSize:13},
  err:{minHeight:20,color:"#b00020",marginTop:6,fontSize:13},
  row:{display:"flex",justifyContent:"space-between",marginTop:12},
  link:{color:"#7a5b2b",fontWeight:900,textDecoration:"none"}
};
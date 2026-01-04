"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setErr(error.message);

    r.push("/dashboard");
  }

  return (
    <div style={s.bg}>
      <div style={s.card}>
        <div style={s.brand}>Royal Treasury</div>
        <div style={s.sub}>Sign in to your dashboard.</div>

        <form onSubmit={onSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />

          <label style={s.label}>Password</label>
          <input style={s.input} value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />

          <button style={s.btn} type="submit">Sign In</button>
          <div style={s.err}>{err}</div>
        </form>

        <div style={s.row}>
          <a style={s.link} href="/signup">Create account</a>
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
  err:{minHeight:20,color:"#b00020",marginTop:10,fontSize:13},
  row:{display:"flex",justifyContent:"space-between",marginTop:12},
  link:{color:"#7a5b2b",fontWeight:900,textDecoration:"none"}
};
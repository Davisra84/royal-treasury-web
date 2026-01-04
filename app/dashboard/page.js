"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("Loading…");
  const [unitToken, setUnitToken] = useState("");
  const [unitReady, setUnitReady] = useState(false);

  // Load Unit web components script (Sandbox)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__unitLoaded) {
      setUnitReady(true);
      return;
    }

    const s = document.createElement("script");
    s.async = true;
    s.src = "https://ui.s.unit.sh/release/latest/components-extended.js"; // SANDBOX
    s.onload = () => {
      window.__unitLoaded = true;
      setUnitReady(true);
    };
    s.onerror = () => setMsg("Failed to load Unit web components script.");
    document.head.appendChild(s);
  }, []);

  // Keep session + fetch Unit JWT
  useEffect(() => {
    let sub;

    async function init(session) {
      setEmail(session.user.email || "");

      const res = await fetch("/api/unit/jwt", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        setMsg(json.error || "Unable to create Unit JWT.");
        return;
      }

      setUnitToken(json.token);
      setMsg("Banking ready.");
    }

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        r.push("/login");
        return;
      }
      await init(data.session);

      const { data: s } = supabase.auth.onAuthStateChange(async (_evt, session) => {
        if (!session) r.push("/login");
      });
      sub = s?.subscription;
    })();

    return () => sub?.unsubscribe?.();
  }, [r]);

  async function logout() {
    await supabase.auth.signOut();
    r.push("/login");
  }

  return (
    <div style={s.bg}>
      <div style={s.top}>
        <div>
          <div style={s.title}>Royal Treasury Dashboard</div>
          <div style={s.sub}>Signed in as <b>{email}</b></div>
        </div>
        <button style={s.btnOutline} onClick={logout}>Sign out</button>
      </div>

      <div style={s.grid}>
        <div style={s.card}>
          <div style={s.cardTitle}>Quick Actions</div>
          <div style={s.actions}>
            <button style={s.btn}>Add funds</button>
            <button style={s.btn}>Pay vendors</button>
            <button style={s.btn}>Payroll</button>
          </div>
          <div style={s.status}>{msg}</div>
        </div>

        <div style={s.cardWide}>
          <div style={s.cardTitle}>Digital Banking</div>

          <div style={s.embedBox}>
            {!unitReady ? (
              <div style={s.small}>Loading banking components…</div>
            ) : !unitToken ? (
              <div style={s.small}>Creating secure Unit session…</div>
            ) : (
              <unit-elements-white-label-app jwt-token={unitToken}></unit-elements-white-label-app>
            )}
          </div>

          <div style={s.small2}>
            Your Corporate Banking Experience Starts Here.
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  bg:{minHeight:"100vh",background:"#111",padding:18},
  top:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,maxWidth:1200,margin:"0 auto 14px"},
  title:{color:"#f6f1e3",fontSize:20,fontWeight:900},
  sub:{color:"#d7c08a",fontSize:13},
  btnOutline:{padding:"10px 14px",borderRadius:12,border:"1px solid #b08d57",background:"transparent",color:"#f6f1e3",fontWeight:800,cursor:"pointer"},
  grid:{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 2fr",gap:14},
  card:{background:"#1b1b1b",border:"2px solid #b08d57",borderRadius:18,padding:16},
  cardWide:{background:"#1b1b1b",border:"2px solid #b08d57",borderRadius:18,padding:16,minHeight:620},
  cardTitle:{color:"#f6f1e3",fontWeight:900,marginBottom:10},
  actions:{display:"flex",gap:10,flexWrap:"wrap"},
  btn:{padding:"10px 12px",borderRadius:12,border:0,fontWeight:900,background:"linear-gradient(180deg,#d7c08a,#b08d57)",cursor:"pointer"},
  status:{marginTop:12,color:"#aaa",fontSize:13},
  embedBox:{marginTop:10,background:"#0f0f0f",border:"1px solid #333",borderRadius:16,minHeight:520,padding:12,color:"#aaa",overflow:"hidden"},
  small:{fontSize:13,color:"#cfcfcf"},
  small2:{marginTop:12,fontSize:13,color:"#cfcfcf",lineHeight:1.4}
};

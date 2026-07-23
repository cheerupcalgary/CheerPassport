import React, { useState } from "react";

// ── TYPES ─────────────────────────────────────────────────────────────────────
type Athlete = {
  id: string;
  name: string;
  team: string;
  level: number;
  points: number;
  gym: string;
  reportCards?: any[];
};

type User = {
  name: string;
  role: string;
  gym?: string;
};

type Team = {
  id: string;
  name: string;
  level: string;
  ageGroup: string;
  schedule: string;
  coachName: string;
};

type ShopItem = {
  id: string;
  name: string;
  cost: number;
  icon: string;
  stock: number;
  desc: string;
  imageUrl: string;
};

type Order = {
  id: string;
  itemName: string;
  athleteName: string;
  athleteTeam: string;
  cost: number;
  status: string;
  orderedDate: string;
  icon?: string;
};

// ── THEME & STYLES ────────────────────────────────────────────────────────────
const F = "sans-serif";
const FC = "sans-serif";
const GS = `* { box-sizing: border-box; margin: 0; padding: 0; }`;

const T = {
  black: "#111111",
  dark: "#333333",
  muted: "#666666",
  faint: "#888888",
  border: "#eeeeee",
  s1: "#f9f9f9",
  s2: "#f0f0f0",
};

const inpS: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: `1px solid ${T.border}`,
  borderRadius: 3,
  fontFamily: F,
  fontSize: 12,
  outline: "none",
  background: "#ffffff",
};

const inp = () => inpS;

// ── INITIAL DATA ──────────────────────────────────────────────────────────────
const SPIRIT_SOFT = [
  { id: "sp1", name: "Team Player", desc: "Encouraging teammates during practice", pts: 25, icon: "★" },
  { id: "sp2", name: "Hardest Worker", desc: "Pushed through a tough workout", pts: 50, icon: "🔥" },
];

const REPORT_CATS = ["Stunting", "Tumbling", "Jumps", "Dance", "Work Ethic"];

const INIT_ATHLETES: Athlete[] = [
  { id: "a1", name: "Ava Smith", team: "Senior Elite", level: 5, points: 450, gym: "Dynasty Athletics", reportCards: [] },
  { id: "a2", name: "Mia Johnson", team: "Junior Coed", level: 3, points: 280, gym: "Dynasty Athletics", reportCards: [] },
];

const GYM_CONFIGS: Record<string, { primary: string; secondary: string; name: string; contactEmail: string }> = {
  "Dynasty Athletics": { primary: "#111111", secondary: "#f0c040", name: "Dynasty Athletics", contactEmail: "info@dynasty.com" },
};

// ── PRIMITIVE UI COMPONENTS (TYPED) ───────────────────────────────────────────
const Title: React.FC<{ children: React.ReactNode; accent?: string }> = ({ children, accent }) => (
  <h2 style={{ fontFamily: FC, fontSize: 22, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, color: accent || T.black }}>
    {children}
  </h2>
);

const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontFamily: F, fontSize: 12, color: T.faint, marginBottom: 16 }}>{children}</p>
);

const Lbl: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ display: "block", fontFamily: F, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: T.dark, marginBottom: 6 }}>
    {children}
  </label>
);

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ border: `1px solid ${T.border}`, borderRadius: 4, padding: 16, background: "#ffffff", ...style }}>
    {children}
  </div>
);

const Toast: React.FC<{ msg: string; dark?: boolean }> = ({ msg, dark }) => (
  <div style={{ position: "fixed", bottom: 20, right: 20, background: dark ? "#111" : "#333", color: "#fff", padding: "10px 18px", borderRadius: 4, fontFamily: F, fontSize: 12, zIndex: 9999 }}>
    {msg}
  </div>
);

const GymBand: React.FC<{ gymName: string; onLogout: () => void; userRole: string }> = ({ gymName, onLogout, userRole }) => (
  <div style={{ background: "#111111", color: "#ffffff", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div style={{ fontFamily: FC, fontSize: 16, fontWeight: 800, textTransform: "uppercase" }}>{gymName}</div>
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <span style={{ fontFamily: F, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{userRole}</span>
      <button onClick={onLogout} style={{ background: "transparent", border: "1px solid #444", color: "#fff", padding: "4px 8px", cursor: "pointer", borderRadius: 3, fontFamily: F, fontSize: 10 }}>Logout</button>
    </div>
  </div>
);

const ShopView: React.FC<{ gymName?: string; editable?: boolean; accentColor?: string; shopItems?: ShopItem[]; setShopItems?: React.Dispatch<React.SetStateAction<ShopItem[]>> }> = () => (
  <Card style={{ marginBottom: 16 }}>
    <Title>Pro Shop</Title>
    <Sub>Reward items available for purchase with points.</Sub>
  </Card>
);

const LoginScreen: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => (
  <div style={{ padding: 40, textAlign: "center", fontFamily: F }}>
    <Title>Cheer Passport Login</Title>
    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
      <button onClick={() => onLogin({ name: "Coach Sarah", role: "owner", gym: "Dynasty Athletics" })} style={{ padding: "10px 20px", cursor: "pointer" }}>Login as Owner/Coach</button>
      <button onClick={() => onLogin({ name: "Admin", role: "platform_admin" })} style={{ padding: "10px 20px", cursor: "pointer" }}>Login as Platform Admin</button>
    </div>
  </div>
);

const AthleteView: React.FC<{ user: User; athletes: Athlete[]; setAthletes: any; shopItems: ShopItem[]; setShopItems: any; orders: Order[]; setOrders: any; onLogout: () => void }> = ({ user, onLogout }) => (
  <div style={{ padding: 20, fontFamily: F }}>
    <GymBand gymName={user.gym || "Gym"} onLogout={onLogout} userRole="Athlete / Parent" />
    <div style={{ padding: 20 }}><Title>Welcome, {user.name}</Title></div>
  </div>
);

// ── COACH VIEW COMPONENT ──────────────────────────────────────────────────────
interface CoachViewProps {
  user: User;
  athletes: Athlete[];
  setAthletes: React.Dispatch<React.SetStateAction<Athlete[]>>;
  shopItems: ShopItem[];
  setShopItems: React.Dispatch<React.SetStateAction<ShopItem[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onLogout: () => void;
}

function CoachView({ user, athletes, setAthletes, shopItems, setShopItems, orders, setOrders, onLogout }: CoachViewProps) {
  const isOwner = user.role === "owner";
  const ac = user.gym && GYM_CONFIGS[user.gym]?.secondary ? GYM_CONFIGS[user.gym].secondary : "#f0c040";

  const [tab, setTab] = useState<string>("spirit");
  const [actLog, setActLog] = useState<any[]>([]);
  const [toast, setToast] = useState<{ msg: string; dark?: boolean } | null>(null);
  const [selA, setSelA] = useState<Athlete | null>(athletes[0] || null);

  // Form & Component States
  const [showRc, setShowRc] = useState(false);
  const [rcForm, setRcForm] = useState({
    period: "",
    comments: "",
    goals: "",
    ratings: REPORT_CATS.reduce((acc, cat) => ({ ...acc, [cat]: 5 }), {} as Record<string, number>)
  });
  const [teams, setTeams] = useState<Team[]>([
    { id: "t1", name: "Senior Elite", level: "5", ageGroup: "Senior (14+)", schedule: "Mon/Wed/Fri 4-6pm", coachName: "Coach Sarah" },
    { id: "t2", name: "Junior Coed", level: "3", ageGroup: "Junior (9-14)", schedule: "Tue/Thu 5-7pm", coachName: "Coach Alex" }
  ]);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editTeamId, setEditTeamId] = useState<string | null>(null);
  const [teamForm, setTeamForm] = useState({ name: "", level: "", ageGroup: "", schedule: "", coachName: "" });
  const [assignForm, setAssignForm] = useState({ athleteId: "", teamId: "" });
  const [ptAdj, setPtAdj] = useState({ amount: "", reason: "" });
  const [gymSettings, setGymSettings] = useState({ name: user.gym || "", primary: "#111111", secondary: ac, contactEmail: "admin@gym.com" });

  const [csvError] = useState<string | null>(null);
  const [importResult] = useState<any | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[] | null>(null);

  const notify = (msg: string, dark = false) => {
    setToast({ msg, dark });
    setTimeout(() => setToast(null), 2200);
  };

  const visibleAthletes = athletes.filter(a => a.gym === user.gym);

  const ABt: React.FC<{ a: Athlete }> = ({ a }) => (
    <button onClick={() => setSelA(a)} style={{ background: selA?.id === a.id ? "#111" : T.s1, color: selA?.id === a.id ? "#fff" : T.black, border: `1px solid ${T.border}`, padding: "6px 12px", borderRadius: 3, cursor: "pointer", fontFamily: F, fontSize: 11, fontWeight: 600 }}>
      {a.name}
    </button>
  );

  const awardSkill = (sk: string, lv: string) => { notify(`Skill awarded: ${sk}`); };
  const removeSkill = (sk: string) => { notify(`Skill removed: ${sk}`); };
  const awardSpirit = (sp: { id: string; name: string; pts: number }) => {
    if (!selA) return notify("Select an athlete first");
    setAthletes(prev => prev.map(a => a.id === selA.id ? { ...a, points: a.points + sp.pts } : a));
    setActLog(prev => [{ athlete: selA.name, type: `Spirit: ${sp.name}`, pts: sp.pts, time: "Just now" }, ...prev]);
    notify(`Awarded +${sp.pts} PTS to ${selA.name}`, true);
  };

  const issueRc = () => {
    if (!selA) return;
    const newRc = { ...rcForm, publishedBy: user.name };
    setAthletes(prev => prev.map(a => a.id === selA.id ? { ...a, reportCards: [newRc, ...(a.reportCards || [])] } : a));
    setShowRc(false);
    notify(`Report Card published for ${selA.name}`, true);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => { notify("CSV import triggered"); };
  const importCsvRoster = () => { notify("Roster imported"); setCsvPreview(null); };

  const assignAthlete = () => {
    if (!assignForm.athleteId || !assignForm.teamId) return notify("Select athlete and team");
    const teamObj = teams.find(t => t.id === assignForm.teamId);
    if (!teamObj) return;
    setAthletes(prev => prev.map(a => a.id === assignForm.athleteId ? { ...a, team: teamObj.name } : a));
    notify("Athlete assigned to team", true);
  };

  const startEditTeam = (t: Team) => { setEditTeamId(t.id); setTeamForm(t); setShowTeamForm(true); };
  const saveTeam = () => {
    if (editTeamId) {
      setTeams(prev => prev.map(t => t.id === editTeamId ? { ...teamForm, id: editTeamId } : t));
    } else {
      setTeams(prev => [...prev, { ...teamForm, id: "t_" + Date.now() }]);
    }
    setShowTeamForm(false);
    setEditTeamId(null);
    notify("Team saved", true);
  };
  const deleteTeam = (id: string) => { setTeams(prev => prev.filter(t => t.id !== id)); notify("Team deleted"); };

  const adjustPts = (type: "add" | "remove") => {
    if (!selA || !ptAdj.amount) return;
    const amount = parseInt(ptAdj.amount, 10) * (type === "remove" ? -1 : 1);
    setAthletes(prev => prev.map(a => a.id === selA.id ? { ...a, points: a.points + amount } : a));
    setActLog(prev => [{ athlete: selA.name, type: `Manual Adjustment (${ptAdj.reason || "Override"})`, pts: amount, time: "Just now" }, ...prev]);
    setPtAdj({ amount: "", reason: "" });
    notify(`Points adjusted for ${selA.name}`, true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: T.black, fontFamily: F }}>
      <style>{GS}</style>
      {toast && <Toast {...toast} />}
      <GymBand gymName={user.gym || "Gym"} onLogout={onLogout} userRole={isOwner ? "Owner / Head Coach" : "Coach"} />

      {/* NAVIGATION TABS */}
      <div style={{ display: "flex", gap: 8, padding: "12px 18px", borderBottom: `1px solid ${T.border}`, overflowX: "auto", background: T.s1 }}>
        {(["spirit", "skills", "report", "activity", isOwner && "teams", isOwner && "points", isOwner && "shop", isOwner && "fulfillment", isOwner && "access", isOwner && "settings"].filter(Boolean) as string[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "#111" : "transparent", color: tab === t ? "#fff" : T.dark, border: "none", padding: "6px 12px", borderRadius: 3, cursor: "pointer", fontFamily: F, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px 18px", maxWidth: 680, margin: "0 auto" }}>

        {tab === "skills" && <>
          <Title accent={ac}>Skills Tracker</Title>
          <Sub>Log completed skills and milestones</Sub>
          <Lbl>Select Athlete</Lbl>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>{visibleAthletes.map(a => <ABt key={a.id} a={a} />)}</div>
          {selA && ["Level 1", "Level 2", "Level 3"].map(lv => {
            const sampleSkills = ["Forward Roll", "Cartwheel", "Back Handspring"];
            return (
              <div key={lv} style={{ marginBottom: 16 }}>
                <Lbl>{lv}</Lbl>
                {sampleSkills.map(sk => {
                  const ul = false;
                  return (
                    <div key={sk} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: 3, marginBottom: 6 }}>
                      <span style={{ fontFamily: F, fontSize: 12 }}>{sk}</span>
                      <div>
                        {!ul && <button onClick={() => awardSkill(sk, lv)} style={{ background: "#111111", border: "none", color: "#ffffff", padding: "5px 11px", cursor: "pointer", fontFamily: F, fontSize: 10, letterSpacing: 2, fontWeight: 700, borderRadius: 3, textTransform: "uppercase" }}>+ Award</button>}
                        {ul && isOwner && <button onClick={() => removeSkill(sk)} style={{ background: "#111111", border: "none", color: "#ffffff", padding: "5px 11px", cursor: "pointer", fontFamily: F, fontSize: 10, letterSpacing: 2, fontWeight: 700, borderRadius: 3, textTransform: "uppercase" }}>Remove</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>}

        {tab === "spirit" && <>
          <Title accent={ac}>Award Spirit</Title>
          <Sub>Tap an award to assign spirit points to the selected athlete</Sub>
          <Lbl>Select Athlete</Lbl>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>{visibleAthletes.map(a => <ABt key={a.id} a={a} />)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {SPIRIT_SOFT.map(sp => (
              <button key={sp.id} onClick={() => awardSpirit(sp)} style={{ background: "#111111", border: "none", color: "#ffffff", borderRadius: 4, padding: 14, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 12, transition: "transform .12s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                <div style={{ fontSize: 20, color: "#f0c040", marginTop: 2 }}>{sp.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#ffffff" }}>{sp.name}</div>
                  <div style={{ fontFamily: F, fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{sp.desc}</div>
                  <div style={{ fontFamily: FC, fontSize: 16, fontWeight: 800, color: "#f0c040", marginTop: 6 }}>+{sp.pts} PTS</div>
                </div>
              </button>
            ))}
          </div>
        </>}

        {tab === "report" && <>
          <Title accent={ac}>Progress Reports</Title>
          <Sub>Issue new report cards and review published evaluations</Sub>
          <Lbl>Select Athlete</Lbl>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>{visibleAthletes.map(a => <ABt key={a.id} a={a} />)}</div>
          {selA && <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: FC, fontSize: 18, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>{selA.name}</div>
                <div style={{ fontFamily: F, fontSize: 10, color: T.faint }}>{selA.team} · Level {selA.level}</div>
              </div>
              <button onClick={() => setShowRc(p => !p)} style={{ background: "#111111", border: "none", color: "#ffffff", padding: "8px 14px", cursor: "pointer", fontFamily: F, fontSize: 10, letterSpacing: 2, fontWeight: 700, borderRadius: 3, textTransform: "uppercase" }}>
                {showRc ? "Cancel" : "+ New Report Card"}
              </button>
            </div>
            {showRc && (
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, marginTop: 10 }}>
                <div style={{ marginBottom: 12 }}><Lbl>Evaluation Period</Lbl><input value={rcForm.period} onChange={e => setRcForm(p => ({ ...p, period: e.target.value }))} placeholder="e.g. Mid-Season December 2026" style={inpS} /></div>
                <Lbl>Category Ratings</Lbl>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {REPORT_CATS.map(cat => (
                    <div key={cat}>
                      <div style={{ fontFamily: F, fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{cat}</div>
                      <select value={rcForm.ratings[cat]} onChange={e => setRcForm(p => ({ ...p, ratings: { ...p.ratings, [cat]: parseInt(e.target.value, 10) } }))} style={{ ...inpS, padding: "6px 10px" }}>
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} ★</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 12 }}><Lbl>Coach Comments</Lbl><textarea value={rcForm.comments} onChange={e => setRcForm(p => ({ ...p, comments: e.target.value }))} placeholder="Overall performance, strengths, and areas for growth..." rows={3} style={{ ...inpS, resize: "vertical" }} /></div>
                <div style={{ marginBottom: 16 }}><Lbl>Goals for Next Period</Lbl><textarea value={rcForm.goals} onChange={e => setRcForm(p => ({ ...p, goals: e.target.value }))} placeholder="Specific skills or goals to focus on next..." rows={2} style={{ ...inpS, resize: "vertical" }} /></div>
                <button onClick={issueRc} style={{ width: "100%", background: "#111111", border: "none", color: "#ffffff", padding: 12, cursor: "pointer", fontFamily: F, fontSize: 11, letterSpacing: 3, fontWeight: 800, borderRadius: 3, textTransform: "uppercase" }}>Issue & Publish Report Card</button>
              </div>
            )}
          </Card>}
          {selA?.reportCards && selA.reportCards.length > 0 && <>
            <Lbl>Issued Reports for {selA.name}</Lbl>
            {selA.reportCards.map((rc, i) => (
              <div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 4, padding: 14, marginBottom: 10, background: T.s1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700 }}>{rc.period}</div>
                    <div style={{ fontFamily: F, fontSize: 10, color: T.faint, marginTop: 2 }}>By {rc.publishedBy}</div>
                  </div>
                  <span style={{ fontFamily: FC, fontSize: 16, fontWeight: 800, color: ac }}>
                    {(Object.values(rc.ratings as Record<string, number>).reduce((a, b) => a + b, 0) / REPORT_CATS.length).toFixed(1)} / 5 ★
                  </span>
                </div>
              </div>
            ))}
          </>}
        </>}

        {tab === "activity" && <>
          <Title accent={ac}>Activity Feed</Title>
          <Sub>Real-time log of points, attendance, and skills awarded</Sub>
          {actLog.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600 }}>{a.athlete}</div>
                <div style={{ fontFamily: F, fontSize: 11, color: T.dark, marginTop: 2 }}>{a.type}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: FC, fontSize: 18, fontWeight: 800, color: a.pts >= 0 ? ac : "#c0392b" }}>{a.pts >= 0 ? `+${a.pts}` : a.pts}</div>
                <div style={{ fontFamily: F, fontSize: 9, color: T.faint, marginTop: 2 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </>}

        {tab === "teams" && isOwner && <>
          <Title accent={ac}>Teams & Roster</Title>
          <Sub>Manage gym divisions and upload athlete rosters</Sub>
          <Card style={{ marginBottom: 16, background: T.s1 }}>
            <div style={{ fontFamily: FC, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Batch Import Athletes (CSV)</div>
            <div style={{ fontFamily: F, fontSize: 11, color: T.muted, marginBottom: 12, lineHeight: 1.6 }}>Upload a CSV file containing columns for <strong>Name</strong>, <strong>Email</strong> (optional), and <strong>Team</strong> (optional).</div>
            <label style={{ background: "#111111", border: "none", color: "#ffffff", padding: "9px 16px", cursor: "pointer", fontFamily: F, fontSize: 10, letterSpacing: 2, fontWeight: 700, borderRadius: 3, textTransform: "uppercase", display: "inline-block", marginBottom: 10 }}>
              ↑ Select CSV Roster
              <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} style={{ display: "none" }} />
            </label>
            {csvError && <div style={{ background: "#fff5f5", border: "1px solid #f5c6cb", borderRadius: 3, padding: "8px 12px", fontFamily: F, fontSize: 11, color: "#c0392b", marginBottom: 8 }}>{csvError}</div>}
            {importResult && <div style={{ background: "#d4edda", border: "1px solid #c3e6cb", borderRadius: 3, padding: "8px 12px", fontFamily: F, fontSize: 11, color: "#2d8a4e", marginBottom: 8 }}>Successfully imported {importResult.added} athletes. ({importResult.skipped} duplicates skipped).</div>}
            {csvPreview && <>
              <div style={{ fontFamily: FC, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 10 }}>{csvPreview.length} Athletes Found</div>
              <div style={{ border: `1px solid ${T.border}`, borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", background: "#111111", padding: "7px 12px", gap: 8 }}>
                  {["Name", "Email", "Team"].map(h => <div key={h} style={{ fontFamily: F, fontSize: 9, color: "#ffffff", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>{h}</div>)}
                </div>
                {csvPreview.map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", padding: "8px 12px", borderTop: `1px solid ${T.border}`, alignItems: "center", gap: 8, background: i % 2 === 0 ? "#ffffff" : T.s1 }}>
                    <div style={{ fontFamily: F, fontSize: 12, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontFamily: F, fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis" }}>{r.email || "—"}</div>
                    <div style={{ fontFamily: F, fontSize: 11, color: T.muted }}>{r.team || "—"}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setCsvPreview(null)} style={{ flex: 1, background: "#111111", border: "none", color: "#ffffff", padding: 9, cursor: "pointer", fontFamily: F, fontSize: 10, letterSpacing: 2, borderRadius: 3, textTransform: "uppercase" }}>Cancel</button>
                <button onClick={importCsvRoster} style={{ flex: 2, background: "#111111", border: "none", color: "#ffffff", padding: 9, cursor: "pointer", fontFamily: F, fontSize: 11, letterSpacing: 3, fontWeight: 800, borderRadius: 3, textTransform: "uppercase" }}>Import Roster</button>
              </div>
            </>}
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <Lbl>Assign Athlete to Team</Lbl>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <Lbl>Athlete</Lbl>
                <select value={assignForm.athleteId} onChange={e => setAssignForm(p => ({ ...p, athleteId: e.target.value }))} style={{ ...inpS, padding: "8px 10px" }}>
                  <option value="">-- Select Athlete --</option>
                  {athletes.map(a => <option key={a.id} value={a.id}>{a.name} ({a.team})</option>)}
                </select>
              </div>
              <div>
                <Lbl>Target Team</Lbl>
                <select value={assignForm.teamId} onChange={e => setAssignForm(p => ({ ...p, teamId: e.target.value }))} style={{ ...inpS, padding: "8px 10px" }}>
                  <option value="">-- Select Team --</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <button onClick={assignAthlete} style={{ width: "100%", background: "#111111", border: "none", color: "#ffffff", padding: 10, cursor: "pointer", fontFamily: F, fontSize: 10, letterSpacing: 2, fontWeight: 700, borderRadius: 3, textTransform: "uppercase" }}>Assign Athlete</button>
          </Card>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Lbl>Configured Gym Teams ({teams.length})</Lbl>
            {!showTeamForm && <button onClick={() => setShowTeamForm(true)} style={{ background: "#111111", border: "none", color: "#ffffff", padding: "6px 12px", cursor: "pointer", fontFamily: F, fontSize: 10, letterSpacing: 2, fontWeight: 700, borderRadius: 3, textTransform: "uppercase" }}>+ Add Team</button>}
          </div>

          {showTeamForm && (
            <Card style={{ marginBottom: 16 }}>
              <Lbl>{editTeamId ? "Edit Team" : "Create New Team"}</Lbl>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><Lbl>Team Name</Lbl><input value={teamForm.name} onChange={e => setTeamForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Senior Elite" style={inpS} /></div>
                <div><Lbl>Level</Lbl><input value={teamForm.level} onChange={e => setTeamForm(p => ({ ...p, level: e.target.value }))} placeholder="e.g. 4-5" style={inpS} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><Lbl>Age Group</Lbl><input value={teamForm.ageGroup} onChange={e => setTeamForm(p => ({ ...p, ageGroup: e.target.value }))} placeholder="e.g. Senior (14+)" style={inpS} /></div>
                <div><Lbl>Schedule</Lbl><input value={teamForm.schedule} onChange={e => setTeamForm(p => ({ ...p, schedule: e.target.value }))} placeholder="e.g. Mon/Wed/Fri 4-6pm" style={inpS} /></div>
              </div>
              <div style={{ marginBottom: 14 }}><Lbl>Primary Coach Name</Lbl><input value={teamForm.coachName} onChange={e => setTeamForm(p => ({ ...p, coachName: e.target.value }))} placeholder="e.g. Coach Amy" style={inpS} /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setShowTeamForm(false); setEditTeamId(null); }} style={{ flex: 1, background: "#111111", border: "none", color: "#ffffff", padding: 10, cursor: "pointer", fontFamily: F, fontSize: 10, letterSpacing: 2, borderRadius: 3, textTransform: "uppercase" }}>Cancel</button>
                <button onClick={saveTeam} style={{ flex: 2, background: "#111111", border: "none", color: "#ffffff", padding: 10, cursor: "pointer", fontFamily: F, fontSize: 11, letterSpacing: 3, fontWeight: 800, borderRadius: 3, textTransform: "uppercase" }}>Save Team</button>
              </div>
            </Card>
          )}

          {teams.map(t => {
            const count = athletes.filter(a => a.team === t.name).length;
            return (
              <Card key={t.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: FC, fontSize: 18, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>{t.name}</div>
                    <div style={{ fontFamily: F, fontSize: 11, color: T.faint, marginTop: 2 }}>{t.ageGroup} · Level {t.level} · {t.schedule}</div>
                  </div>
                  <span style={{ background: T.s1, border: `1px solid ${T.border}`, padding: "4px 8px", fontFamily: F, fontSize: 10, fontWeight: 700, borderRadius: 3 }}>{count} Athletes</span>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                  <button onClick={() => startEditTeam(t)} style={{ background: "#111111", border: "none", color: "#ffffff", padding: "5px 12px", cursor: "pointer", fontFamily: F, fontSize: 9, letterSpacing: 2, borderRadius: 3, textTransform: "uppercase" }}>Edit</button>
                  <button onClick={() => deleteTeam(t.id)} style={{ background: "#111111", border: "none", color: "#ffffff", padding: "5px 12px", cursor: "pointer", fontFamily: F, fontSize: 9, letterSpacing: 2, borderRadius: 3, textTransform: "uppercase" }}>Delete</button>
                </div>
              </Card>
            );
          })}
        </>}

        {tab === "points" && isOwner && <>
          <Title accent={ac}>Adjust Points</Title>
          <Sub>Owner override to add or remove points directly</Sub>
          <Lbl>Select Athlete</Lbl>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>{visibleAthletes.map(a => <ABt key={a.id} a={a} />)}</div>
          {selA && <Card style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: FC, fontSize: 20, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{selA.name}</div>
            <div style={{ fontFamily: F, fontSize: 12, color: T.muted, marginBottom: 14 }}>Current Points: <strong>{selA.points.toLocaleString()}</strong></div>
            <div style={{ marginBottom: 10 }}><Lbl>Point Amount</Lbl><input type="number" value={ptAdj.amount} onChange={e => setPtAdj(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 50" style={inpS} /></div>
            <div style={{ marginBottom: 14 }}><Lbl>Reason for Adjustment</Lbl><input value={ptAdj.reason} onChange={e => setPtAdj(p => ({ ...p, reason: e.target.value }))} placeholder="e.g. Volunteer credit, bonus, penalty..." style={inpS} /></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => adjustPts("remove")} style={{ flex: 1, background: "#111111", border: "none", color: "#ffffff", padding: 11, cursor: "pointer", fontFamily: F, fontSize: 11, letterSpacing: 2, fontWeight: 700, borderRadius: 3, textTransform: "uppercase" }}>- Deduct Points</button>
              <button onClick={() => adjustPts("add")} style={{ flex: 1, background: "#111111", border: "none", color: "#ffffff", padding: 11, cursor: "pointer", fontFamily: F, fontSize: 11, letterSpacing: 2, fontWeight: 800, borderRadius: 3, textTransform: "uppercase" }}>+ Add Points</button>
            </div>
          </Card>}
        </>}

        {tab === "shop" && isOwner && <ShopView gymName={user.gym} editable={true} accentColor={ac} shopItems={shopItems} setShopItems={setShopItems} />}

        {tab === "fulfillment" && isOwner && <>
          <Title accent={ac}>Order Fulfillment</Title>
          <Sub>Track & manage Swag Shop orders placed by athletes</Sub>
          {orders.length === 0 && <div style={{ fontFamily: F, fontSize: 14, color: T.faint, padding: "40px 0", textAlign: "center" }}>No orders placed yet.</div>}
          {orders.map(ord => (
            <Card key={ord.id} style={{ marginBottom: 10, background: ord.status === "fulfilled" ? T.s1 : "#ffffff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 3, background: T.s2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{ord.icon || "✦"}</div>
                  <div>
                    <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700 }}>{ord.itemName}</div>
                    <div style={{ fontFamily: F, fontSize: 11, color: T.muted, marginTop: 1 }}>{ord.athleteName} ({ord.athleteTeam})</div>
                  </div>
                </div>
                <span style={{ fontFamily: F, fontSize: 9, letterSpacing: 2, fontWeight: 800, padding: "3px 8px", borderRadius: 2, textTransform: "uppercase", background: ord.status === "fulfilled" ? "#d4edda" : "#fff3cd", color: ord.status === "fulfilled" ? "#2d8a4e" : "#856404" }}>{ord.status}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                <div style={{ fontFamily: F, fontSize: 10, color: T.faint }}>{ord.cost} pts · Ordered {ord.orderedDate}</div>
                {ord.status === "pending" && <button onClick={() => {
                  setOrders(p => p.map(o => o.id === ord.id ? { ...o, status: "fulfilled" } : o));
                  notify(`Order marked fulfilled — ${ord.athleteName}`, true);
                }} style={{ background: "#111111", border: "none", color: "#ffffff", padding: "5px 12px", cursor: "pointer", fontFamily: F, fontSize: 9, letterSpacing: 2, fontWeight: 700, borderRadius: 3, textTransform: "uppercase" }}>Mark Fulfilled</button>}
              </div>
            </Card>
          ))}
        </>}

        {tab === "access" && isOwner && <>
          <Title accent={ac}>Access & Invite Codes</Title>
          <Sub>Share these codes with your staff to let them register</Sub>
          <Card style={{ marginBottom: 16 }}>
            <Lbl>Coach Invite Code</Lbl>
            <div style={{ fontFamily: FC, fontSize: 22, fontWeight: 800, letterSpacing: 2, background: T.s1, padding: "10px 14px", borderRadius: 3, marginBottom: 8, userSelect: "all" }}>
              {user.gym && user.gym.includes("Dynasty") ? "DYNASTY-COACH-2026" : "UOFC-COACH-2026"}
            </div>
            <div style={{ fontFamily: F, fontSize: 11, color: T.faint, lineHeight: 1.5 }}>Coaches use this code on the "Coach Register" screen to create an account. Once registered, assign them to teams in <strong>Teams & Roster</strong>.</div>
          </Card>
          <Card>
            <Lbl>Athlete & Parent Accounts</Lbl>
            <div style={{ fontFamily: F, fontSize: 12, color: T.muted, lineHeight: 1.6 }}>Athlete and parent accounts are created automatically when you upload your roster CSV in <strong>Teams & Roster</strong>. Parents log in with their email address, and can create username/passwords for their minor athletes directly inside their app.</div>
          </Card>
        </>}

        {tab === "settings" && isOwner && <>
          <Title accent={ac}>Gym Settings</Title>
          <Sub>Customize brand colors, gym name, and contact details</Sub>
          <Card>
            <div style={{ marginBottom: 12 }}><Lbl>Gym Brand Name</Lbl><input value={gymSettings.name} onChange={e => setGymSettings(p => ({ ...p, name: e.target.value }))} style={inpS} /></div>
            <div style={{ marginBottom: 12 }}><Lbl>Contact Email Address</Lbl><input value={gymSettings.contactEmail} onChange={e => setGymSettings(p => ({ ...p, contactEmail: e.target.value }))} style={inpS} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div><Lbl>Primary Color (Hex / RGB)</Lbl><input value={gymSettings.primary} onChange={e => setGymSettings(p => ({ ...p, primary: e.target.value }))} style={inpS} /></div>
              <div><Lbl>Secondary Color (Hex / RGB)</Lbl><input value={gymSettings.secondary} onChange={e => setGymSettings(p => ({ ...p, secondary: e.target.value }))} style={inpS} /></div>
            </div>
            <button onClick={() => {
              if (user.gym && GYM_CONFIGS[user.gym]) {
                GYM_CONFIGS[user.gym].primary = gymSettings.primary;
                GYM_CONFIGS[user.gym].secondary = gymSettings.secondary;
                GYM_CONFIGS[user.gym].name = gymSettings.name;
                GYM_CONFIGS[user.gym].contactEmail = gymSettings.contactEmail;
              }
              notify("Gym settings updated", true);
            }} style={{ width: "100%", background: "#111111", border: "none", color: "#ffffff", padding: 12, cursor: "pointer", fontFamily: F, fontSize: 11, letterSpacing: 3, fontWeight: 800, borderRadius: 3, textTransform: "uppercase" }}>Save Branding Settings</button>
          </Card>
        </>}

      </div>
    </div>
  );
}

// ── PLATFORM ADMIN VIEW ───────────────────────────────────────────────────────
function AdminView({ user, athletes, onLogout }: { user: User; athletes: Athlete[]; onLogout: () => void }) {
  const [gyms, setGyms] = useState(Object.keys(GYM_CONFIGS));
  const [newGym, setNewGym] = useState({ name: "", primary: "#1a1a1a", secondary: "#888888", email: "" });
  const [toast, setToast] = useState<{ msg: string; dark?: boolean } | null>(null);
  const notify = (msg: string, dark = false) => { setToast({ msg, dark }); setTimeout(() => setToast(null), 2200); };

  const addGym = () => {
    if (!newGym.name.trim()) { notify("Gym name required"); return; }
    GYM_CONFIGS[newGym.name] = { primary: newGym.primary, secondary: newGym.secondary, name: newGym.name, contactEmail: newGym.email };
    setGyms(Object.keys(GYM_CONFIGS));
    setNewGym({ name: "", primary: "#1a1a1a", secondary: "#888888", email: "" });
    notify(`${newGym.name} added to platform`, true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: T.black, fontFamily: F }}>
      <style>{GS}</style>
      {toast && <Toast {...toast} />}
      <GymBand gymName="Cheer Passport System Admin" onLogout={onLogout} userRole="Platform Admin" />
      <div style={{ padding: "24px 18px", maxWidth: 680, margin: "0 auto" }}>
        <Title>Platform Management</Title>
        <Sub>Multi-tenant gym administration & onboarding</Sub>

        <Card style={{ marginBottom: 20 }}>
          <Lbl>Onboard New Gym Program</Lbl>
          <div style={{ marginBottom: 10 }}><Lbl>Gym Name</Lbl><input value={newGym.name} onChange={e => setNewGym(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Apex Cheer Athletics" style={{ ...inp() }} /></div>
          <div style={{ marginBottom: 10 }}><Lbl>Contact Email</Lbl><input value={newGym.email} onChange={e => setNewGym(p => ({ ...p, email: e.target.value }))} placeholder="e.g. info@apexcheer.com" style={{ ...inp() }} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div><Lbl>Primary Color</Lbl><input value={newGym.primary} onChange={e => setNewGym(p => ({ ...p, primary: e.target.value }))} placeholder="#1a1a1a" style={{ ...inp() }} /></div>
            <div><Lbl>Secondary Color</Lbl><input value={newGym.secondary} onChange={e => setNewGym(p => ({ ...p, secondary: e.target.value }))} placeholder="#888888" style={{ ...inp() }} /></div>
          </div>
          <button onClick={addGym} style={{ width: "100%", background: "#111111", border: "none", color: "#ffffff", padding: 12, cursor: "pointer", fontFamily: F, fontSize: 11, letterSpacing: 3, fontWeight: 800, borderRadius: 3, textTransform: "uppercase" }}>+ Onboard Gym</button>
        </Card>

        <Lbl>Active Gym Programs ({gyms.length})</Lbl>
        {gyms.map(g => {
          const cfg = GYM_CONFIGS[g];
          const gymAthletes = athletes.filter(a => a.gym === g);
          return (
            <Card key={g} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: cfg?.secondary || "#888", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FC, fontSize: 14, fontWeight: 800, color: cfg?.primary || "#111" }}>
                  {g.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FC, fontSize: 18, fontWeight: 800, textTransform: "uppercase" }}>{g}</div>
                  <div style={{ fontFamily: F, fontSize: 10, color: T.faint }}>{cfg?.contactEmail || "No contact email"} · {gymAthletes.length} Athletes</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN APPLICATION ENTRY ───────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>(INIT_ATHLETES);
  const [shopItems, setShopItems] = useState<ShopItem[]>([
    { id: "sh1", name: "Passport Sticker Pack", cost: 50, icon: "✦", stock: 99, desc: "Exclusive stickers for your passport", imageUrl: "" },
    { id: "sh2", name: "Gym Water Bottle", cost: 150, icon: "◈", stock: 12, desc: "Custom branded water bottle", imageUrl: "" },
    { id: "sh3", name: "Custom Hair Bow", cost: 200, icon: "◇", stock: 8, desc: "Team colour hair bow", imageUrl: "" },
    { id: "sh4", name: "Cheer Hoodie", cost: 500, icon: "△", stock: 5, desc: "Gym hoodie with your name", imageUrl: "" },
    { id: "sh5", name: "Personalized Bag Tag", cost: 75, icon: "○", stock: 20, desc: "Custom bag tag", imageUrl: "" },
    { id: "sh6", name: "Gold Trophy", cost: 1000, icon: "★", stock: 3, desc: "Season champion trophy", imageUrl: "" },
  ]);
  const [orders, setOrders] = useState<Order[]>([]);

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  if (currentUser.role === "platform_admin") {
    return <AdminView user={currentUser} athletes={athletes} onLogout={() => setCurrentUser(null)} />;
  }

  if (currentUser.role === "coach" || currentUser.role === "owner") {
    return <CoachView user={currentUser} athletes={athletes} setAthletes={setAthletes} shopItems={shopItems} setShopItems={setShopItems} orders={orders} setOrders={setOrders} onLogout={() => setCurrentUser(null)} />;
  }

  return <AthleteView user={currentUser} athletes={athletes} setAthletes={setAthletes} shopItems={shopItems} setShopItems={setShopItems} orders={orders} setOrders={setOrders} onLogout={() => setCurrentUser(null)} />;
}

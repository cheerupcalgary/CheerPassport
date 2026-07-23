import React, { useState } from "react";

// ── TYPES ─────────────────────────────────────────────────────────────────────
type Role = "owner" | "coach" | "athlete" | "parent" | "platform_admin";

type Athlete = {
  id: string;
  name: string;
  team: string;
  level: number;
  points: number;
  gym: string;
  parentId?: string;
  reportCards?: any[];
};

type User = {
  id: string;
  name: string;
  email?: string;
  role: Role;
  gym?: string;
  childrenIds?: string[]; // For Parent accounts
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
  padding: "10px 12px",
  border: `1px solid ${T.border}`,
  borderRadius: 4,
  fontFamily: F,
  fontSize: 13,
  outline: "none",
  background: "#ffffff",
};

// ── INITIAL DATA & MULTI-GYM REGISTRY ─────────────────────────────────────────
const INITIAL_GYMS: Record<string, { primary: string; secondary: string; name: string; inviteCode: string }> = {
  "Dynasty Athletics": { name: "Dynasty Athletics", primary: "#111111", secondary: "#f0c040", inviteCode: "DYNASTY2026" },
  "Ultimate Cheer": { name: "Ultimate Cheer", primary: "#002060", secondary: "#e60000", inviteCode: "ULTIMATE2026" },
};

const INIT_ATHLETES: Athlete[] = [
  { id: "a1", name: "Ava Smith", team: "Senior Elite", level: 5, points: 450, gym: "Dynasty Athletics", parentId: "p1", reportCards: [{ period: "Fall 2026", publishedBy: "Coach Sarah", ratings: { Stunting: 5, Tumbling: 4, Jumps: 5, Dance: 4, "Work Ethic": 5 }, comments: "Great focus during practice!", goals: "Master full twist." }] },
  { id: "a2", name: "Mia Johnson", team: "Junior Coed", level: 3, points: 280, gym: "Dynasty Athletics", parentId: "p2", reportCards: [] },
  { id: "a3", name: "Chloe Davis", team: "Tiny Sparks", level: 1, points: 150, gym: "Ultimate Cheer", parentId: "p3", reportCards: [] },
];

const SPIRIT_SOFT = [
  { id: "sp1", name: "Team Player", desc: "Encouraging teammates during practice", pts: 25, icon: "★" },
  { id: "sp2", name: "Hardest Worker", desc: "Pushed through a tough workout", pts: 50, icon: "🔥" },
];

const REPORT_CATS = ["Stunting", "Tumbling", "Jumps", "Dance", "Work Ethic"];

// ── PRIMITIVE UI COMPONENTS ───────────────────────────────────────────────────
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
  <div style={{ border: `1px solid ${T.border}`, borderRadius: 6, padding: 18, background: "#ffffff", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", ...style }}>
    {children}
  </div>
);

const Toast: React.FC<{ msg: string; dark?: boolean }> = ({ msg, dark }) => (
  <div style={{ position: "fixed", bottom: 20, right: 20, background: dark ? "#111" : "#333", color: "#fff", padding: "10px 18px", borderRadius: 4, fontFamily: F, fontSize: 12, zIndex: 9999 }}>
    {msg}
  </div>
);

const GymBand: React.FC<{ gymName: string; onLogout: () => void; userRole: string; userName: string }> = ({ gymName, onLogout, userRole, userName }) => (
  <div style={{ background: "#111111", color: "#ffffff", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div>
      <div style={{ fontFamily: FC, fontSize: 15, fontWeight: 800, textTransform: "uppercase" }}>{gymName}</div>
      <div style={{ fontFamily: F, fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{userName} ({userRole})</div>
    </div>
    <button onClick={onLogout} style={{ background: "transparent", border: "1px solid #444", color: "#fff", padding: "5px 10px", cursor: "pointer", borderRadius: 3, fontFamily: F, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>
      Logout / Switch Gym
    </button>
  </div>
);

// ── AUTHENTICATION SCREEN (MULTI-GYM & ROLE LOGINS) ──────────────────────────
function LoginScreen({ gyms, onLogin }: { gyms: Record<string, any>; onLogin: (u: User) => void }) {
  const [selectedGym, setSelectedGym] = useState<string>(Object.keys(gyms)[0] || "");
  const [role, setRole] = useState<Role>("athlete");
  
  // Login Form Inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === "platform_admin") {
      onLogin({ id: "admin_1", name: name || "Platform Admin", role: "platform_admin" });
      return;
    }

    if (!selectedGym) {
      setError("Please select a gym program.");
      return;
    }

    const currentGym = gyms[selectedGym];

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    // Role Validation
    if ((role === "owner" || role === "coach") && accessCode.trim() !== currentGym.inviteCode) {
      setError(`Invalid Invite Code for ${selectedGym}. (Default code: ${currentGym.inviteCode})`);
      return;
    }

    onLogin({
      id: "usr_" + Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
      gym: selectedGym,
      childrenIds: role === "parent" ? ["a1"] : undefined, // Linked child demo ID
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: T.s1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: F }}>
      <style>{GS}</style>
      <div style={{ maxWidth: 440, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title>Cheer Passport</Title>
          <Sub>Multi-Gym Portal Login</Sub>
        </div>

        <Card>
          <form onSubmit={handleLogin}>
            {/* STEP 1: GYM SELECTION */}
            {role !== "platform_admin" && (
              <div style={{ marginBottom: 16 }}>
                <Lbl>1. Select Your Gym Program</Lbl>
                <select value={selectedGym} onChange={e => setSelectedGym(e.target.value)} style={inpS}>
                  {Object.keys(gyms).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            )}

            {/* STEP 2: ROLE SELECTION */}
            <div style={{ marginBottom: 16 }}>
              <Lbl>2. Select Your Role</Lbl>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {(["athlete", "parent", "coach", "owner"] as Role[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setError(null); }}
                    style={{
                      padding: "8px 10px",
                      background: role === r ? T.black : T.s1,
                      color: role === r ? "#fff" : T.black,
                      border: `1px solid ${role === r ? T.black : T.border}`,
                      borderRadius: 4,
                      fontFamily: F,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 3: CREDENTIALS */}
            <div style={{ marginBottom: 12 }}>
              <Lbl>Your Full Name</Lbl>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah Jenkins" style={inpS} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <Lbl>Email Address (Optional)</Lbl>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" style={inpS} />
            </div>

            {(role === "owner" || role === "coach") && (
              <div style={{ marginBottom: 16 }}>
                <Lbl>Gym Invite / Access Code</Lbl>
                <input
                  type="password"
                  value={accessCode}
                  onChange={e => setAccessCode(e.target.value)}
                  placeholder={`Enter code (Try: ${gyms[selectedGym]?.inviteCode || "CODE"})`}
                  style={inpS}
                />
              </div>
            )}

            {error && (
              <div style={{ background: "#fff5f5", border: "1px solid #f5c6cb", color: "#c0392b", padding: "8px 12px", borderRadius: 4, fontSize: 11, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                background: T.black,
                color: "#ffffff",
                padding: 12,
                border: "none",
                borderRadius: 4,
                fontFamily: F,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Log In as {role}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${T.border}`, textAlign: "center" }}>
            <button
              onClick={() => { setRole("platform_admin"); setError(null); }}
              style={{ background: "none", border: "none", color: T.faint, fontSize: 10, cursor: "pointer", textDecoration: "underline" }}
            >
              System Super Admin Login
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── ATHLETE & PARENT VIEW ─────────────────────────────────────────────────────
function AthleteParentView({ user, athletes, shopItems, orders, setOrders, onLogout }: { user: User; athletes: Athlete[]; shopItems: ShopItem[]; orders: Order[]; setOrders: any; onLogout: () => void }) {
  const [tab, setTab] = useState<"passport" | "shop" | "reports">("passport");
  const gymAthletes = athletes.filter(a => a.gym === user.gym);
  
  // Parent sees linked children; Athlete sees their own profile
  const myAthletes = user.role === "parent" 
    ? gymAthletes.filter(a => user.childrenIds?.includes(a.id) || a.parentId === user.id)
    : gymAthletes.filter(a => a.name.toLowerCase() === user.name.toLowerCase());

  const activeAthlete = myAthletes[0] || gymAthletes[0] || { name: user.name, points: 0, team: "Unassigned", level: 1, reportCards: [] };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: F }}>
      <GymBand gymName={user.gym || "Gym"} onLogout={onLogout} userRole={user.role} userName={user.name} />

      <div style={{ display: "flex", gap: 8, padding: "12px 18px", borderBottom: `1px solid ${T.border}`, background: T.s1 }}>
        {(["passport", "reports", "shop"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? T.black : "transparent", color: tab === t ? "#fff" : T.dark, border: "none", padding: "6px 14px", borderRadius: 3, cursor: "pointer", fontFamily: F, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
        {tab === "passport" && (
          <div>
            <Card style={{ textAlign: "center", marginBottom: 16, background: T.s1 }}>
              <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: 1 }}>{user.role === "parent" ? "Child Athlete Profile" : "Cheer Passport"}</div>
              <Title>{activeAthlete.name}</Title>
              <div style={{ fontSize: 12, color: T.muted }}>Team: <strong>{activeAthlete.team}</strong> · Level {activeAthlete.level}</div>
              <div style={{ marginTop: 14, fontFamily: FC, fontSize: 28, fontWeight: 800, color: T.black }}>{activeAthlete.points} <span style={{ fontSize: 12 }}>PTS</span></div>
            </Card>
          </div>
        )}

        {tab === "reports" && (
          <div>
            <Title>Progress Reports</Title>
            <Sub>Evaluations published by your coaches</Sub>
            {activeAthlete.reportCards && activeAthlete.reportCards.length > 0 ? (
              activeAthlete.reportCards.map((rc, i) => (
                <Card key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: FC, fontSize: 16, fontWeight: 800 }}>{rc.period}</div>
                  <div style={{ fontSize: 11, color: T.faint, marginBottom: 10 }}>Evaluated by {rc.publishedBy}</div>
                  <p style={{ fontSize: 12, color: T.dark, marginBottom: 8 }}><strong>Comments:</strong> {rc.comments}</p>
                  <p style={{ fontSize: 12, color: T.dark }}><strong>Goals:</strong> {rc.goals}</p>
                </Card>
              ))
            ) : (
              <Card><Sub>No report cards published yet.</Sub></Card>
            )}
          </div>
        )}

        {tab === "shop" && (
          <div>
            <Title>Swag Shop</Title>
            <Sub>Redeem your points for rewards</Sub>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {shopItems.map(item => (
                <Card key={item.id}>
                  <div style={{ fontSize: 20 }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 12, marginTop: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: T.faint }}>{item.cost} PTS</div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── COACH & OWNER VIEW ────────────────────────────────────────────────────────
function CoachView({ user, athletes, setAthletes, shopItems, setShopItems, orders, setOrders, onLogout }: any) {
  const isOwner = user.role === "owner";
  const gymAthletes = athletes.filter((a: Athlete) => a.gym === user.gym);
  const [tab, setTab] = useState<string>("spirit");
  const [selA, setSelA] = useState<Athlete | null>(gymAthletes[0] || null);
  const [toast, setToast] = useState<{ msg: string; dark?: boolean } | null>(null);

  const notify = (msg: string, dark = false) => {
    setToast({ msg, dark });
    setTimeout(() => setToast(null), 2200);
  };

  const awardSpirit = (sp: { id: string; name: string; pts: number }) => {
    if (!selA) return notify("Select an athlete first");
    setAthletes((prev: Athlete[]) => prev.map(a => a.id === selA.id ? { ...a, points: a.points + sp.pts } : a));
    notify(`Awarded +${sp.pts} PTS to ${selA.name}`, true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: T.black, fontFamily: F }}>
      <style>{GS}</style>
      {toast && <Toast {...toast} />}
      <GymBand gymName={user.gym || "Gym"} onLogout={onLogout} userRole={isOwner ? "Gym Owner" : "Coach"} userName={user.name} />

      <div style={{ display: "flex", gap: 8, padding: "12px 18px", borderBottom: `1px solid ${T.border}`, overflowX: "auto", background: T.s1 }}>
        {(["spirit", "skills", "reports", isOwner && "settings"].filter(Boolean) as string[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "#111" : "transparent", color: tab === t ? "#fff" : T.dark, border: "none", padding: "6px 12px", borderRadius: 3, cursor: "pointer", fontFamily: F, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px 18px", maxWidth: 680, margin: "0 auto" }}>
        <Lbl>Select Gym Athlete</Lbl>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {gymAthletes.map(a => (
            <button key={a.id} onClick={() => setSelA(a)} style={{ background: selA?.id === a.id ? "#111" : T.s1, color: selA?.id === a.id ? "#fff" : T.black, border: `1px solid ${T.border}`, padding: "6px 12px", borderRadius: 3, cursor: "pointer", fontFamily: F, fontSize: 11, fontWeight: 600 }}>
              {a.name} ({a.points} pts)
            </button>
          ))}
        </div>

        {tab === "spirit" && (
          <div>
            <Title>Award Spirit Points</Title>
            <Sub>Assign points to {selA ? selA.name : "selected athlete"}</Sub>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {SPIRIT_SOFT.map(sp => (
                <button key={sp.id} onClick={() => awardSpirit(sp)} style={{ background: "#111", color: "#fff", border: "none", padding: 14, borderRadius: 4, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{sp.name}</div>
                  <div style={{ color: "#f0c040", fontWeight: 800, marginTop: 4 }}>+{sp.pts} PTS</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PLATFORM ADMIN VIEW ───────────────────────────────────────────────────────
function AdminView({ onLogout }: { onLogout: () => void }) {
  return (
    <div style={{ padding: 20, fontFamily: F }}>
      <GymBand gymName="Cheer Passport Control" onLogout={onLogout} userRole="Platform Admin" userName="Superuser" />
      <div style={{ maxWidth: 600, margin: "20px auto" }}>
        <Title>System Administration</Title>
        <Sub>Manage multi-tenant gym configurations and global accounts</Sub>
      </div>
    </div>
  );
}

// ── MAIN APPLICATION ENTRY ───────────────────────────────────────────────────
export default function App() {
  const [gyms, setGyms] = useState(INITIAL_GYMS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>(INIT_ATHLETES);
  const [shopItems, setShopItems] = useState<ShopItem[]>([
    { id: "sh1", name: "Passport Sticker Pack", cost: 50, icon: "✦", stock: 99, desc: "Stickers for passport", imageUrl: "" },
    { id: "sh2", name: "Gym Water Bottle", cost: 150, icon: "◈", stock: 12, desc: "Custom water bottle", imageUrl: "" },
  ]);
  const [orders, setOrders] = useState<Order[]>([]);

  if (!currentUser) {
    return <LoginScreen gyms={gyms} onLogin={setCurrentUser} />;
  }

  if (currentUser.role === "platform_admin") {
    return <AdminView onLogout={() => setCurrentUser(null)} />;
  }

  if (currentUser.role === "owner" || currentUser.role === "coach") {
    return <CoachView user={currentUser} athletes={athletes} setAthletes={setAthletes} shopItems={shopItems} setShopItems={setShopItems} orders={orders} setOrders={setOrders} onLogout={() => setCurrentUser(null)} />;
  }

  return <AthleteParentView user={currentUser} athletes={athletes} shopItems={shopItems} orders={orders} setOrders={setOrders} onLogout={() => setCurrentUser(null)} />;
}

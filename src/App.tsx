const assignAthlete = () => {
    if (!assignForm.athleteId || !assignForm.teamId) {
      notify("Select athlete and team");
      return;
    }
    const team = teams.find((t) => t.id === assignForm.teamId);
    setAthletes((p) =>
      p.map((a) =>
        a.id === parseInt(assignForm.athleteId) || a.id === assignForm.athleteId
          ? { ...a, team: team.name }
          : a
      )
    );
    notify("Athlete assigned to team", true);
  };

  const notify = (msg, dark = false) => {
    setToast({ msg, dark });
    setTimeout(() => setToast(null), 2200);
  };

  const toggleSkill = (athleteId, skillId, level) => {
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id !== athleteId) return a;
        const exists = a.unlockedSkills.includes(skillId);
        const pts = LEVEL_PTS[level] || 10;
        const updatedSkills = exists
          ? a.unlockedSkills.filter((id) => id !== skillId)
          : [...a.unlockedSkills, skillId];
        const updatedPoints = exists
          ? Math.max(0, a.points - pts)
          : a.points + pts;

        return {
          ...a,
          unlockedSkills: updatedSkills,
          points: updatedPoints,
        };
      })
    );
    notify("Skill status updated", true);
  };

  const awardSpirit = (athleteId, spiritItem) => {
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id !== athleteId) return a;
        return {
          ...a,
          points: a.points + spiritItem.pts,
          spiritLog: [
            {
              icon: spiritItem.icon,
              name: spiritItem.name,
              pts: spiritItem.pts,
              by: user.name,
              date: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
            },
            ...(a.spiritLog || []),
          ],
        };
      })
    );
    notify(`Awarded ${spiritItem.name} (+${spiritItem.pts} pts)`, true);
  };

  const submitReportCard = (athleteId) => {
    if (!rcForm.period) {
      notify("Please specify report period");
      return;
    }
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id !== athleteId) return a;
        return {
          ...a,
          reportCards: [
            {
              period: rcForm.period,
              publishedBy: user.name,
              ratings: { ...rcForm.ratings },
              comments: rcForm.comments,
              goals: rcForm.goals,
            },
            ...(a.reportCards || []),
          ],
        };
      })
    );
    setShowRc(false);
    setRcForm({
      period: "",
      comments: "",
      goals: "",
      ratings: Object.fromEntries(REPORT_CATS.map((c) => [c, 3])),
    });
    notify("Report Card published!", true);
  };

  const submitAttendance = () => {
    setAthletes((prev) =>
      prev.map((a) => {
        if (!presentIds.includes(a.id)) return a;
        const pts = attType === "practice" ? 15 : 10;
        return {
          ...a,
          points: a.points + pts,
          attendanceLog: [
            {
              type: attType === "practice" ? "Practice" : "Open Gym",
              date: `${attDate}`,
              pts,
            },
            ...(a.attendanceLog || []),
          ],
        };
      })
    );
    setAttSubmitted(true);
    notify("Attendance recorded & points awarded!", true);
    setTimeout(() => setAttSubmitted(false), 3000);
  };

  const currentGymAthletes = athletes.filter((a) => a.gym === user.gym);
  const selectedAthlete = athletes.find((a) => a.id === sel);

  const navTabs = [
    { id: "roster", l: "Roster" },
    { id: "attendance", l: "Attendance" },
    { id: "teams", l: "Teams" },
    { id: "proshop", l: "Pro Shop" },
    ...(isOwner ? [{ id: "settings", l: "Gym Settings" }] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: F }}>
      <style>{GS}</style>
      {toast && <Toast {...toast} />}
      <GymBand gymName={user.gym} onLogout={onLogout} userRole={user.role} />
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff" }}>
        <NavTabs tabs={navTabs} active={tab} onSelect={setTab} />
      </div>

      <div style={{ padding: "24px 18px", maxWidth: 720, margin: "0 auto" }}>
        {/* ROSTER TAB */}
        {tab === "roster" && (
          <>
            <Title accent={ac}>Athlete Roster</Title>
            <Sub>Manage evaluations, spirit points, and report cards</Sub>

            {!selectedAthlete ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentGymAthletes.map((a) => (
                  <Card key={a.id} style={{ cursor: "pointer" }}>
                    <div
                      onClick={() => setSel(a.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: FC, fontSize: 20, fontWeight: 800 }}>
                          {a.name}
                        </div>
                        <div style={{ fontFamily: F, fontSize: 11, color: T.muted }}>
                          {a.team} · Level {a.level}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: FC, fontSize: 22, fontWeight: 800, color: ac }}>
                          {a.points} PTS
                        </div>
                        <div style={{ fontFamily: F, fontSize: 10, color: T.faint }}>
                          {a.unlockedSkills.length} Skills
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setSel(null)}
                  style={{
                    background: "#111111",
                    color: "#ffffff",
                    border: "none",
                    padding: "6px 14px",
                    borderRadius: 3,
                    cursor: "pointer",
                    fontFamily: F,
                    fontSize: 10,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  ← Back to Roster
                </button>

                <div style={{ borderBottom: `2px solid ${T.border}`, paddingBottom: 14, marginBottom: 20 }}>
                  <Title accent={ac}>{selectedAthlete.name}</Title>
                  <Sub>{selectedAthlete.team} · {selectedAthlete.points} PTS</Sub>
                </div>

                {/* Skill Unlocking */}
                <Lbl>Skills Management</Lbl>
                <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                  {Object.entries(BASE_SKILLS).map(([k, c]) => (
                    <button
                      key={k}
                      onClick={() => setActiveCat(k)}
                      style={{
                        background: activeCat === k ? ac : "#ffffff",
                        color: activeCat === k ? "#ffffff" : T.black,
                        border: `1px solid ${T.border2}`,
                        padding: "6px 12px",
                        borderRadius: 3,
                        cursor: "pointer",
                        fontFamily: F,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {c.label.split("&")[0]}
                    </button>
                  ))}
                </div>

                {Object.entries(BASE_SKILLS[activeCat].levels).map(([lvl, skills]) => (
                  <div key={lvl} style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: FC, fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
                      Level {lvl}
                    </div>
                    {skills.map((sk) => {
                      const isUnlocked = selectedAthlete.unlockedSkills.includes(sk.id);
                      return (
                        <div
                          key={sk.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 0",
                            borderBottom: `1px solid ${T.border}`,
                          }}
                        >
                          <div>
                            <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600 }}>
                              {sk.name}
                            </div>
                            <div style={{ fontFamily: F, fontSize: 10, color: T.faint }}>
                              {sk.desc}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleSkill(selectedAthlete.id, sk.id, parseInt(lvl))}
                            style={{
                              background: isUnlocked ? "#2d8a4e" : "#111111",
                              color: "#ffffff",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: 3,
                              cursor: "pointer",
                              fontFamily: F,
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            {isUnlocked ? "✓ Unlocked" : "+ Award"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Spirit Awards */}
                <div style={{ marginTop: 24 }}>
                  <Lbl>Award Spirit & Soft Skills</Lbl>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {SPIRIT_SOFT.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => awardSpirit(selectedAthlete.id, s)}
                        style={{
                          background: "#111111",
                          color: "#ffffff",
                          border: "none",
                          padding: "10px",
                          borderRadius: 3,
                          cursor: "pointer",
                          fontFamily: F,
                          fontSize: 10,
                          fontWeight: 700,
                          textAlign: "left",
                          textTransform: "uppercase",
                        }}
                      >
                        {s.icon} {s.name} (+{s.pts} pts)
                      </button>
                    ))}
                  </div>
                </div>

                {/* Report Card Issuance */}
                <div style={{ marginTop: 24 }}>
                  <Lbl>Issue Report Card</Lbl>
                  {!showRc ? (
                    <Btn onClick={() => setShowRc(true)}>+ Create New Report Card</Btn>
                  ) : (
                    <Card>
                      <Lbl>Report Period</Lbl>
                      <input
                        value={rcForm.period}
                        onChange={(e) => setRcForm((p) => ({ ...p, period: e.target.value }))}
                        placeholder="e.g. Mid-Season December 2026"
                        style={inp({ marginBottom: 12 })}
                      />

                      <Lbl>Ratings (1 - 5 Stars)</Lbl>
                      {REPORT_CATS.map((cat) => (
                        <div key={cat} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontFamily: F, fontSize: 12 }}>{cat}</span>
                          <select
                            value={rcForm.ratings[cat]}
                            onChange={(e) =>
                              setRcForm((p) => ({
                                ...p,
                                ratings: { ...p.ratings, [cat]: parseInt(e.target.value) },
                              }))
                            }
                            style={{ padding: "2px 8px" }}
                          >
                            {[1, 2, 3, 4, 5].map((num) => (
                              <option key={num} value={num}>
                                {num} ★
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}

                      <Lbl>Comments</Lbl>
                      <textarea
                        value={rcForm.comments}
                        onChange={(e) => setRcForm((p) => ({ ...p, comments: e.target.value }))}
                        placeholder="Progress comments..."
                        style={inp({ height: 60, marginBottom: 12 })}
                      />

                      <Lbl>Goals</Lbl>
                      <textarea
                        value={rcForm.goals}
                        onChange={(e) => setRcForm((p) => ({ ...p, goals: e.target.value }))}
                        placeholder="Goals for next cycle..."
                        style={inp({ height: 60, marginBottom: 12 })}
                      />

                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn onClick={() => submitReportCard(selectedAthlete.id)}>Publish Report</Btn>
                        <button
                          onClick={() => setShowRc(false)}
                          style={{
                            background: T.s3,
                            border: "none",
                            padding: "10px 16px",
                            borderRadius: 3,
                            cursor: "pointer",
                            fontFamily: F,
                            fontSize: 11,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ATTENDANCE TAB */}
        {tab === "attendance" && (
          <>
            <Title accent={ac}>Bulk Attendance</Title>
            <Sub>Scan athletes in and award attendance points</Sub>
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <Lbl>Date</Lbl>
                  <input
                    type="date"
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    style={inp()}
                  />
                </div>
                <div>
                  <Lbl>Type</Lbl>
                  <select
                    value={attType}
                    onChange={(e) => setAttType(e.target.value)}
                    style={inp()}
                  >
                    <option value="practice">Practice (+15 pts)</option>
                    <option value="opengym">Open Gym (+10 pts)</option>
                  </select>
                </div>
              </div>

              <Lbl>Select Present Athletes</Lbl>
              {currentGymAthletes.map((a) => (
                <label
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: `1px solid ${T.border}`,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={presentIds.includes(a.id)}
                    onChange={(e) => {
                      if (e.target.checked) setPresentIds((p) => [...p, a.id]);
                      else setPresentIds((p) => p.filter((id) => id !== a.id));
                    }}
                  />
                  <span style={{ fontFamily: F, fontSize: 13, fontWeight: 600 }}>
                    {a.name} ({a.team})
                  </span>
                </label>
              ))}

              <Btn onClick={submitAttendance} style={{ marginTop: 16, width: "100%" }}>
                Submit Attendance Log
              </Btn>
            </Card>
          </>
        )}

        {/* TEAMS TAB */}
        {tab === "teams" && (
          <>
            <Title accent={ac}>Team Roster Management</Title>
            <Sub>Create teams and assign athletes</Sub>

            <div style={{ marginBottom: 16 }}>
              {!showTeamForm ? (
                <Btn onClick={() => setShowTeamForm(true)}>+ Create New Team</Btn>
              ) : (
                <Card>
                  <Lbl>Team Name</Lbl>
                  <input
                    value={teamForm.name}
                    onChange={(e) => setTeamForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Senior Elite"
                    style={inp({ marginBottom: 10 })}
                  />
                  <Lbl>Level</Lbl>
                  <input
                    value={teamForm.level}
                    onChange={(e) => setTeamForm((p) => ({ ...p, level: e.target.value }))}
                    placeholder="e.g. Level 4"
                    style={inp({ marginBottom: 10 })}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn onClick={saveTeam}>Save Team</Btn>
                    <button
                      onClick={() => setShowTeamForm(false)}
                      style={{ background: T.s3, border: "none", padding: "10px", borderRadius: 3 }}
                    >
                      Cancel
                    </button>
                  </div>
                </Card>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {teams.map((t) => (
                <Card key={t.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: FC, fontSize: 18, fontWeight: 800 }}>{t.name}</div>
                      <div style={{ fontFamily: F, fontSize: 11, color: T.muted }}>
                        {t.level} · Coach: {t.coachName || "Unassigned"}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTeam(t.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#c0392b",
                        cursor: "pointer",
                        fontFamily: F,
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            <Card style={{ marginTop: 20 }}>
              <Lbl>Assign Athlete to Team</Lbl>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <select
                  value={assignForm.athleteId}
                  onChange={(e) => setAssignForm((p) => ({ ...p, athleteId: e.target.value }))}
                  style={inp()}
                >
                  <option value="">Select Athlete</option>
                  {currentGymAthletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <select
                  value={assignForm.teamId}
                  onChange={(e) => setAssignForm((p) => ({ ...p, teamId: e.target.value }))}
                  style={inp()}
                >
                  <option value="">Select Team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <Btn onClick={assignAthlete}>Assign Athlete</Btn>
            </Card>
          </>
        )}

        {/* PRO SHOP TAB */}
        {tab === "proshop" && (
          <ShopView
            gymName={user.gym}
            accentColor={ac}
            editable={true}
            shopItems={shopItems}
            setShopItems={setShopItems}
          />
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && isOwner && (
          <>
            <Title accent={ac}>Gym Branding & Settings</Title>
            <Sub>Configure gym colors and profile details</Sub>
            <Card>
              <Lbl>Gym Name</Lbl>
              <input
                value={gymSettings.name}
                onChange={(e) => setGymSettings((p) => ({ ...p, name: e.target.value }))}
                style={inp({ marginBottom: 12 })}
              />
              <Lbl>Primary Color (Hex or RGB)</Lbl>
              <input
                value={gymSettings.primary}
                onChange={(e) => setGymSettings((p) => ({ ...p, primary: e.target.value }))}
                style={inp({ marginBottom: 12 })}
              />
              <Btn onClick={() => notify("Settings updated!", true)}>Save Settings</Btn>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// ── PLATFORM ADMIN VIEW ───────────────────────────────────────────────────────
function AdminView({ user, onLogout }) {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: F }}>
      <style>{GS}</style>
      <GymBand gymName="Platform Admin" onLogout={onLogout} userRole="Super Admin" />
      <div style={{ padding: 24, maxWidth: 680, margin: "0 auto" }}>
        <Title>Platform Management</Title>
        <Sub>Global System Settings & Gym Management</Sub>
        <Card>
          <Lbl>Active Gym Partners</Lbl>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {Object.keys(GYM_CONFIGS).map((g) => (
              <li
                key={g}
                style={{
                  padding: "10px 0",
                  borderBottom: `1px solid ${T.border}`,
                  fontFamily: F,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ✦ {g}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ── MAIN APP ROOT COMPONENT ──────────────────────────────────────────────────
export default function CheerPassportApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [athletes, setAthletes] = useState(INIT_ATHLETES);

  if (!currentUser) {
    return <LoginScreen onLogin={(user) => setCurrentUser(user)} />;
  }

  if (currentUser.role === "platform_admin") {
    return <AdminView user={currentUser} onLogout={() => setCurrentUser(null)} />;
  }

  if (currentUser.role === "coach" || currentUser.role === "owner") {
    return (
      <CoachView
        user={currentUser}
        athletes={athletes}
        setAthletes={setAthletes}
        onLogout={() => setCurrentUser(null)}
      />
    );
  }

  return (
    <AthleteView
      user={currentUser}
      athletes={athletes}
      setAthletes={setAthletes}
      onLogout={() => setCurrentUser(null)}
    />
  );
}

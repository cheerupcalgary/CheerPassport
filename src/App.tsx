import { useState, useEffect } from "react";

// ── FONTS & BASE STYLES ───────────────────────────────────────────────────────
const GS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#ffffff;font-family:'Barlow',sans-serif;color:#111111}
  button{font-family:'Barlow',sans-serif;appearance:none;-webkit-appearance:none;font:inherit}
  input,select,textarea{font-family:'Barlow',sans-serif}
  input::placeholder,textarea::placeholder{color:#aaaaaa}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-track{background:#f5f5f5}
  ::-webkit-scrollbar-thumb{background:#cccccc;border-radius:2px}
`;

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const T = {
  bg:"#ffffff", s1:"#f8f8f8", s2:"#f0f0f0", s3:"#e8e8e8",
  border:"rgba(0,0,0,0.08)", border2:"rgba(0,0,0,0.15)",
  black:"#111111", dark:"#333333", muted:"#666666", faint:"#999999", light:"#cccccc",
  white:"#ffffff",
};
const F = "'Barlow',sans-serif";
const FC = "'Barlow Condensed',sans-serif";

// ── GYM CONFIGURATIONS ────────────────────────────────────────────────────────
const GYM_CONFIGS = {
  "Dynasty Cheer Allstars": {
    primary:"#1a1a1a", secondary:"#888888",
    name:"Dynasty Cheer Allstars",
    contactEmail:"info@dynastycheer.com",
  },
  "University of Calgary Cheerleading": {
    primary:"rgb(214,0,28)", secondary:"rgb(255,205,0)",
    name:"University of Calgary Cheerleading",
    contactEmail:"cheer@ucalgary.ca",
  },
};

// ── INVITE CODES ──────────────────────────────────────────────────────────────
const INVITE_CODES = {
  "DYNASTY-ATH-2026":    {role:"athlete", gym:"Dynasty Cheer Allstars"},
  "DYNASTY-COACH-2026":  {role:"coach",   gym:"Dynasty Cheer Allstars"},
  "DYNASTY-PARENT-2026": {role:"parent",  gym:"Dynasty Cheer Allstars"},
  "UOFC-ATH-2026":       {role:"athlete", gym:"University of Calgary Cheerleading"},
  "UOFC-COACH-2026":     {role:"coach",   gym:"University of Calgary Cheerleading"},
  "UOFC-PARENT-2026":    {role:"parent",  gym:"University of Calgary Cheerleading"},
  "PLATFORM-ADMIN":      {role:"platform_admin", gym:null},
};

// ── MOCK USERS ────────────────────────────────────────────────────────────────
// Parent accounts log in with the EMAIL on file for their athlete + a generic password.
// Parents can then create a username/password for their under-18 athlete from inside the app.
const MOCK_USERS = [
  // Athlete accounts created directly by parent (self-managed login for the child)
  {id:"u1",username:"zoek",    password:"cheer123",role:"athlete",      name:"Zoe K.",    athleteId:1,gym:"Dynasty Cheer Allstars"},
  {id:"u3",username:"aval",    password:"cheer123",role:"athlete",      name:"Ava L.",    athleteId:3,gym:"Dynasty Cheer Allstars"},
  // Coaches — each assigned to specific teams by the owner
  {id:"u5",username:"coacha",  password:"coach123", role:"coach",       name:"Coach Amy", gym:"Dynasty Cheer Allstars", assignedTeams:["Senior Elite"]},
  {id:"u9",username:"coachb",  password:"coach123", role:"coach",       name:"Coach Ben", gym:"Dynasty Cheer Allstars", assignedTeams:["Junior Varsity"]},
  {id:"u10",username:"coachc", password:"coach123", role:"coach",       name:"Coach Cara",gym:"Dynasty Cheer Allstars", assignedTeams:["Senior Elite","Junior Varsity"]},
  // Owner
  {id:"u6",username:"owner",   password:"owner123", role:"owner",       name:"Dynasty Owner",gym:"Dynasty Cheer Allstars",email:"owner@dynastycheer.com"},
  // Parent accounts — login via EMAIL + generic password, linked to one or more athletes
  {id:"u7",email:"zoesmom@email.com", password:"parent123",role:"parent",name:"Zoe's Mom", athleteIds:[1],gym:"Dynasty Cheer Allstars"},
  {id:"u11",email:"avasdad@email.com",password:"parent123",role:"parent",name:"Ava's Dad", athleteIds:[3],gym:"Dynasty Cheer Allstars"},
  // Platform admin
  {id:"u8",username:"admin",   password:"admin123", role:"platform_admin",name:"Platform Admin",gym:null},
];

// ── SKILL DATA ────────────────────────────────────────────────────────────────
const LEVEL_PTS = {1:10,2:20,3:35,4:55,5:80,6:110,7:150};
const REPORT_CATS = ["Skills Execution","Attitude & Spirit","Teamwork","Coachability","Competition Readiness","Consistency"];

const BASE_SKILLS = {
  stunts:{label:"Building & Stunts",icon:"◈",levels:{
    1:[{id:"st1_1",name:"Shoulder Sit",desc:"Flyer seated on base's shoulders"},{id:"st1_2",name:"Thigh Stand",desc:"Flyer on base's thighs"},{id:"st1_3",name:"Prep / Waist Level",desc:"Flyer at hip height"}],
    2:[{id:"st2_1",name:"Elevator / Prep Extension",desc:"Flyer at shoulder level"},{id:"st2_2",name:"Flat Back",desc:"Flyer horizontal at prep"},{id:"st2_3",name:"Chair / Lunge",desc:"Seated position on base"}],
    3:[{id:"st3_1",name:"Full Extension",desc:"Flyer at full arm extension"},{id:"st3_2",name:"Liberty (Prep)",desc:"One-leg at prep level"},{id:"st3_3",name:"Tick-Tock",desc:"Weight transfer skill"},{id:"st3_4",name:"Bow & Arrow (Prep)",desc:"Flexibility at prep"}],
    4:[{id:"st4_1",name:"Extended Liberty",desc:"One-leg at full extension"},{id:"st4_2",name:"Heel Stretch",desc:"Leg to head at extension"},{id:"st4_3",name:"Arabesque",desc:"Leg behind at extension"},{id:"st4_4",name:"Scorpion",desc:"Foot behind head"},{id:"st4_5",name:"Scale",desc:"Leg to side at extension"}],
    5:[{id:"st5_1",name:"Rewind",desc:"Release from extended stunt"},{id:"st5_2",name:"Straight Ride Basket",desc:"Clean straight body basket"},{id:"st5_3",name:"Toe Touch Basket",desc:"Toe touch at peak"},{id:"st5_4",name:"Pike Basket",desc:"Pike at peak"},{id:"st5_5",name:"Extended Pyramids",desc:"Connected stunts at extension"}],
    6:[{id:"st6_1",name:"Single Twist Basket",desc:"One full twist in basket"},{id:"st6_2",name:"Double Down Dismount",desc:"Two twists in dismount"},{id:"st6_3",name:"Suspended Splits",desc:"Splits at extension"},{id:"st6_4",name:"1-Arm Extended Lib",desc:"Liberty on single arm"},{id:"st6_5",name:"Inversions",desc:"Center of gravity above head"}],
    7:[{id:"st7_1",name:"Double Twist Basket",desc:"Two full twists"},{id:"st7_2",name:"Layout Basket",desc:"Layout in basket"},{id:"st7_3",name:"Full-Up",desc:"Full twist into stunt"},{id:"st7_4",name:"3-High Pyramid",desc:"Three-person pyramid"},{id:"st7_5",name:"Advanced Inversions",desc:"Inverted with twisting"},{id:"st7_6",name:"Twisting Release Moves",desc:"Elite toss-catch"}],
  }},
  tumbling:{label:"Tumbling",icon:"◎",levels:{
    1:[{id:"tu1_1",name:"Forward Roll",desc:"Basic forward rotation"},{id:"tu1_2",name:"Backward Roll",desc:"Basic backward rotation"},{id:"tu1_3",name:"Cartwheel",desc:"Lateral rotation"},{id:"tu1_4",name:"Handstand",desc:"Balanced inversion"}],
    2:[{id:"tu2_1",name:"Round-Off",desc:"Cartwheel feet together"},{id:"tu2_2",name:"Front Walkover",desc:"Forward walkover"},{id:"tu2_3",name:"Back Walkover",desc:"Backward walkover"},{id:"tu2_4",name:"Back Limber",desc:"Back bend kick-over"}],
    3:[{id:"tu3_1",name:"Back Handspring",desc:"Backward spring off hands"},{id:"tu3_2",name:"Front Handspring",desc:"Forward spring off hands"},{id:"tu3_3",name:"Round-Off BHS",desc:"Round-off into BHS"}],
    4:[{id:"tu4_1",name:"Standing Back Tuck",desc:"Standing backward salto"},{id:"tu4_2",name:"Round-Off BHS Tuck",desc:"Series into back tuck"},{id:"tu4_3",name:"Front Tuck",desc:"Forward salto tucked"},{id:"tu4_4",name:"BHS Series",desc:"Multiple back handsprings"}],
    5:[{id:"tu5_1",name:"Standing Layout",desc:"Standing back salto straight"},{id:"tu5_2",name:"RO BHS Layout",desc:"Series into layout"},{id:"tu5_3",name:"Whip Back",desc:"Whip-style back salto"},{id:"tu5_4",name:"Standing Full",desc:"Standing full twist"}],
    6:[{id:"tu6_1",name:"RO BHS Full",desc:"Series into full twist"},{id:"tu6_2",name:"Double Back Tuck",desc:"Two rotations tucked"},{id:"tu6_3",name:"Layout Step-Out",desc:"Layout step-out landing"}],
    7:[{id:"tu7_1",name:"Double Full",desc:"Layout double twist"},{id:"tu7_2",name:"Full-In / Full-Out",desc:"Double back full twist"},{id:"tu7_3",name:"Arabian",desc:"Half twist to front salto"},{id:"tu7_4",name:"Triple Full",desc:"Layout triple twist"}],
  }},
  jumps:{label:"Jumps",icon:"△",levels:{
    1:[{id:"ju1_1",name:"Spread Eagle",desc:"Arms and legs to sides"},{id:"ju1_2",name:"Tuck Jump",desc:"Knees to chest"},{id:"ju1_3",name:"Star Jump",desc:"Arms and legs diagonal"}],
    2:[{id:"ju2_1",name:"Toe Touch",desc:"Legs to sides pointed"},{id:"ju2_2",name:"Right Hurdler",desc:"Right fwd left bent"},{id:"ju2_3",name:"Left Hurdler",desc:"Left fwd right bent"}],
    3:[{id:"ju3_1",name:"Pike",desc:"Both legs forward"},{id:"ju3_2",name:"Right Herkie",desc:"Right straight left down"},{id:"ju3_3",name:"Left Herkie",desc:"Left straight right down"},{id:"ju3_4",name:"Double Hook",desc:"Both legs bent behind"}],
    4:[{id:"ju4_1",name:"Toe Touch Series",desc:"Multiple toe touches"},{id:"ju4_2",name:"Jump to Tumbling",desc:"Jump into tumbling"},{id:"ju4_3",name:"Switch Kicks",desc:"Alternating kicks"}],
    5:[{id:"ju5_1",name:"Advanced Jump Series",desc:"3+ jumps in combo"},{id:"ju5_2",name:"Toe Touch Back Tuck",desc:"Toe touch into tuck"},{id:"ju5_3",name:"Pike Full",desc:"Pike with full twist"}],
  }},
  tosses:{label:"Tosses",icon:"◇",levels:{
    5:[{id:"to5_1",name:"Straight Ride",desc:"Clean straight body at peak"},{id:"to5_2",name:"Toe Touch Toss",desc:"Toe touch at peak"},{id:"to5_3",name:"Pike Toss",desc:"Pike at peak"},{id:"to5_4",name:"Hurdler Toss",desc:"Hurdler at peak"}],
    6:[{id:"to6_1",name:"Single Twist",desc:"One full twist"},{id:"to6_2",name:"Kick Single",desc:"Kick then single twist"},{id:"to6_3",name:"Ball-Down",desc:"Tuck with twist out"}],
    7:[{id:"to7_1",name:"Double Twist",desc:"Two full twists"},{id:"to7_2",name:"Layout Toss",desc:"Straight layout at peak"},{id:"to7_3",name:"Kick Double",desc:"Kick then double twist"},{id:"to7_4",name:"Triple Twist",desc:"Three full twists"},{id:"to7_5",name:"Twisting Rewind",desc:"Release with twist to cradle"}],
  }},
};

const SPIRIT_SOFT = [
  {id:"sp1",name:"Spirit Award",icon:"✦",pts:25,desc:"Outstanding spirit & energy"},
  {id:"sp2",name:"Great Teammate",icon:"◈",pts:20,desc:"Lifted teammates today"},
  {id:"sp3",name:"Leadership",icon:"△",pts:30,desc:"Led by example"},
  {id:"sp4",name:"Most Improved",icon:"↑",pts:35,desc:"Remarkable growth shown"},
  {id:"sp5",name:"Positive Attitude",icon:"○",pts:20,desc:"Stayed positive through challenges"},
  {id:"sp6",name:"Hard Worker",icon:"◆",pts:25,desc:"Extra effort every rep"},
  {id:"sp7",name:"Coachable",icon:"◎",pts:20,desc:"Applied feedback immediately"},
  {id:"sp8",name:"Game Day Ready",icon:"★",pts:30,desc:"Came prepared and focused"},
];

const INIT_ATHLETES = [
  {id:1,name:"Zoe K.",dob:"2008-03-12",gym:"Dynasty Cheer Allstars",team:"Senior Elite",level:4,points:1420,attendance:94,joinDate:"Aug 2023",
   parentEmail:"zoesmom@email.com",childUsername:"zoek",childPassword:"cheer123",
   unlockedSkills:["st1_1","st1_2","st1_3","st2_1","st2_2","st3_1","st3_2","tu1_1","tu1_2","tu1_3","tu1_4","tu2_1","tu2_2","tu2_3","tu3_1","tu3_2","tu3_3","tu4_1","tu4_2","ju1_1","ju1_2","ju1_3","ju2_1","ju2_2","ju3_1","to5_1","to5_2"],
   spiritLog:[{icon:"△",name:"Leadership",pts:30,by:"Coach Amy",date:"May 14"},{icon:"◈",name:"Great Teammate",pts:20,by:"Coach Amy",date:"May 10"}],
   attendanceLog:[{type:"Practice",date:"May 16, 4:02 PM",pts:15},{type:"Practice",date:"May 14, 4:00 PM",pts:15},{type:"Open Gym",date:"May 12, 3:30 PM",pts:10}],
   perfectMonths:["May 2026","April 2026"],
   levelHistory:[{cat:"Tumbling",level:4,date:"Apr 2026"},{cat:"Building",level:3,date:"Feb 2026"}],
   reportCards:[{period:"Mid-Season December 2025",publishedBy:"Coach Amy",ratings:{"Skills Execution":4,"Attitude & Spirit":5,"Teamwork":5,"Coachability":4,"Competition Readiness":4,"Consistency":3},comments:"Zoe has shown tremendous improvement this first half. Her stunting is outstanding — reliable flyer, communicates well with bases. Working on consistency in her layout.",goals:"Land a clean standing layout by January. Work on series consistency at competition."}],
  },
  {id:2,name:"Madison T.",dob:"2009-07-22",gym:"Dynasty Cheer Allstars",team:"Senior Elite",level:3,points:1380,attendance:91,joinDate:"Sep 2023",
   parentEmail:"madisonsmom@email.com",childUsername:null,childPassword:null,
   unlockedSkills:["st1_1","st1_2","tu1_1","tu1_2","tu2_1","ju1_1","ju1_2"],spiritLog:[{icon:"○",name:"Positive Attitude",pts:20,by:"Coach Amy",date:"May 13"}],attendanceLog:[{type:"Practice",date:"May 16, 4:10 PM",pts:15}],perfectMonths:["April 2026"],levelHistory:[],reportCards:[]},
  {id:3,name:"Ava L.",dob:"2010-11-05",gym:"Dynasty Cheer Allstars",team:"Junior Varsity",level:2,points:1150,attendance:88,joinDate:"Jan 2024",
   parentEmail:"avasdad@email.com",childUsername:"aval",childPassword:"cheer123",
   unlockedSkills:["st1_1","tu1_1","tu1_2","tu1_3","ju1_1"],spiritLog:[],attendanceLog:[{type:"Practice",date:"May 15, 4:00 PM",pts:15}],perfectMonths:[],levelHistory:[],reportCards:[]},
  {id:4,name:"Taylor R.",dob:"2011-04-18",gym:"Dynasty Cheer Allstars",team:"Junior Varsity",level:1,points:820,attendance:82,joinDate:"Mar 2024",
   parentEmail:"taylorsparent@email.com",childUsername:null,childPassword:null,
   unlockedSkills:["st1_1","tu1_1","ju1_1"],spiritLog:[],attendanceLog:[],perfectMonths:[],levelHistory:[],reportCards:[]},
];

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function Toast({msg,dark}){
  return <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:dark?T.black:"#ffffff",color:dark?"#ffffff":T.black,fontFamily:F,fontWeight:700,fontSize:11,padding:"10px 22px",borderRadius:3,zIndex:10001,letterSpacing:2,border:`1px solid ${T.border2}`,whiteSpace:"nowrap",textTransform:"uppercase",boxShadow:"0 4px 20px rgba(0,0,0,0.12)"}}>{msg}</div>;
}

function Bar({value,max,color="#111111"}){
  return <div style={{background:T.s3,height:2,width:"100%",borderRadius:1}}><div style={{width:`${Math.min(100,Math.round(value/max*100))}%`,background:color,height:2,borderRadius:1,transition:"width .5s"}}/></div>;
}

function LPill({level,color="#111111",sm}){
  return <span style={{border:`1px solid ${color}`,padding:sm?"2px 8px":"3px 12px",fontSize:sm?9:10,fontFamily:F,fontWeight:700,letterSpacing:2,color,textTransform:"uppercase",whiteSpace:"nowrap",borderRadius:2}}>Level {level}</span>;
}

function CPLogo({size=36}){
  return(
    <img
      src="https://i.imgur.com/VRamQeI.png"
      alt="Cheer Passport"
      width={size}
      height={size}
      style={{objectFit:"contain",display:"block"}}
    />
  );
}

function GymBand({gymName,onLogout,userRole}){
  const config = GYM_CONFIGS[gymName] || {primary:"#111111",secondary:"#888888",name:gymName};
  return(
    <div style={{background:config.primary,padding:"12px 18px",display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:40,height:40,borderRadius:"50%",background:config.secondary,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontSize:14,fontWeight:800,color:config.primary,flexShrink:0}}>
        {gymName.split(" ").map(w=>w[0]).join("").slice(0,2)}
      </div>
      <div style={{flex:1}}>
        <div style={{fontFamily:FC,fontSize:16,fontWeight:800,color:"#ffffff",letterSpacing:1,textTransform:"uppercase",lineHeight:1}}>{config.name}</div>
        <div style={{fontFamily:F,fontSize:9,color:"rgba(255,255,255,0.7)",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>{userRole}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <CPLogo size={36}/>
        {onLogout&&<button onClick={onLogout} style={{background:"#000000",border:"2px solid #ffffff",color:"#ffffff",padding:"5px 12px",cursor:"pointer",fontFamily:F,fontSize:9,letterSpacing:2,borderRadius:2,textTransform:"uppercase",fontWeight:700}}>Log Out</button>}
      </div>
    </div>
  );
}

function NavTabs({tabs,active,onSelect}){
  return(
    <div style={{display:"flex",overflowX:"auto",borderBottom:`1px solid ${T.border}`,background:"#ffffff"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onSelect(t.id)} style={{background:active===t.id?"#111111":"#ffffff",border:"none",borderBottom:active===t.id?"2px solid #111111":"2px solid transparent",color:active===t.id?"#ffffff":"#111111",padding:"12px 16px",cursor:"pointer",fontFamily:F,fontWeight:700,fontSize:10,letterSpacing:2,whiteSpace:"nowrap",transition:"all .15s",textTransform:"uppercase"}}>
          {t.l}
        </button>
      ))}
    </div>
  );
}

const inp = (extra={}) => ({background:"#ffffff",border:`1px solid ${T.border2}`,color:T.black,padding:"11px 13px",fontFamily:F,fontSize:14,width:"100%",outline:"none",borderRadius:3,...extra});
const Title = ({children,accent}) => <div style={{fontFamily:FC,fontSize:30,fontWeight:800,color:accent||T.black,letterSpacing:2,textTransform:"uppercase",marginBottom:2}}>{children}</div>;
const Sub   = ({children}) => <div style={{fontFamily:F,fontSize:10,color:T.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:20}}>{children}</div>;
const Lbl   = ({children}) => <div style={{fontFamily:F,fontSize:9,color:T.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>{children}</div>;
const Card  = ({children,style={}}) => <div style={{border:`1px solid ${T.border}`,borderRadius:4,padding:18,...style}}>{children}</div>;

// ── BTN helper — always black background, always white text ──────────────────
const Btn = ({onClick,children,style={},...rest}) => (
  <button onClick={onClick} {...rest} style={{background:"#111111",border:"none",color:"#ffffff",cursor:"pointer",fontFamily:F,fontWeight:700,fontSize:11,letterSpacing:2,borderRadius:3,padding:"10px 16px",textTransform:"uppercase",...style}}>
    {children}
  </button>
);

// ── LIGHT-COLOR DETECTION ────────────────────────────────────────────────────
function isLightColor(color){
  if(!color) return false;
  let r,g,b;
  if(color.startsWith("rgb")){
    const nums=color.match(/\d+/g);[r,g,b]=nums.map(Number);
  } else {
    const hex=color.replace("#","");
    const full=hex.length===3?hex.split("").map(c=>c+c).join(""):hex;
    r=parseInt(full.substring(0,2),16);g=parseInt(full.substring(2,4),16);b=parseInt(full.substring(4,6),16);
  }
  if([r,g,b].some(isNaN)) return false;
  return (0.299*r+0.587*g+0.114*b)/255 > 0.6;
}

// ── STAMP / BADGE MODAL ───────────────────────────────────────────────────────
function StampModal({title,subtitle,detail,accentColor,athleteName,gymName,onClose}){
  const ac = accentColor||"#111111";
  const bandText = isLightColor(ac) ? "#111111" : "#ffffff";

  const downloadBadge=()=>{
    const W=1080,H=1350,canvas=document.createElement("canvas");
    canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext("2d");
    ctx.fillStyle="#000000";ctx.fillRect(0,0,W,H);
    ctx.fillStyle=ac;ctx.fillRect(0,0,W,260);
    ctx.fillStyle=isLightColor(ac)?"#111111":"#ffffff";
    ctx.font="800 44px Arial";ctx.textAlign="center";
    ctx.fillText((gymName||"Cheer Passport").toUpperCase(),W/2,150);
    ctx.font="600 26px Arial";ctx.globalAlpha=0.8;
    ctx.fillText("CHEER PASSPORT",W/2,200);ctx.globalAlpha=1;
    const cx=W/2,cy=480,r=170;
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle="#ffffff";ctx.lineWidth=10;ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,r+22,0,Math.PI*2);
    ctx.setLineDash([10,12]);ctx.strokeStyle="rgba(255,255,255,0.4)";ctx.lineWidth=3;ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle="#f0c040";ctx.font="120px Arial";ctx.textBaseline="middle";ctx.fillText("✦",cx,cy-10);ctx.textBaseline="alphabetic";
    ctx.fillStyle="rgba(255,255,255,0.7)";ctx.font="600 28px Arial";ctx.fillText("CERTIFIED",cx,740);
    ctx.fillStyle="#ffffff";ctx.font="800 70px Arial";ctx.fillText(title.toUpperCase(),cx,830);
    ctx.fillStyle="#f0c040";ctx.font="700 36px Arial";ctx.fillText(subtitle.toUpperCase(),cx,890);
    ctx.fillStyle="#ffffff";ctx.font="600 40px Arial";ctx.fillText(athleteName||"",cx,970);
    ctx.fillStyle="rgba(255,255,255,0.75)";ctx.font="400 30px Arial";
    const words=(detail||"").split(" ");let line="",y=1040;
    words.forEach(w=>{const t=line+w+" ";if(ctx.measureText(t).width>W-160&&line!==""){ctx.fillText(line.trim(),cx,y);line=w+" ";y+=40;}else line=t;});
    if(line)ctx.fillText(line.trim(),cx,y);
    ctx.strokeStyle="rgba(255,255,255,0.25)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(140,H-130);ctx.lineTo(W-140,H-130);ctx.stroke();
    ctx.fillStyle="rgba(255,255,255,0.6)";ctx.font="600 24px Arial";ctx.fillText("CHEER PASSPORT · TRACK · EARN · BUILD YOUR LEGACY",cx,H-80);
    const link=document.createElement("a");
    link.download=`${(athleteName||"badge").replace(/\s+/g,"_")}_${title.replace(/\s+/g,"_")}.png`;
    link.href=canvas.toDataURL("image/png");link.click();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"#000000",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#111111",borderRadius:8,maxWidth:340,width:"100%",overflow:"hidden",border:"2px solid #444444"}}>
        {/* Gym colour band */}
        <div style={{background:ac,padding:"20px 24px",textAlign:"center"}}>
          <div style={{fontFamily:FC,fontSize:18,fontWeight:800,color:bandText,letterSpacing:2,textTransform:"uppercase",lineHeight:1}}>{gymName||"Cheer Passport"}</div>
          <div style={{fontFamily:F,fontSize:9,color:bandText==="#ffffff"?"rgba(255,255,255,0.75)":"rgba(0,0,0,0.6)",letterSpacing:3,textTransform:"uppercase",marginTop:4}}>Cheer Passport</div>
        </div>
        {/* Black body */}
        <div style={{padding:"28px 24px",textAlign:"center",background:"#111111"}}>
          <div style={{width:100,height:100,borderRadius:"50%",border:"4px solid #ffffff",margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",background:"#000000"}}>
            <span style={{fontSize:42,color:"#f0c040",lineHeight:1}}>✦</span>
            <div style={{position:"absolute",inset:-10,borderRadius:"50%",border:"2px dashed rgba(255,255,255,0.35)"}}/>
          </div>
          <div style={{fontFamily:F,fontWeight:700,fontSize:9,letterSpacing:4,color:"rgba(255,255,255,0.65)",marginBottom:8,textTransform:"uppercase"}}>Certified</div>
          <div style={{fontFamily:FC,fontSize:28,fontWeight:800,color:"#ffffff",marginBottom:6,textTransform:"uppercase",letterSpacing:1,lineHeight:1.1}}>{title}</div>
          <div style={{fontFamily:F,fontSize:13,color:"#f0c040",fontWeight:700,letterSpacing:2,marginBottom:8,textTransform:"uppercase"}}>{subtitle}</div>
          {athleteName&&<div style={{fontFamily:F,fontSize:14,color:"#ffffff",fontWeight:600,marginBottom:6}}>{athleteName}</div>}
          <div style={{fontFamily:F,fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:20,lineHeight:1.5}}>{detail}</div>
          <div style={{borderTop:"1px solid rgba(255,255,255,0.2)",paddingTop:12,marginBottom:16}}>
            <div style={{fontFamily:F,fontSize:8,letterSpacing:3,color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>Cheer Passport · Track · Earn · Build Your Legacy</div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{flex:1,background:"#111111",border:"2px solid #ffffff",color:"#ffffff",borderRadius:3,padding:"11px",cursor:"pointer",fontFamily:F,fontWeight:700,fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>Close</button>
            <button onClick={downloadBadge} style={{flex:1.4,background:"#ffffff",border:"none",color:"#111111",borderRadius:3,padding:"11px",cursor:"pointer",fontFamily:F,fontWeight:800,fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>↓ Save Image</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── REPORT MODAL ──────────────────────────────────────────────────────────────
function ReportModal({card,name,onClose}){
  return(
    <div style={{position:"fixed",inset:0,background:"#000000",zIndex:10000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:16,overflowY:"auto"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#111111",border:"2px solid #444444",borderRadius:4,padding:26,maxWidth:420,width:"100%",marginTop:20,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <div>
            <div style={{fontFamily:F,fontSize:9,color:"rgba(255,255,255,0.6)",letterSpacing:3,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>Progress Report</div>
            <div style={{fontFamily:FC,fontWeight:800,fontSize:22,color:"#ffffff",textTransform:"uppercase",letterSpacing:1}}>{name}</div>
            <div style={{fontFamily:F,fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:2,fontWeight:500}}>{card.period}</div>
          </div>
          <button onClick={onClose} style={{background:"#000000",border:"2px solid #ffffff",color:"#ffffff",padding:"5px 11px",cursor:"pointer",fontFamily:F,fontSize:13,fontWeight:700,borderRadius:3}}>✕</button>
        </div>
        <div style={{fontFamily:F,fontSize:9,color:"rgba(255,255,255,0.6)",letterSpacing:3,textTransform:"uppercase",marginBottom:12,fontWeight:600}}>Ratings</div>
        {REPORT_CATS.map(cat=>{
          const r=card.ratings[cat]||0;
          return(
            <div key={cat} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontFamily:F,fontSize:12,color:"#ffffff",fontWeight:600}}>{cat}</span>
                <span style={{color:"#f0c040",fontSize:14,letterSpacing:2}}>{"★".repeat(r)}{"☆".repeat(5-r)}</span>
              </div>
              <Bar value={r} max={5} color="#ffffff"/>
            </div>
          );
        })}
        <div style={{borderTop:"1px solid rgba(255,255,255,0.2)",paddingTop:18,marginBottom:16}}>
          <div style={{fontFamily:F,fontSize:9,color:"rgba(255,255,255,0.6)",letterSpacing:3,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>Coach Commentary</div>
          <div style={{fontFamily:F,fontSize:14,color:"#ffffff",lineHeight:1.7,fontWeight:400}}>{card.comments}</div>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.2)",paddingTop:18}}>
          <div style={{fontFamily:F,fontSize:9,letterSpacing:4,color:"#000000",background:"#f0c040",display:"inline-block",padding:"3px 10px",borderRadius:2,marginBottom:10,textTransform:"uppercase",fontWeight:800}}>Goals — Next Period</div>
          <div style={{fontFamily:F,fontSize:14,color:"#ffffff",lineHeight:1.7,fontWeight:400}}>{card.goals}</div>
        </div>
        <div style={{fontFamily:F,fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.5)",textAlign:"center",marginTop:18,textTransform:"uppercase"}}>Issued by {card.publishedBy}</div>
      </div>
    </div>
  );
}

// ── LOGIN SCREEN ──────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [mode,setMode]=useState("login");
  const [loginId,setLoginId]=useState(""); // username OR email
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [code,setCode]=useState("");
  const [error,setError]=useState("");
  const [users,setUsers]=useState(MOCK_USERS);

  const handleLogin=()=>{
    setError("");
    if(!loginId||!password){setError("Please enter your username/email and password.");return;}
    const id=loginId.toLowerCase().trim();
    const u=users.find(u=>
      (u.username&&u.username.toLowerCase()===id||u.email&&u.email.toLowerCase()===id)
      &&u.password===password
    );
    if(!u){setError("Incorrect username/email or password.");return;}
    onLogin(u);
  };

  const handleRegister=()=>{
    setError("");
    if(!name||!loginId||!password||!code){setError("All fields are required.");return;}
    const invite=INVITE_CODES[code.toUpperCase()];
    if(!invite){setError("Invalid invite code. Please check with your gym.");return;}
    if(invite.role!=="coach"){setError("Self-registration is for coaches only. Athletes and parents are set up by your gym owner.");return;}
    if(users.find(u=>u.username&&u.username.toLowerCase()===loginId.toLowerCase())){setError("Username already taken.");return;}
    if(password.length<6){setError("Password must be at least 6 characters.");return;}
    setUsers(p=>[...p,{id:`u${Date.now()}`,username:loginId,password,role:invite.role,name,gym:invite.gym,assignedTeams:[]}]);
    setMode("login");setLoginId(loginId);setPassword("");
    setError("Account created! You can now log in. Ask your gym owner to assign you to a team.");
  };

  return(
    <div style={{minHeight:"100vh",background:"#ffffff",display:"flex",flexDirection:"column",fontFamily:F}}>
      <style>{GS}</style>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{width:"100%",maxWidth:400}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><CPLogo size={140}/></div>
            <div style={{fontFamily:FC,fontSize:36,fontWeight:800,color:T.black,letterSpacing:4,textTransform:"uppercase",lineHeight:1}}>Cheer Passport</div>
            <div style={{fontFamily:F,fontSize:10,color:T.muted,letterSpacing:4,textTransform:"uppercase",marginTop:6}}>Track · Earn · Build Your Legacy</div>
          </div>
          <div style={{display:"flex",borderBottom:`2px solid ${T.border}`,marginBottom:24}}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError("");}} style={{flex:1,background:mode===m?"#111111":"#ffffff",border:"none",borderBottom:mode===m?"2px solid #111111":"2px solid transparent",marginBottom:-2,color:mode===m?"#ffffff":"#111111",padding:"10px",cursor:"pointer",fontFamily:F,fontWeight:700,fontSize:11,letterSpacing:3,textTransform:"uppercase",transition:"all .15s"}}>
                {m==="login"?"Log In":"Coach Register"}
              </button>
            ))}
          </div>
          {mode==="login"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><Lbl>Username or Email</Lbl><input value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder="username (athlete/coach/owner) or email (parent)" style={inp()} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/></div>
              <div><Lbl>Password</Lbl><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp()} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/></div>
              {error&&<div style={{fontFamily:F,fontSize:12,color:error.includes("created")?"#2d8a4e":"#c0392b",padding:"10px 13px",border:`1px solid ${error.includes("created")?"#c3e6cb":"#f5c6cb"}`,borderRadius:3,background:error.includes("created")?"#d4edda":"#fff5f5"}}>{error}</div>}
              <button onClick={handleLogin} style={{background:"#111111",border:"none",color:"#ffffff",padding:"14px",cursor:"pointer",fontFamily:F,fontSize:12,letterSpacing:4,fontWeight:800,borderRadius:3,textTransform:"uppercase",marginTop:4}}>Log In</button>
              <div style={{fontFamily:F,fontSize:10,color:T.faint,textAlign:"center",lineHeight:1.8}}>
                Demo athlete: <span style={{color:T.muted}}>zoek / cheer123</span><br/>
                Demo parent (use email): <span style={{color:T.muted}}>zoesmom@email.com / parent123</span><br/>
                Demo coaches: <span style={{color:T.muted}}>coacha / coach123</span> · <span style={{color:T.muted}}>coachb / coach123</span> · <span style={{color:T.muted}}>coachc / coach123</span><br/>
                Demo owner: <span style={{color:T.muted}}>owner / owner123</span> · Admin: <span style={{color:T.muted}}>admin / admin123</span>
              </div>
            </div>
          )}
          {mode==="register"&&(
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div style={{background:"#fffbf0",border:"1px solid #f0d080",borderRadius:3,padding:13}}>
                <div style={{fontFamily:F,fontSize:10,color:"#b8860b",letterSpacing:2,fontWeight:700,marginBottom:4,textTransform:"uppercase"}}>✦ Coaches Only</div>
                <div style={{fontFamily:F,fontSize:12,color:T.muted,lineHeight:1.5}}>Athlete and parent accounts are created directly by your gym owner. If you're a coach, register here with the coach invite code — your owner will then assign you to a team.</div>
              </div>
              <div><Lbl>Full Name</Lbl><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" style={inp()}/></div>
              <div><Lbl>Username</Lbl><input value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder="choose a username" style={inp()}/></div>
              <div><Lbl>Password</Lbl><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="min 6 characters" style={inp()}/></div>
              <div>
                <Lbl>Coach Invite Code</Lbl>
                <input value={code} onChange={e=>setCode(e.target.value)} placeholder="e.g. DYNASTY-COACH-2026" style={{...inp(),textTransform:"uppercase",letterSpacing:3}}/>
                <div style={{fontFamily:F,fontSize:9,color:T.faint,marginTop:5}}>Demo codes: DYNASTY-COACH-2026 · UOFC-COACH-2026</div>
              </div>
              {error&&<div style={{fontFamily:F,fontSize:12,color:error.includes("created")?"#2d8a4e":"#c0392b",padding:"10px 13px",border:`1px solid ${error.includes("created")?"#c3e6cb":"#f5c6cb"}`,borderRadius:3,background:error.includes("created")?"#d4edda":"#fff5f5"}}>{error}</div>}
              <button onClick={handleRegister} style={{background:"#111111",border:"none",color:"#ffffff",padding:"14px",cursor:"pointer",fontFamily:F,fontSize:12,letterSpacing:4,fontWeight:800,borderRadius:3,textTransform:"uppercase",marginTop:4}}>Create Coach Account</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ATHLETE / PARENT VIEW ─────────────────────────────────────────────────────
function AthleteView({user,athletes,setAthletes,shopItems,setShopItems,orders,setOrders,onLogout}){
  const isParent=user.role==="parent";
  const linkedAthletes=isParent?athletes.filter(a=>(user.athleteIds||[]).includes(a.id)):[];
  const [selectedAthleteId,setSelectedAthleteId]=useState(isParent?(linkedAthletes[0]?.id):user.athleteId);
  const athlete=isParent?(athletes.find(a=>a.id===selectedAthleteId)||linkedAthletes[0]):(athletes.find(a=>a.id===user.athleteId)||athletes[0]);
  const gymCfg=GYM_CONFIGS[user.gym]||{primary:"#111111",secondary:"#888888"};
  const ac=gymCfg.primary;

  const [tab,setTab]=useState("passport");
  const [points,setPoints]=useState(athlete.points);
  const [owned,setOwned]=useState([]);
  const [toast,setToast]=useState(null);
  const [activeCat,setActiveCat]=useState("stunts");
  const [stamp,setStamp]=useState(null);
  const [report,setReport]=useState(null);
  const [showChildLogin,setShowChildLogin]=useState(false);
  const [childForm,setChildForm]=useState({username:"",password:""});

  const notify=(msg,dark=false)=>{setToast({msg,dark});setTimeout(()=>setToast(null),2200);};

  // Keep points in sync if parent switches between linked children
  useEffect(()=>{setPoints(athlete.points);},[athlete.id]);

  const createChildLogin=()=>{
    if(!childForm.username.trim()||childForm.password.length<6){notify("Username required, password min 6 characters");return;}
    setAthletes(p=>p.map(a=>a.id===athlete.id?{...a,childUsername:childForm.username.trim(),childPassword:childForm.password}:a));
    notify(`Login created for ${athlete.name}`,true);
    setShowChildLogin(false);setChildForm({username:"",password:""});
  };
  const removeChildLogin=()=>{
    setAthletes(p=>p.map(a=>a.id===athlete.id?{...a,childUsername:null,childPassword:null}:a));
    notify("Login removed");
  };

  const allSkills=Object.values(BASE_SKILLS).flatMap(c=>Object.values(c.levels).flat());
  const unlocked=allSkills.filter(s=>athlete.unlockedSkills.includes(s.id)).length;

  const tabs=isParent
    ?[{id:"passport",l:"Passport"},{id:"skills",l:"Skills"},{id:"report",l:"Reports"},{id:"shop",l:"Shop"},{id:"account",l:"Child Login"}]
    :[{id:"passport",l:"Passport"},{id:"skills",l:"Skills"},{id:"spirit",l:"Spirit"},{id:"report",l:"Reports"},{id:"shop",l:"Shop"},{id:"ranks",l:"Rankings"}];

  return(
    <div style={{minHeight:"100vh",background:"#ffffff",color:T.black,fontFamily:F}}>
      <style>{GS}</style>
      {toast&&<Toast {...toast}/>}
      {stamp&&<StampModal {...stamp} accentColor={ac} athleteName={athlete.name} gymName={gymCfg.name||user.gym} onClose={()=>setStamp(null)}/>}
      {report&&<ReportModal card={report} name={athlete.name} onClose={()=>setReport(null)}/>}
      <GymBand gymName={user.gym} onLogout={onLogout} userRole={isParent?`Parent of ${linkedAthletes.length} athlete${linkedAthletes.length!==1?"s":""}`:user.role}/>

      {/* Child switcher for parents with multiple linked athletes */}
      {isParent&&linkedAthletes.length>1&&(
        <div style={{background:T.s1,borderBottom:`1px solid ${T.border}`,padding:"10px 18px",display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontFamily:F,fontSize:9,color:T.muted,letterSpacing:2,textTransform:"uppercase",marginRight:4}}>Viewing:</span>
          {linkedAthletes.map(a=>(
            <button key={a.id} onClick={()=>setSelectedAthleteId(a.id)} style={{background:"#111111",border:selectedAthleteId===a.id?"2px solid #ffffff":"2px solid transparent",color:"#ffffff",opacity:selectedAthleteId===a.id?1:0.5,padding:"5px 12px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:1,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>{a.name}</button>
          ))}
        </div>
      )}

      <div style={{position:"sticky",top:0,zIndex:100,background:"#ffffff",boxShadow:"0 1px 0 rgba(0,0,0,0.08)"}}>
        <NavTabs tabs={tabs} active={tab} onSelect={setTab}/>
      </div>
      <div style={{padding:"24px 18px",maxWidth:680,margin:"0 auto"}}>

        {/* CHILD LOGIN MANAGEMENT (parent only) */}
        {tab==="account"&&isParent&&<>
          <Title accent={ac}>Child Login</Title>
          <Sub>Create a username & password so {athlete.name} can log in independently</Sub>
          <Card style={{marginBottom:16}}>
            <div style={{fontFamily:FC,fontSize:18,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{athlete.name}</div>
            <div style={{fontFamily:F,fontSize:11,color:T.faint,marginBottom:16}}>{athlete.team} · Level {athlete.level}</div>

            {athlete.childUsername
              ?<>
                <div style={{background:"#d4edda",border:"1px solid #c3e6cb",borderRadius:3,padding:"12px 14px",marginBottom:14}}>
                  <div style={{fontFamily:F,fontSize:10,color:"#2d8a4e",letterSpacing:2,fontWeight:700,marginBottom:6,textTransform:"uppercase"}}>✓ Login Active</div>
                  <div style={{fontFamily:F,fontSize:13,color:T.dark}}>Username: <strong>{athlete.childUsername}</strong></div>
                  <div style={{fontFamily:F,fontSize:13,color:T.dark}}>Password: <strong>{athlete.childPassword}</strong></div>
                </div>
                <div style={{fontFamily:F,fontSize:12,color:T.muted,marginBottom:12,lineHeight:1.5}}>{athlete.name} can now log in on their own device with this username and password to see their own passport.</div>
                <button onClick={removeChildLogin} style={{background:"#111111",border:"none",color:"#ffffff",padding:"9px 16px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>Remove Login</button>
              </>
              :(!showChildLogin
                ?<button onClick={()=>setShowChildLogin(true)} style={{width:"100%",background:"#111111",border:"none",color:"#ffffff",padding:13,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>+ Create Login for {athlete.name}</button>
                :<>
                  <div style={{marginBottom:10}}><Lbl>Username</Lbl><input value={childForm.username} onChange={e=>setChildForm(p=>({...p,username:e.target.value}))} placeholder={`e.g. ${athlete.name.split(" ")[0].toLowerCase()}`} style={inp()}/></div>
                  <div style={{marginBottom:14}}><Lbl>Password</Lbl><input value={childForm.password} onChange={e=>setChildForm(p=>({...p,password:e.target.value}))} placeholder="min 6 characters" style={inp()}/></div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>{setShowChildLogin(false);setChildForm({username:"",password:""});}} style={{flex:1,background:"#111111",border:"none",color:"#ffffff",padding:10,cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,borderRadius:3,textTransform:"uppercase"}}>Cancel</button>
                    <button onClick={createChildLogin} style={{flex:2,background:"#111111",border:"none",color:"#ffffff",padding:10,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:800,borderRadius:3,textTransform:"uppercase"}}>Create Login</button>
                  </div>
                </>
              )
            }
          </Card>

          {linkedAthletes.length>1&&<>
            <Lbl>Your Other Linked Athletes</Lbl>
            {linkedAthletes.filter(a=>a.id!==athlete.id).map(a=>(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:F,fontSize:13,fontWeight:600}}>{a.name}</div>
                  <div style={{fontFamily:F,fontSize:10,color:T.faint}}>{a.childUsername?`Login: ${a.childUsername}`:"No login created yet"}</div>
                </div>
                <button onClick={()=>{setSelectedAthleteId(a.id);}} style={{background:"#111111",border:"none",color:"#ffffff",padding:"5px 12px",cursor:"pointer",fontFamily:F,fontSize:9,letterSpacing:2,borderRadius:3,textTransform:"uppercase"}}>Manage</button>
              </div>
            ))}
          </>}
        </>}

        {tab==="passport"&&<>
          <div style={{border:`2px solid ${ac}`,borderRadius:6,overflow:"hidden",marginBottom:20,boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
            <div style={{background:ac,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
              <CPLogo size={36}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:FC,fontSize:20,fontWeight:800,color:"#ffffff",letterSpacing:2,textTransform:"uppercase",lineHeight:1}}>Cheer Passport</div>
                <div style={{fontFamily:F,fontSize:10,color:"rgba(255,255,255,0.75)",marginTop:3}}>{user.gym} · {athlete.team}</div>
              </div>
              <span style={{border:"1px solid rgba(255,255,255,0.6)",background:"rgba(255,255,255,0.15)",padding:"3px 12px",fontSize:10,fontFamily:F,fontWeight:700,letterSpacing:2,color:"#ffffff",textTransform:"uppercase",whiteSpace:"nowrap",borderRadius:2}}>Level {athlete.level}</span>
            </div>
            <div style={{padding:18}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:16}}>
                {[{l:"Skills",v:`${unlocked}/${allSkills.length}`},{l:"Attendance",v:`${athlete.attendance}%`},{l:"Points",v:points.toLocaleString()}].map(s=>(
                  <div key={s.l} style={{textAlign:"center",padding:"12px 8px",background:T.s1,borderRadius:4}}>
                    <div style={{fontFamily:FC,fontSize:22,fontWeight:800,color:T.black}}>{s.v}</div>
                    <div style={{fontFamily:F,fontSize:9,color:T.muted,letterSpacing:2,marginTop:2,textTransform:"uppercase"}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontFamily:F,fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1}}>Progress to Level {Math.min(7,athlete.level+1)}</span>
                <span style={{fontFamily:F,fontSize:10,color:T.dark,fontWeight:600}}>{points} / {(athlete.level+1)*400}</span>
              </div>
              <Bar value={points} max={(athlete.level+1)*400} color={ac}/>
              <div style={{marginTop:12,display:"inline-flex",alignItems:"center",gap:6,background:T.s1,borderRadius:3,padding:"4px 10px"}}>
                <span style={{fontFamily:F,fontSize:9,color:T.faint,letterSpacing:2,textTransform:"uppercase"}}>Since {athlete.joinDate}</span>
              </div>
            </div>
          </div>

          {athlete.perfectMonths?.length>0&&<>
            <Lbl>Perfect Attendance</Lbl>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
              {athlete.perfectMonths.map(m=>(
                <button key={m} onClick={()=>setStamp({title:"Perfect Attendance",subtitle:m,detail:"Scanned in to every scheduled practice"})} style={{background:"#111111",border:"none",color:"#ffffff",padding:"7px 14px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>✦ {m}</button>
              ))}
            </div>
          </>}

          {athlete.levelHistory?.length>0&&<>
            <Lbl>Level Achievements — Tap to Save & Share</Lbl>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
              {athlete.levelHistory.map((h,i)=>(
                <button key={i} onClick={()=>setStamp({title:`Level ${h.level} Certified`,subtitle:h.cat,detail:`Achieved Level ${h.level} in ${h.cat} on ${h.date}`})} style={{background:"#111111",border:"none",color:"#ffffff",borderRadius:5,padding:"14px 10px",cursor:"pointer",fontFamily:F,textAlign:"center",transition:"transform .12s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                  <div style={{fontSize:22,color:"#f0c040",marginBottom:6}}>✦</div>
                  <div style={{fontFamily:FC,fontSize:16,fontWeight:800,color:"#ffffff",textTransform:"uppercase",letterSpacing:1}}>Level {h.level}</div>
                  <div style={{fontFamily:F,fontSize:10,color:"rgba(255,255,255,0.7)",marginTop:2}}>{h.cat}</div>
                  <div style={{fontFamily:F,fontSize:9,color:"#ffffff",fontWeight:700,letterSpacing:1,marginTop:6,textTransform:"uppercase"}}>↓ Save Badge</div>
                </button>
              ))}
            </div>
          </>}

          {Object.entries(BASE_SKILLS).map(([k,cat])=>{
            const all=Object.values(cat.levels).flat(),ul=all.filter(s=>athlete.unlockedSkills.includes(s.id));
            return(
              <div key={k} style={{borderTop:`1px solid ${T.border}`,padding:"14px 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontFamily:F,fontSize:11,fontWeight:700,letterSpacing:2,color:T.muted,textTransform:"uppercase"}}>{cat.icon} {cat.label}</span>
                  <span style={{fontFamily:FC,fontSize:18,fontWeight:800,color:T.black}}>{ul.length}<span style={{color:T.light,fontWeight:400,fontSize:13}}>/{all.length}</span></span>
                </div>
                <Bar value={ul.length} max={all.length} color={ac}/>
              </div>
            );
          })}

          {!isParent&&<Card style={{marginTop:8}}>
            <Lbl>Passport Transfer</Lbl>
            <div style={{fontFamily:F,fontSize:13,color:T.dark,marginBottom:14,lineHeight:1.6,fontWeight:300}}>Moving gyms? Your skills, points and history travel with you.</div>
            <button style={{background:"#111111",border:"none",color:"#ffffff",padding:"9px 18px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:3,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>Request Transfer Code</button>
          </Card>}

          {gymCfg.contactEmail&&<Card style={{marginTop:8}}>
            <Lbl>Contact Your Gym</Lbl>
            <div style={{fontFamily:F,fontSize:13,color:T.dark,lineHeight:1.6}}>{gymCfg.name||user.gym}<br/><a href={`mailto:${gymCfg.contactEmail}`} style={{color:ac,fontWeight:700,textDecoration:"none"}}>{gymCfg.contactEmail}</a></div>
          </Card>}
        </>}

        {tab==="skills"&&<>
          <Title accent={ac}>Skill Book</Title>
          <Sub>IASF-Aligned · Awarded by your coach</Sub>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
            {Object.entries(BASE_SKILLS).map(([k,c])=>(
              <button key={k} onClick={()=>setActiveCat(k)} style={{background:"#111111",border:activeCat===k?"2px solid #ffffff":"2px solid transparent",color:"#ffffff",opacity:activeCat===k?1:0.5,padding:"7px 13px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase",transition:"all .15s"}}>
                {c.icon} {c.label.split("&")[0].trim()}
              </button>
            ))}
          </div>
          {Object.entries(BASE_SKILLS[activeCat].levels).map(([lvl,skills])=>{
            const lv=parseInt(lvl),ulInLv=skills.filter(s=>athlete.unlockedSkills.includes(s.id)).length;
            return(
              <div key={lvl} style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,paddingBottom:8,borderBottom:`2px solid ${T.border}`}}>
                  <span style={{fontFamily:FC,fontSize:17,fontWeight:800,textTransform:"uppercase",letterSpacing:1}}>Level {lv}</span>
                  <span style={{fontFamily:F,fontSize:10,color:T.faint}}>{ulInLv}/{skills.length} earned · {LEVEL_PTS[lv]} pts each</span>
                </div>
                {skills.map(sk=>{
                  const ul=athlete.unlockedSkills.includes(sk.id);
                  return(
                    <div key={sk.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${T.border}`}}>
                      <div style={{fontSize:14,color:ul?gymCfg.secondary:T.light,width:18}}>{ul?"✦":"○"}</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:F,fontSize:13,fontWeight:ul?700:400,color:ul?T.black:T.faint}}>{sk.name}</div>
                        <div style={{fontFamily:F,fontSize:10,color:T.faint,marginTop:1}}>{sk.desc}</div>
                      </div>
                      <div style={{fontFamily:F,fontSize:10,color:ul?ac:T.faint,fontWeight:700}}>{ul?`+${LEVEL_PTS[lv]}`:`${LEVEL_PTS[lv]} pts`}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>}

        {tab==="spirit"&&!isParent&&<>
          <Title accent={ac}>Spirit Points</Title>
          <Sub>Awarded by coaches for character & soft skills</Sub>
          {athlete.spiritLog?.length===0&&<div style={{fontFamily:F,fontSize:14,color:T.faint,padding:"40px 0",textAlign:"center",fontWeight:300}}>No spirit points yet — keep working hard.</div>}
          {athlete.spiritLog?.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:T.s1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:gymCfg.secondary}}>{s.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:F,fontSize:14,fontWeight:600}}>{s.name}</div>
                <div style={{fontFamily:F,fontSize:10,color:T.faint,marginTop:2}}>By {s.by} · {s.date}</div>
              </div>
              <div style={{fontFamily:FC,fontSize:20,fontWeight:800,color:ac}}>+{s.pts}</div>
            </div>
          ))}
          <div style={{marginTop:24,borderTop:`2px solid ${T.border}`,paddingTop:20}}>
            <Lbl>All Available Spirit Awards</Lbl>
            {SPIRIT_SOFT.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{width:28,textAlign:"center",color:gymCfg.secondary,fontSize:15}}>{s.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:F,fontSize:13,fontWeight:600}}>{s.name}</div>
                  <div style={{fontFamily:F,fontSize:10,color:T.faint}}>{s.desc}</div>
                </div>
                <span style={{fontFamily:F,fontSize:10,color:ac,fontWeight:700}}>+{s.pts}</span>
              </div>
            ))}
          </div>
        </>}

        {tab==="report"&&<>
          <Title accent={ac}>Report Cards</Title>
          <Sub>Issued in December and end of season</Sub>
          {athlete.reportCards?.length===0&&<div style={{fontFamily:F,fontSize:14,color:T.faint,padding:"40px 0",textAlign:"center"}}>No report cards issued yet.</div>}
          {athlete.reportCards?.map((rc,i)=>{
            const avg=(Object.values(rc.ratings).reduce((a,b)=>a+b,0)/REPORT_CATS.length).toFixed(1);
            return(
              <div key={i} style={{border:`2px solid ${T.black}`,borderRadius:4,padding:18,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div>
                    <div style={{fontFamily:FC,fontSize:18,fontWeight:800,textTransform:"uppercase",letterSpacing:1,color:T.black}}>{rc.period}</div>
                    <div style={{fontFamily:F,fontSize:10,color:T.dark,marginTop:2,fontWeight:600}}>By {rc.publishedBy}</div>
                  </div>
                  <div style={{textAlign:"right",background:"#111111",borderRadius:4,padding:"6px 12px"}}>
                    <div style={{fontFamily:FC,fontSize:24,fontWeight:800,color:"#ffffff",lineHeight:1}}>{avg}</div>
                    <div style={{fontFamily:F,fontSize:8,color:"rgba(255,255,255,0.8)",letterSpacing:2,textTransform:"uppercase"}}>Avg / 5</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                  {REPORT_CATS.slice(0,4).map(cat=>(
                    <div key={cat} style={{borderTop:`1px solid ${T.border}`,paddingTop:8}}>
                      <div style={{fontFamily:F,fontSize:9,color:T.dark,letterSpacing:1,marginBottom:4,textTransform:"uppercase",fontWeight:600}}>{cat}</div>
                      <div style={{color:"#d4a017",fontSize:13,letterSpacing:2}}>{"★".repeat(rc.ratings[cat]||0)}{"☆".repeat(5-(rc.ratings[cat]||0))}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setReport(rc)} style={{width:"100%",background:"#111111",border:"none",color:"#ffffff",padding:"11px",cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>View Full Report</button>
              </div>
            );
          })}
        </>}

        {tab==="shop"&&<ShopView gymName={user.gym} points={points} onBuy={(cost)=>setPoints(p=>p-cost)} accentColor={ac} shopItems={shopItems} setShopItems={setShopItems} athleteName={athlete.name} athleteTeam={athlete.team} orders={orders} setOrders={setOrders}/>}

        {tab==="ranks"&&!isParent&&<>
          <Title accent={ac}>Rankings</Title>
          <Sub>Gym Leaderboard</Sub>
          {[...athletes].sort((a,b)=>b.points-a.points).map((a,i)=>{
            const isMe=a.id===athlete.id;
            return(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 10px",borderBottom:`1px solid ${T.border}`,background:isMe?`${ac}10`:"transparent",borderRadius:isMe?3:0,marginBottom:isMe?2:0}}>
                <div style={{width:24,fontFamily:FC,fontSize:18,fontWeight:800,color:i<3?gymCfg.secondary:T.faint,textAlign:"center"}}>{i+1}</div>
                <div style={{width:36,height:36,border:`1px solid ${isMe?ac:T.border}`,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontSize:16,fontWeight:800,color:isMe?ac:T.muted,background:isMe?`${ac}10`:T.s1}}>{a.name[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:F,fontSize:14,fontWeight:isMe?700:500}}>{a.name}{isMe&&<span style={{fontFamily:F,fontSize:9,color:T.muted,letterSpacing:2,marginLeft:8,textTransform:"uppercase"}}>You</span>}</div>
                  <div style={{fontFamily:F,fontSize:10,color:T.faint}}>{a.team}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <LPill level={a.level} color={ac} sm/>
                  <div style={{fontFamily:FC,fontSize:20,fontWeight:800,marginTop:3}}>{a.points.toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </>}
      </div>
    </div>
  );
}

// ── SHOP VIEW ─────────────────────────────────────────────────────────────────
function ShopView({gymName,points,onBuy,accentColor,editable=false,shopItems,setShopItems,athleteName,athleteTeam,orders,setOrders}){
  const ac=accentColor||T.black;
  const [owned,setOwned]=useState([]);
  const [toast,setToast]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [newItem,setNewItem]=useState({name:"",cost:"",icon:"✦",stock:"",desc:"",imageUrl:""});
  const [shopCsvError,setShopCsvError]=useState("");
  const [shopCsvPreview,setShopCsvPreview]=useState(null);
  const notify=(msg,dark=false)=>{setToast({msg,dark});setTimeout(()=>setToast(null),2200);};

  const items=shopItems||[
    {id:"sh1",name:"Passport Sticker Pack",cost:50,icon:"✦",stock:99,desc:"Exclusive stickers for your passport",imageUrl:""},
    {id:"sh2",name:"Gym Water Bottle",cost:150,icon:"◈",stock:12,desc:"Custom branded water bottle",imageUrl:""},
    {id:"sh3",name:"Custom Hair Bow",cost:200,icon:"◇",stock:8,desc:"Team colour hair bow",imageUrl:""},
    {id:"sh4",name:"Cheer Hoodie",cost:500,icon:"△",stock:5,desc:"Gym hoodie with your name",imageUrl:""},
    {id:"sh5",name:"Personalized Bag Tag",cost:75,icon:"○",stock:20,desc:"Custom bag tag",imageUrl:""},
    {id:"sh6",name:"Gold Trophy",cost:1000,icon:"★",stock:3,desc:"Season champion trophy",imageUrl:""},
  ];

  const addItem=()=>{
    if(!newItem.name||!newItem.cost){notify("Name and cost required");return;}
    setShopItems(p=>[...p,{id:`sh${Date.now()}`,name:newItem.name,cost:parseInt(newItem.cost),icon:newItem.icon||"✦",stock:parseInt(newItem.stock)||99,desc:newItem.desc,imageUrl:newItem.imageUrl}]);
    setNewItem({name:"",cost:"",icon:"✦",stock:"",desc:"",imageUrl:""});setShowAdd(false);
    notify("Item added to shop",true);
  };

  const downloadShopTemplate=()=>{
    const csv="Name,PointCost,Stock,Description,PhotoURL,Icon\n\"Gym Hoodie\",500,10,\"Custom hoodie with athlete name\",\"https://example.com/hoodie.jpg\",\"△\"\n\"Hair Bow\",200,25,\"Team colour hair bow\",\"\",\"◇\"\n\"Water Bottle\",150,15,\"Custom branded bottle\",\"\",\"◈\"";
    const blob=new Blob([csv],{type:"text/csv"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="shop_items_template.csv";a.click();
  };

  const handleShopCsv=(e)=>{
    setShopCsvError("");setShopCsvPreview(null);
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=(evt)=>{
      try{
        const lines=evt.target.result.split("\n").map(l=>l.trim()).filter(Boolean);
        if(lines.length<2){setShopCsvError("File needs a header row and at least one item.");return;}
        const headers=lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/[^a-z]/g,""));
        const col=(name)=>headers.findIndex(h=>h.includes(name));
        const nameIdx=col("name"),costIdx=col("cost")>-1?col("cost"):col("point"),stockIdx=col("stock"),descIdx=col("desc"),photoIdx=col("photo")>-1?col("photo"):col("url")>-1?col("url"):col("image"),iconIdx=col("icon");
        if(nameIdx===-1){setShopCsvError("CSV must have a 'Name' column.");return;}
        const rows=lines.slice(1).map(line=>{
          const cols=line.split(",").map(c=>c.trim().replace(/^"|"$/g,""));
          return{name:cols[nameIdx]||"",cost:costIdx>=0?parseInt(cols[costIdx])||0:100,stock:stockIdx>=0?parseInt(cols[stockIdx])||99:99,desc:descIdx>=0?cols[descIdx]||"":"",imageUrl:photoIdx>=0?cols[photoIdx]||"":"",icon:iconIdx>=0?cols[iconIdx]||"✦":"✦"};
        }).filter(r=>r.name);
        setShopCsvPreview(rows);
      }catch(err){setShopCsvError("Could not parse file. Check it's a valid CSV.");}
    };
    reader.readAsText(file);e.target.value="";
  };

  const importShopCsv=()=>{
    if(!shopCsvPreview)return;
    setShopItems(p=>[...p,...shopCsvPreview.map(r=>({id:`sh${Date.now()}${Math.random()}`,name:r.name,cost:r.cost,stock:r.stock,desc:r.desc,imageUrl:r.imageUrl,icon:r.icon}))]);
    setShopCsvPreview(null);
    notify(`${shopCsvPreview.length} items added to shop`,true);
  };

  return(
    <div>
      {toast&&<Toast {...toast}/>}
      {!editable&&(
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18}}>
          <Title accent={ac}>Swag Shop</Title>
          <div style={{fontFamily:FC,fontSize:22,fontWeight:800,color:T.black}}>{points?.toLocaleString()} <span style={{fontSize:11,color:T.faint,fontFamily:F,fontWeight:400}}>PTS</span></div>
        </div>
      )}
      {editable&&<>
        <Title accent={ac}>Pro Shop Manager</Title>
        <Sub>Add items individually or upload a spreadsheet</Sub>

        {/* CSV Import */}
        <Card style={{marginBottom:16,background:T.s1}}>
          <div style={{fontFamily:FC,fontSize:13,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Import from Spreadsheet</div>
          <div style={{fontFamily:F,fontSize:11,color:T.muted,marginBottom:12,lineHeight:1.6}}>Download the template, fill in your items (with optional photo URL and point cost), then upload. Photos hosted on any public URL (Imgur, Google Drive, etc.) will display in the shop.</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
            <button onClick={downloadShopTemplate} style={{background:"#111111",border:"none",color:"#ffffff",padding:"9px 16px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>↓ Download Template</button>
            <label style={{background:"#111111",border:"none",color:"#ffffff",padding:"9px 16px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase",display:"inline-block"}}>
              ↑ Upload CSV
              <input type="file" accept=".csv,text/csv" onChange={handleShopCsv} style={{display:"none"}}/>
            </label>
          </div>
          {shopCsvError&&<div style={{background:"#fff5f5",border:"1px solid #f5c6cb",borderRadius:3,padding:"8px 12px",fontFamily:F,fontSize:11,color:"#c0392b",marginBottom:8}}>{shopCsvError}</div>}
          {shopCsvPreview&&<>
            <div style={{fontFamily:FC,fontSize:13,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{shopCsvPreview.length} Items Ready to Import</div>
            <div style={{border:`1px solid ${T.border}`,borderRadius:3,overflow:"hidden",marginBottom:10}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 2fr",background:"#111111",padding:"7px 12px",gap:8}}>
                {["Item","Cost","Stock","Photo"].map(h=><div key={h} style={{fontFamily:F,fontSize:9,color:"#ffffff",letterSpacing:2,textTransform:"uppercase",fontWeight:700}}>{h}</div>)}
              </div>
              {shopCsvPreview.map((r,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 2fr",padding:"8px 12px",borderTop:`1px solid ${T.border}`,alignItems:"center",gap:8,background:i%2===0?"#ffffff":T.s1}}>
                  <div style={{fontFamily:F,fontSize:12,fontWeight:600}}>{r.name}</div>
                  <div style={{fontFamily:FC,fontSize:14,fontWeight:800}}>{r.cost} pts</div>
                  <div style={{fontFamily:F,fontSize:11,color:T.muted}}>{r.stock}</div>
                  <div style={{fontFamily:F,fontSize:10,color:r.imageUrl?T.dark:T.faint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.imageUrl||"No photo"}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShopCsvPreview(null)} style={{flex:1,background:"#111111",border:"none",color:"#ffffff",padding:9,cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,borderRadius:3,textTransform:"uppercase"}}>Cancel</button>
              <button onClick={importShopCsv} style={{flex:2,background:"#111111",border:"none",color:"#ffffff",padding:9,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:800,borderRadius:3,textTransform:"uppercase"}}>Add {shopCsvPreview.length} Items to Shop</button>
            </div>
          </>}
        </Card>

        {/* Manual add */}
        {!showAdd
          ?<button onClick={()=>setShowAdd(true)} style={{width:"100%",background:"#111111",border:"none",color:"#ffffff",padding:12,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:700,borderRadius:3,marginBottom:14,textTransform:"uppercase"}}>+ Add Item Manually</button>
          :<Card style={{marginBottom:14}}>
            <Lbl>New Shop Item</Lbl>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><Lbl>Item Name</Lbl><input value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))} placeholder="e.g. Team Jacket" style={inp()}/></div>
              <div><Lbl>Point Cost</Lbl><input type="number" value={newItem.cost} onChange={e=>setNewItem(p=>({...p,cost:e.target.value}))} placeholder="e.g. 300" style={inp()}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><Lbl>Icon (emoji/symbol)</Lbl><input value={newItem.icon} onChange={e=>setNewItem(p=>({...p,icon:e.target.value}))} placeholder="✦" style={inp()}/></div>
              <div><Lbl>Stock Quantity</Lbl><input type="number" value={newItem.stock} onChange={e=>setNewItem(p=>({...p,stock:e.target.value}))} placeholder="99" style={inp()}/></div>
            </div>
            <div style={{marginBottom:10}}><Lbl>Photo URL (optional)</Lbl><input value={newItem.imageUrl} onChange={e=>setNewItem(p=>({...p,imageUrl:e.target.value}))} placeholder="https://example.com/photo.jpg" style={inp()}/></div>
            <div style={{marginBottom:14}}><Lbl>Description</Lbl><input value={newItem.desc} onChange={e=>setNewItem(p=>({...p,desc:e.target.value}))} placeholder="Brief item description" style={inp()}/></div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowAdd(false)} style={{flex:1,background:"#111111",border:"none",color:"#ffffff",padding:10,cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,borderRadius:3,textTransform:"uppercase"}}>Cancel</button>
              <button onClick={addItem} style={{flex:2,background:"#111111",border:"none",color:"#ffffff",padding:10,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:800,borderRadius:3,textTransform:"uppercase"}}>Add to Shop</button>
            </div>
          </Card>
        }
      </>}

      {/* Shop item grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {items.map(item=>{
          const io=owned.includes(item.id),cb=(points===undefined||points>=item.cost)&&item.stock>0;
          return(
            <div key={item.id} style={{border:`1px solid ${io?ac:T.border}`,borderRadius:4,overflow:"hidden",display:"flex",flexDirection:"column",position:"relative"}}>
              {editable&&setShopItems&&<button onClick={()=>setShopItems(p=>p.filter(i=>i.id!==item.id))} style={{position:"absolute",top:8,right:8,background:"#111111",border:"none",color:"#ffffff",cursor:"pointer",fontSize:12,width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>✕</button>}
              {/* Photo or icon */}
              {item.imageUrl
                ?<div style={{width:"100%",height:110,background:T.s2,overflow:"hidden"}}>
                  <img src={item.imageUrl} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";e.target.parentNode.style.background=T.s2;}}/>
                </div>
                :<div style={{width:"100%",height:80,background:T.s1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,color:ac}}>{item.icon}</div>
              }
              <div style={{padding:"10px 12px",flex:1,display:"flex",flexDirection:"column",gap:4}}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:T.black}}>{item.name}</div>
                {item.desc&&<div style={{fontFamily:F,fontSize:10,color:T.faint}}>{item.desc}</div>}
                <div style={{fontFamily:F,fontSize:9,color:T.faint,letterSpacing:1,textTransform:"uppercase",marginTop:2}}>{item.stock} in stock</div>
                {!editable&&(io
                  ?<div style={{fontFamily:F,fontSize:10,color:ac,letterSpacing:2,fontWeight:700,textTransform:"uppercase",marginTop:4}}>✦ Acquired</div>
                  :<button onClick={()=>{
                      if(!cb){notify("Not enough points");return;}
                      if(item.stock<=0){notify("Out of stock");return;}
                      setOwned(p=>[...p,item.id]);
                      onBuy&&onBuy(item.cost);
                      if(setShopItems)setShopItems(p=>p.map(i=>i.id===item.id?{...i,stock:Math.max(0,i.stock-1)}:i));
                      if(setOrders)setOrders(p=>[{id:`ord${Date.now()}`,itemName:item.name,itemId:item.id,cost:item.cost,athleteName:athleteName||"Unknown",athleteTeam:athleteTeam||"",imageUrl:item.imageUrl,icon:item.icon,status:"pending",orderedDate:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})},...p]);
                      notify(`${item.name} acquired`,true);
                    }} style={{background:"#111111",border:"none",color:cb?"#ffffff":"rgba(255,255,255,0.4)",padding:"9px",cursor:cb?"pointer":"not-allowed",fontFamily:F,fontSize:11,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase",marginTop:4}}>{item.stock<=0?"Out of Stock":`${item.cost} pts`}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── COACH / OWNER VIEW ────────────────────────────────────────────────────────
function CoachView({user,athletes,setAthletes,shopItems,setShopItems,orders,setOrders,onLogout}){
  const isOwner=user.role==="owner";
  const gymCfg=GYM_CONFIGS[user.gym]||{primary:"#111111",secondary:"#888888"};
  const ac=gymCfg.primary;

  // Coaches only see athletes on their assigned team(s). Owners see everyone.
  const visibleAthletes=isOwner?athletes:athletes.filter(a=>(user.assignedTeams||[]).includes(a.team));

  const [tab,setTab]=useState("roster");
  const [customSkills,setCustomSkills]=useState({});
  const [sel,setSel]=useState(null);
  const [activeCat,setActiveCat]=useState("stunts");
  const [toast,setToast]=useState(null);
  const [stamp,setStamp]=useState(null);
  const [actLog,setActLog]=useState([
    {athlete:"Zoe K.",type:"Practice Scan",pts:15,time:"Today 4:02 PM"},
    {athlete:"Madison T.",type:"Spirit: Positive Attitude",pts:20,time:"Today 3:50 PM"},
    {athlete:"Zoe K.",type:"Skill: Scorpion",pts:55,time:"Yesterday"},
  ]);
  const [rcForm,setRcForm]=useState({period:"",comments:"",goals:"",ratings:Object.fromEntries(REPORT_CATS.map(c=>[c,3]))});
  const [showRc,setShowRc]=useState(false);
  const [ptAdj,setPtAdj]=useState({amount:"",reason:""});
  const [gymSettings,setGymSettings]=useState({primary:gymCfg.primary,secondary:gymCfg.secondary,name:gymCfg.name||user.gym,contactEmail:gymCfg.contactEmail||user.email||""});

  const todayISO=new Date().toISOString().slice(0,10);
  const [attDate,setAttDate]=useState(todayISO);
  const [attType,setAttType]=useState("practice");
  const [presentIds,setPresentIds]=useState(visibleAthletes.map(a=>a.id));
  const [attSubmitted,setAttSubmitted]=useState(false);

  // ── TEAMS STATE ──
  const [teams,setTeams]=useState([
    {id:"t1",name:"Senior Elite",level:"4-5",ageGroup:"Senior (14+)",schedule:"Mon/Wed/Fri 4–6pm",coachName:"Coach Amy",color:"#1a1a1a"},
    {id:"t2",name:"Junior Varsity",level:"1-3",ageGroup:"Junior (11–13)",schedule:"Tue/Thu 4–6pm",coachName:"Coach Amy",color:"#444444"},
  ]);
  const [showTeamForm,setShowTeamForm]=useState(false);
  const [editTeamId,setEditTeamId]=useState(null);
  const [teamForm,setTeamForm]=useState({name:"",level:"",ageGroup:"",schedule:"",coachName:"",color:"#111111"});
  const [csvPreview,setCsvPreview]=useState(null); // parsed rows before import
  const [csvError,setCsvError]=useState("");
  const [importResult,setImportResult]=useState(null);
  const [assignForm,setAssignForm]=useState({athleteId:"",teamId:""});

  const saveTeam=()=>{
    if(!teamForm.name.trim()){notify("Team name required");return;}
    if(editTeamId){
      setTeams(p=>p.map(t=>t.id===editTeamId?{...t,...teamForm}:t));
      notify(`${teamForm.name} updated`,true);
    } else {
      setTeams(p=>[...p,{id:`t${Date.now()}`,...teamForm}]);
      notify(`${teamForm.name} created!`,true);
    }
    setTeamForm({name:"",level:"",ageGroup:"",schedule:"",coachName:"",color:"#111111"});
    setShowTeamForm(false);setEditTeamId(null);
  };
  const deleteTeam=(id)=>{setTeams(p=>p.filter(t=>t.id!==id));notify("Team removed");};
  const startEditTeam=(team)=>{setEditTeamId(team.id);setTeamForm({name:team.name,level:team.level,ageGroup:team.ageGroup,schedule:team.schedule,coachName:team.coachName,color:team.color});setShowTeamForm(true);};

  const assignAthlete=()=>{
    if(!assignForm.athleteId||!assignForm.teamId){notify("Select athlete and team");return;}
    const team=teams.find(t=>t.id===assignForm.teamId);
    setAthletes(p=>p.map(a=>a.id===parseInt(assignForm.athleteId)?{...a,team:team.name}:a));
    notify(`Athlete assigned to ${team.name}`,true);
    setAssignForm({athleteId:"",teamId:""});
  };

  const handleCsvUpload=(e)=>{
    setCsvError("");setCsvPreview(null);setImportResult(null);
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=(evt)=>{
      try{
        const lines=evt.target.result.split("\n").map(l=>l.trim()).filter(Boolean);
        if(lines.length<2){setCsvError("File must have a header row and at least one athlete.");return;}
        const headers=lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/[^a-z]/g,""));
        const nameIdx=headers.findIndex(h=>h.includes("name"));
        const emailIdx=headers.findIndex(h=>h.includes("email"));
        const teamIdx=headers.findIndex(h=>h.includes("team"));
        if(nameIdx===-1){setCsvError("CSV must have a 'Name' column.");return;}
        const rows=lines.slice(1).map((line,i)=>{
          const cols=line.split(",").map(c=>c.trim().replace(/^"|"$/g,""));
          return{
            name:cols[nameIdx]||"",
            email:emailIdx>=0?(cols[emailIdx]||""):"",
            team:teamIdx>=0?(cols[teamIdx]||""):"",
            row:i+2,
          };
        }).filter(r=>r.name);
        setCsvPreview(rows);
      }catch(err){setCsvError("Could not parse file. Please check it's a valid CSV.");}
    };
    reader.readAsText(file);
    e.target.value="";
  };

  const importCsvRoster=()=>{
    if(!csvPreview)return;
    let added=0,skipped=0;
    const newAthletes=[...athletes];
    csvPreview.forEach(row=>{
      const exists=newAthletes.find(a=>a.name.toLowerCase()===row.name.toLowerCase());
      if(exists){skipped++;return;}
      const id=Date.now()+added;
      newAthletes.push({
        id,name:row.name,dob:"2010-01-01",gym:user.gym,
        team:row.team||(teams[0]?.name||""),
        level:1,points:0,attendance:0,joinDate:new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"}),
        unlockedSkills:[],spiritLog:[],attendanceLog:[],perfectMonths:[],levelHistory:[],reportCards:[],
        email:row.email,
      });
      added++;
    });
    setAthletes(newAthletes);
    setImportResult({added,skipped,total:csvPreview.length});
    setCsvPreview(null);
    notify(`Imported ${added} athletes`,true);
  };

  const notify=(msg,dark=false)=>{setToast({msg,dark});setTimeout(()=>setToast(null),2200);};
  const selA=sel?visibleAthletes.find(a=>a.id===sel.id):null;

  const awardPerfect=()=>{
    if(!selA){notify("Select an athlete first");return;}
    const month=new Date().toLocaleString("en-US",{month:"long",year:"numeric"});
    if((selA.perfectMonths||[]).includes(month)){notify("Already awarded this month");return;}
    setAthletes(p=>p.map(a=>a.id===selA.id?{...a,perfectMonths:[...(a.perfectMonths||[]),month]}:a));
    notify("Perfect Attendance awarded",true);
  };

  const toggleAttId=(id)=>setPresentIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const checkAllPresent=()=>setPresentIds(visibleAthletes.map(a=>a.id));
  const checkNonePresent=()=>setPresentIds([]);

  const submitAttendance=()=>{
    const pts=attType==="practice"?15:10;
    const label=attType==="practice"?"Practice":"Open Gym";
    const dateLabel=new Date(attDate+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
    const presentSet=new Set(presentIds);
    setAthletes(p=>p.map(a=>!presentSet.has(a.id)?a:{...a,points:a.points+pts,attendanceLog:[{type:label,date:dateLabel,pts},...(a.attendanceLog||[])]}));
    const presentNames=visibleAthletes.filter(a=>presentSet.has(a.id)).map(a=>a.name);
    const absentNames=visibleAthletes.filter(a=>!presentSet.has(a.id)).map(a=>a.name);
    setActLog(p=>[...presentNames.map(name=>({athlete:name,type:`${label} Scan — ${dateLabel}`,pts,time:"Just now"})),...p]);
    setAttSubmitted(true);
    notify(`Attendance submitted — ${presentNames.length} present, ${absentNames.length} absent`,true);
    setTimeout(()=>setAttSubmitted(false),3000);
  };

  const awardSpirit=(sp)=>{
    if(!selA){notify("Select an athlete first");return;}
    setAthletes(p=>p.map(a=>a.id===selA.id?{...a,points:a.points+sp.pts,spiritLog:[{icon:sp.icon,name:sp.name,pts:sp.pts,by:user.name,date:"Today"},...(a.spiritLog||[])]}:a));
    setActLog(p=>[{athlete:selA.name,type:`Spirit: ${sp.name}`,pts:sp.pts,time:"Just now"},...p]);
    notify(`${sp.name} awarded`,true);
  };

  const awardSkill=(sk,lv)=>{
    if(!selA){notify("Select an athlete first");return;}
    if((selA.unlockedSkills||[]).includes(sk.id)){notify("Already unlocked");return;}
    const pts=LEVEL_PTS[lv];
    const catSkills=BASE_SKILLS[activeCat]?.levels[lv]||[];
    const custSkillsAtLv=(customSkills[activeCat]||{})[lv]||[];
    const allSkillIdsAtLv=[...catSkills,...custSkillsAtLv].map(s=>s.id);
    const newUnlocked=[...(selA.unlockedSkills||[]),sk.id];
    const levelComplete=allSkillIdsAtLv.length>0&&allSkillIdsAtLv.every(id=>newUnlocked.includes(id));
    const catLabel=BASE_SKILLS[activeCat]?.label.split("&")[0].trim()||activeCat;
    const dateLabel=new Date().toLocaleString("en-US",{month:"short",year:"numeric"});
    setAthletes(p=>p.map(a=>{
      if(a.id!==selA.id)return a;
      const updated={...a,points:a.points+pts,unlockedSkills:newUnlocked};
      if(levelComplete&&!(a.levelHistory||[]).some(h=>h.cat===catLabel&&h.level===lv))
        updated.levelHistory=[...(a.levelHistory||[]),{cat:catLabel,level:lv,date:dateLabel}];
      return updated;
    }));
    setActLog(p=>[{athlete:selA.name,type:`Skill: ${sk.name}`,pts,time:"Just now"},...p]);
    if(levelComplete){
      notify(`🎉 ${selA.name} completed Level ${lv} ${catLabel}!`,true);
      setStamp({title:`Level ${lv} Certified`,subtitle:catLabel,detail:`Achieved Level ${lv} in ${catLabel} on ${dateLabel}`});
    } else {
      notify(`${sk.name} awarded`,true);
    }
  };

  const removeSkill=(sk)=>{
    if(!selA||!isOwner)return;
    setAthletes(p=>p.map(a=>a.id===selA.id?{...a,unlockedSkills:(a.unlockedSkills||[]).filter(s=>s!==sk.id)}:a));
    notify("Skill removed");
  };

  const adjustPts=(dir)=>{
    if(!selA||!isOwner)return;
    const amt=parseInt(ptAdj.amount);
    if(!amt||amt<1){notify("Enter a valid amount");return;}
    const delta=dir==="add"?amt:-amt;
    setAthletes(p=>p.map(a=>a.id===selA.id?{...a,points:Math.max(0,a.points+delta)}:a));
    setActLog(p=>[{athlete:selA.name,type:`Points ${dir==="add"?"Added":"Removed"}: ${ptAdj.reason||"Manual"}`,pts:delta,time:"Just now"},...p]);
    setPtAdj({amount:"",reason:""});
    notify(`${dir==="add"?"+":"-"}${amt} pts — ${selA.name}`,true);
  };

  const issueRc=()=>{
    if(!selA){notify("Select an athlete first");return;}
    if(!rcForm.period){notify("Select a period");return;}
    setAthletes(p=>p.map(a=>a.id===selA.id?{...a,reportCards:[...(a.reportCards||[]),{...rcForm,publishedBy:user.name}]}:a));
    setRcForm({period:"",comments:"",goals:"",ratings:Object.fromEntries(REPORT_CATS.map(c=>[c,3]))});
    setShowRc(false);
    notify(`Report card issued — ${selA.name}`,true);
  };

  const coachTabs=[{id:"roster",l:"Roster"},{id:"attendance",l:"Attendance"},{id:"skills",l:"Award Skills"},{id:"spirit",l:"Spirit"},{id:"report",l:"Reports"},{id:"activity",l:"Activity"}];
  const ownerTabs=[...coachTabs,{id:"teams",l:"Teams & Roster"},{id:"points",l:"Adjust Points"},{id:"shop",l:"Pro Shop"},{id:"fulfillment",l:"Fulfillment"},{id:"access",l:"Access & Codes"},{id:"settings",l:"Gym Settings"}];
  const allTabs=isOwner?ownerTabs:coachTabs;

  // Athlete selector button
  const ABt=({a})=><button onClick={()=>setSel(a)} style={{background:"#111111",border:selA?.id===a.id?"2px solid #ffffff":"2px solid transparent",color:"#ffffff",opacity:selA?.id===a.id?1:0.5,padding:"6px 12px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,transition:"all .15s",textTransform:"uppercase"}}>{a.name}</button>;

  const inpS={background:T.s1,border:`1px solid ${T.border2}`,color:T.black,padding:"10px 12px",fontFamily:F,fontSize:13,width:"100%",outline:"none",borderRadius:3};

  return(
    <div style={{minHeight:"100vh",background:"#ffffff",color:T.black,fontFamily:F}}>
      <style>{GS}</style>
      {toast&&<Toast {...toast}/>}
      {stamp&&<StampModal {...stamp} accentColor={ac} athleteName={selA?.name} gymName={gymCfg.name||user.gym} onClose={()=>setStamp(null)}/>}
      <GymBand gymName={user.gym} onLogout={onLogout} userRole={isOwner?"Gym Owner":"Coach"}/>
      <div style={{position:"sticky",top:0,zIndex:100,background:"#ffffff",boxShadow:"0 1px 0 rgba(0,0,0,0.06)"}}>
        <NavTabs tabs={allTabs} active={tab} onSelect={setTab}/>
      </div>
      <div style={{padding:"24px 18px",maxWidth:680,margin:"0 auto"}}>

        {tab==="roster"&&<>
          <Title accent={ac}>Roster</Title>
          <Sub>{visibleAthletes.length} Athletes {isOwner?"Registered":`— ${(user.assignedTeams||[]).join(", ")||"No team assigned"}`}</Sub>
          {!isOwner&&visibleAthletes.length===0&&(
            <div style={{fontFamily:F,fontSize:13,color:T.faint,padding:"30px 0",textAlign:"center",fontStyle:"italic"}}>You haven't been assigned to a team yet. Ask your gym owner to assign you in Teams & Roster.</div>
          )}
          {visibleAthletes.map(a=>{
            const ul=Object.values(BASE_SKILLS).flatMap(c=>Object.values(c.levels).flat()).filter(s=>(a.unlockedSkills||[]).includes(s.id)).length;
            const minor=(new Date()-new Date(a.dob))/(1000*60*60*24*365.25)<18;
            return(
              <Card key={a.id} style={{marginBottom:10}}>
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14}}>
                  <div style={{width:40,height:40,borderRadius:4,background:ac,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontSize:18,fontWeight:800,color:"#ffffff"}}>{a.name[0]}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:F,fontSize:15,fontWeight:700}}>{a.name}</div>
                    <div style={{fontFamily:F,fontSize:10,color:T.faint,marginTop:2}}>{a.team}{minor?" · Minor — parent linked":""}</div>
                  </div>
                  <LPill level={a.level} color={ac}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
                  {[{l:"Points",v:a.points.toLocaleString()},{l:"Skills",v:`${ul}`},{l:"Attendance",v:`${a.attendance}%`}].map(s=>(
                    <div key={s.l} style={{background:T.s1,borderRadius:3,padding:"8px 10px"}}>
                      <div style={{fontFamily:FC,fontSize:20,fontWeight:800}}>{s.v}</div>
                      <div style={{fontFamily:F,fontSize:8,color:T.faint,letterSpacing:2,textTransform:"uppercase"}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </>}

        {tab==="attendance"&&<>
          <Title accent={ac}>Attendance</Title>
          <Sub>Pick a date, uncheck anyone absent, then submit</Sub>
          <Card style={{marginBottom:20}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              <div><Lbl>Practice Date</Lbl><input type="date" value={attDate} onChange={e=>setAttDate(e.target.value)} style={{...inpS}}/></div>
              <div>
                <Lbl>Session Type</Lbl>
                <div style={{display:"flex",gap:6}}>
                  {[{id:"practice",l:"Practice",sub:"+15 pts"},{id:"opengym",l:"Open Gym",sub:"+10 pts"}].map(t=>(
                    <button key={t.id} onClick={()=>setAttType(t.id)} style={{flex:1,background:"#111111",border:attType===t.id?"2px solid #ffffff":"2px solid transparent",color:"#ffffff",opacity:attType===t.id?1:0.5,padding:"10px 6px",cursor:"pointer",fontFamily:F,fontSize:11,fontWeight:700,borderRadius:3,textTransform:"uppercase",letterSpacing:1}}>
                      {t.l}<div style={{fontSize:9,fontWeight:400,marginTop:2,opacity:0.85}}>{t.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <Lbl>Roster — tap to mark absent ({presentIds.length}/{visibleAthletes.length} present)</Lbl>
              <div style={{display:"flex",gap:6}}>
                <button onClick={checkAllPresent} style={{background:"#111111",border:"none",color:"#ffffff",padding:"4px 10px",cursor:"pointer",fontFamily:F,fontSize:9,letterSpacing:1,borderRadius:3,textTransform:"uppercase"}}>All Present</button>
                <button onClick={checkNonePresent} style={{background:"#111111",border:"none",color:"#ffffff",padding:"4px 10px",cursor:"pointer",fontFamily:F,fontSize:9,letterSpacing:1,borderRadius:3,textTransform:"uppercase"}}>Clear All</button>
              </div>
            </div>
            <div style={{border:`1px solid ${T.border}`,borderRadius:4,overflow:"hidden",marginBottom:16}}>
              {visibleAthletes.map((a,i)=>{
                const present=presentIds.includes(a.id);
                return(
                  <div key={a.id} onClick={()=>toggleAttId(a.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderBottom:i<visibleAthletes.length-1?`1px solid ${T.border}`:"none",cursor:"pointer",background:present?"#ffffff":"#fff5f5",transition:"background .15s"}}>
                    <div style={{width:24,height:24,borderRadius:4,border:`2px solid ${present?ac:"#c0392b"}`,background:present?ac:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {present&&<span style={{color:"#ffffff",fontSize:13,fontWeight:800,lineHeight:1}}>✓</span>}
                    </div>
                    <div style={{width:34,height:34,borderRadius:3,background:present?T.s1:"#f5d5d5",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontSize:14,fontWeight:800,color:present?T.dark:"#c0392b",flexShrink:0}}>{a.name[0]}</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:F,fontSize:14,fontWeight:600,color:present?T.black:"#c0392b"}}>{a.name}</div>
                      <div style={{fontFamily:F,fontSize:10,color:present?T.faint:"#c0392b",opacity:present?1:0.7}}>{a.team}</div>
                    </div>
                    <span style={{fontFamily:F,fontSize:9,letterSpacing:2,fontWeight:700,color:present?ac:"#c0392b",textTransform:"uppercase"}}>{present?"Present":"Absent"}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={submitAttendance} style={{width:"100%",background:attSubmitted?"#2d8a4e":"#111111",border:"none",color:"#ffffff",padding:"14px",cursor:"pointer",fontFamily:F,fontSize:12,letterSpacing:4,fontWeight:800,borderRadius:3,textTransform:"uppercase",transition:"background .2s"}}>
              {attSubmitted?"✓ Submitted":`Submit Attendance for ${new Date(attDate+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}`}
            </button>
          </Card>
          <Card style={{marginBottom:20}}>
            <Lbl>Perfect Attendance Award</Lbl>
            <div style={{fontFamily:F,fontSize:13,color:T.dark,marginBottom:12,fontWeight:300,lineHeight:1.6}}>Manually award this month's perfect attendance badge to an individual athlete.</div>
            <Lbl>Select Athlete</Lbl>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{visibleAthletes.map(a=><ABt key={a.id} a={a}/>)}</div>
            <button onClick={awardPerfect} style={{background:"#111111",border:"none",color:"#ffffff",padding:"8px 18px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:3,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>Award This Month</button>
          </Card>
          {selA&&<>
            <Lbl>{selA.name} — Attendance Log</Lbl>
            {(selA.attendanceLog||[]).slice(0,6).map((l,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:`1px solid ${T.border}`}}>
                <div>
                  <div style={{fontFamily:F,fontSize:13,fontWeight:600}}>{l.type}</div>
                  <div style={{fontFamily:F,fontSize:10,color:T.faint,marginTop:2}}>{l.date}</div>
                </div>
                <div style={{fontFamily:FC,fontSize:20,fontWeight:800,color:ac}}>+{l.pts}</div>
              </div>
            ))}
          </>}
        </>}

        {tab==="skills"&&<>
          <Title accent={ac}>Award Skills</Title>
          <Sub>{isOwner?"Owners can award & remove skills":"Tap a skill to award it"}</Sub>
          <Lbl>Select Athlete</Lbl>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>{visibleAthletes.map(a=><ABt key={a.id} a={a}/>)}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
            {Object.entries(BASE_SKILLS).map(([k,c])=>(
              <button key={k} onClick={()=>setActiveCat(k)} style={{background:"#111111",border:activeCat===k?"2px solid #ffffff":"2px solid transparent",color:"#ffffff",opacity:activeCat===k?1:0.5,padding:"6px 12px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase",transition:"all .15s"}}>
                {c.icon} {c.label.split("&")[0].trim()}
              </button>
            ))}
          </div>
          {Object.entries(BASE_SKILLS[activeCat].levels).map(([lvl,sks])=>{
            const lv=parseInt(lvl),custSks=(customSkills[activeCat]||{})[lv]||[];
            return(
              <div key={lvl} style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9,paddingBottom:7,borderBottom:`2px solid ${T.border}`}}>
                  <span style={{fontFamily:FC,fontSize:16,fontWeight:800,textTransform:"uppercase",letterSpacing:1}}>Level {lv}</span>
                  <span style={{fontFamily:F,fontSize:10,color:T.faint}}>{LEVEL_PTS[lv]} pts each</span>
                </div>
                {[...sks,...custSks].map(sk=>{
                  const ul=(selA?.unlockedSkills||[]).includes(sk.id);
                  return(
                    <div key={sk.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                      <div style={{fontSize:14,color:ul?gymCfg.secondary:T.light,width:18}}>{ul?"✦":"○"}</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:F,fontSize:13,fontWeight:ul?700:400,color:ul?T.black:T.muted}}>{sk.name}{sk.custom&&<span style={{fontSize:9,color:"#ffffff",marginLeft:8,letterSpacing:2,fontWeight:700,background:"#111111",borderRadius:2,padding:"1px 5px"}}>CUSTOM</span>}</div>
                        <div style={{fontFamily:F,fontSize:10,color:T.faint}}>{sk.desc}</div>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        {!ul&&<button onClick={()=>awardSkill(sk,lv)} style={{background:"#111111",border:"none",color:"#ffffff",padding:"4px 12px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:1,fontWeight:600,borderRadius:3}}>+{LEVEL_PTS[lv]}</button>}
                        {ul&&isOwner&&<button onClick={()=>removeSkill(sk)} style={{background:"#111111",border:"none",color:"#ffffff",padding:"4px 12px",cursor:"pointer",fontFamily:F,fontSize:10,borderRadius:3}}>Remove</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>}

        {tab==="spirit"&&<>
          <Title accent={ac}>Spirit Points</Title>
          <Sub>Award character & soft-skill points</Sub>
          <Lbl>Select Athlete</Lbl>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
            {visibleAthletes.map(a=><button key={a.id} onClick={()=>setSel(a)} style={{background:"#111111",border:selA?.id===a.id?"2px solid #ffffff":"2px solid transparent",color:"#ffffff",opacity:selA?.id===a.id?1:0.5,padding:"6px 12px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>{a.name}</button>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {SPIRIT_SOFT.map(sp=>(
              <button key={sp.id} onClick={()=>awardSpirit(sp)} style={{background:"#111111",border:"2px solid transparent",color:"#ffffff",borderRadius:4,padding:14,cursor:"pointer",textAlign:"left",fontFamily:F,transition:"border-color .15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#ffffff"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="transparent"}>
                <div style={{fontSize:20,color:"#f0c040",marginBottom:6}}>{sp.icon}</div>
                <div style={{fontSize:13,fontWeight:700,color:"#ffffff",marginBottom:3}}>{sp.name}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.6)",marginBottom:7}}>{sp.desc}</div>
                <div style={{fontFamily:F,fontSize:11,color:"#f0c040",fontWeight:700}}>+{sp.pts} pts</div>
              </button>
            ))}
          </div>
        </>}

        {tab==="report"&&<>
          <Title accent={ac}>Report Cards</Title>
          <Sub>Mid-Season December + End of Season</Sub>
          <Lbl>Select Athlete</Lbl>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>{visibleAthletes.map(a=><ABt key={a.id} a={a}/>)}</div>
          {selA&&<>
            {(selA.reportCards||[]).map((rc,i)=>(
              <div key={i} style={{border:`2px solid ${T.black}`,borderRadius:4,padding:16,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:T.black}}>{rc.period}</div>
                  <div style={{fontFamily:F,fontSize:10,color:T.dark,marginTop:2,fontWeight:600}}>Avg: {(Object.values(rc.ratings).reduce((a,b)=>a+b,0)/REPORT_CATS.length).toFixed(1)} / 5</div>
                </div>
                <span style={{fontFamily:F,fontSize:9,color:"#ffffff",letterSpacing:2,textTransform:"uppercase",background:"#111111",padding:"4px 10px",borderRadius:3,fontWeight:700}}>Issued</span>
              </div>
            ))}
            {!showRc
              ?<button onClick={()=>setShowRc(true)} style={{width:"100%",background:"#111111",border:"none",color:"#ffffff",padding:13,cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:3,fontWeight:700,borderRadius:3,marginTop:8,textTransform:"uppercase"}}>+ Issue New Report Card</button>
              :<div style={{border:`2px solid ${T.black}`,borderRadius:4,padding:18,marginTop:8}}>
                <Lbl>New Report Card — {selA.name}</Lbl>
                <div style={{marginBottom:12}}>
                  <Lbl>Period</Lbl>
                  <select value={rcForm.period} onChange={e=>setRcForm(f=>({...f,period:e.target.value}))} style={{...inpS,cursor:"pointer"}}>
                    <option value="">Select period…</option>
                    <option>Mid-Season December 2026</option><option>End of Season 2026</option>
                    <option>Mid-Season December 2025</option><option>End of Season 2025</option>
                  </select>
                </div>
                {REPORT_CATS.map(cat=>(
                  <div key={cat} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontFamily:F,fontSize:11,color:T.black,fontWeight:600}}>{cat}</span>
                      <span style={{color:"#d4a017",fontSize:13,letterSpacing:2}}>{"★".repeat(rcForm.ratings[cat])}{"☆".repeat(5-rcForm.ratings[cat])}</span>
                    </div>
                    <input type="range" min={1} max={5} value={rcForm.ratings[cat]} onChange={e=>setRcForm(f=>({...f,ratings:{...f.ratings,[cat]:parseInt(e.target.value)}}))} style={{width:"100%",accentColor:"#111111"}}/>
                  </div>
                ))}
                <div style={{marginBottom:10}}><Lbl>Coach Commentary</Lbl><textarea value={rcForm.comments} onChange={e=>setRcForm(f=>({...f,comments:e.target.value}))} placeholder="Write your comments…" style={{...inpS,minHeight:85,resize:"vertical"}}/></div>
                <div style={{marginBottom:14}}><Lbl>Goals — Next Period</Lbl><textarea value={rcForm.goals} onChange={e=>setRcForm(f=>({...f,goals:e.target.value}))} placeholder="Set goals for this athlete…" style={{...inpS,minHeight:65,resize:"vertical"}}/></div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setShowRc(false)} style={{flex:1,background:"#111111",border:"none",color:"#ffffff",padding:10,cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>Cancel</button>
                  <button onClick={issueRc} style={{flex:2,background:"#111111",border:"none",color:"#ffffff",padding:10,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:800,borderRadius:3,textTransform:"uppercase"}}>Issue Report Card</button>
                </div>
              </div>
            }
          </>}
        </>}

        {tab==="activity"&&<>
          <Title accent={ac}>Activity</Title>
          <Sub>Live Log</Sub>
          {actLog.map((l,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:`1px solid ${T.border}`}}>
              <div>
                <div style={{fontFamily:F,fontSize:14,fontWeight:600}}>{l.athlete}</div>
                <div style={{fontFamily:F,fontSize:10,color:T.faint,marginTop:2}}>{l.type} · {l.time}</div>
              </div>
              <div style={{fontFamily:FC,fontSize:20,fontWeight:800,color:l.pts>0?ac:T.faint}}>{l.pts>0?"+":""}{l.pts}</div>
            </div>
          ))}
        </>}

        {tab==="teams"&&isOwner&&<>
          <Title accent={ac}>Teams & Roster</Title>
          <Sub>Create teams, set levels, and import your athlete roster</Sub>

          {/* ── TEAM MANAGER ── */}
          <div style={{fontFamily:FC,fontSize:16,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Teams</div>

          {showTeamForm
            ?<Card style={{marginBottom:16,border:"2px solid #111111"}}>
              <div style={{fontFamily:FC,fontSize:15,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>{editTeamId?"Edit Team":"Create Team"}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div><Lbl>Team Name</Lbl><input value={teamForm.name} onChange={e=>setTeamForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Senior Elite" style={inpS}/></div>
                <div><Lbl>Level Range</Lbl><input value={teamForm.level} onChange={e=>setTeamForm(p=>({...p,level:e.target.value}))} placeholder="e.g. 4-5" style={inpS}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div>
                  <Lbl>Age Group</Lbl>
                  <select value={teamForm.ageGroup} onChange={e=>setTeamForm(p=>({...p,ageGroup:e.target.value}))} style={{...inpS,cursor:"pointer"}}>
                    <option value="">Select…</option>
                    <option>Tiny (5–7)</option>
                    <option>Mini (8–10)</option>
                    <option>Youth (8–11)</option>
                    <option>Junior (11–13)</option>
                    <option>Senior (14+)</option>
                    <option>Open (All Ages)</option>
                    <option>International Open</option>
                  </select>
                </div>
                <div><Lbl>Head Coach</Lbl><input value={teamForm.coachName} onChange={e=>setTeamForm(p=>({...p,coachName:e.target.value}))} placeholder="e.g. Coach Amy" style={inpS}/></div>
              </div>
              <div style={{marginBottom:10}}>
                <Lbl>Practice Schedule</Lbl>
                <input value={teamForm.schedule} onChange={e=>setTeamForm(p=>({...p,schedule:e.target.value}))} placeholder="e.g. Mon/Wed/Fri 4–6pm" style={inpS}/>
              </div>
              <div style={{marginBottom:14}}>
                <Lbl>Team Colour (for roster display)</Lbl>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <input type="color" value={teamForm.color} onChange={e=>setTeamForm(p=>({...p,color:e.target.value}))} style={{width:44,height:40,border:`1px solid ${T.border}`,borderRadius:3,cursor:"pointer",padding:2}}/>
                  <input value={teamForm.color} onChange={e=>setTeamForm(p=>({...p,color:e.target.value}))} style={{...inpS,flex:1}}/>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setShowTeamForm(false);setEditTeamId(null);setTeamForm({name:"",level:"",ageGroup:"",schedule:"",coachName:"",color:"#111111"});}} style={{flex:1,background:"#111111",border:"none",color:"#ffffff",padding:10,cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,borderRadius:3,textTransform:"uppercase"}}>Cancel</button>
                <button onClick={saveTeam} style={{flex:2,background:"#111111",border:"none",color:"#ffffff",padding:10,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:800,borderRadius:3,textTransform:"uppercase"}}>{editTeamId?"Save Changes":"Create Team"}</button>
              </div>
            </Card>
            :<button onClick={()=>{setShowTeamForm(true);setEditTeamId(null);setTeamForm({name:"",level:"",ageGroup:"",schedule:"",coachName:"",color:"#111111"});}} style={{width:"100%",background:"#111111",border:"none",color:"#ffffff",padding:12,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:700,borderRadius:3,marginBottom:12,textTransform:"uppercase"}}>+ Create Team</button>
          }

          {teams.map(team=>{
            const teamAthletes=athletes.filter(a=>a.team===team.name);
            return(
              <div key={team.id} style={{border:`2px solid ${team.color||"#111111"}`,borderRadius:4,marginBottom:10,overflow:"hidden"}}>
                <div style={{background:team.color||"#111111",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:FC,fontSize:17,fontWeight:800,color:"#ffffff",textTransform:"uppercase",letterSpacing:1,lineHeight:1}}>{team.name}</div>
                    <div style={{fontFamily:F,fontSize:9,color:"rgba(255,255,255,0.7)",letterSpacing:2,marginTop:3,textTransform:"uppercase"}}>{team.ageGroup} · Level {team.level} · {team.coachName}</div>
                  </div>
                  <div style={{fontFamily:FC,fontSize:22,fontWeight:800,color:"#ffffff"}}>{teamAthletes.length}</div>
                  <div style={{fontFamily:F,fontSize:9,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:1}}>athletes</div>
                  <div style={{display:"flex",gap:5,marginLeft:8}}>
                    <button onClick={()=>startEditTeam(team)} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.4)",color:"#ffffff",padding:"3px 9px",cursor:"pointer",fontFamily:F,fontSize:9,letterSpacing:2,borderRadius:2,textTransform:"uppercase"}}>Edit</button>
                    <button onClick={()=>deleteTeam(team.id)} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.4)",color:"#ffffff",padding:"3px 9px",cursor:"pointer",fontFamily:F,fontSize:9,letterSpacing:2,borderRadius:2,textTransform:"uppercase"}}>Remove</button>
                  </div>
                </div>
                <div style={{padding:"10px 14px",background:"#ffffff"}}>
                  {team.schedule&&<div style={{fontFamily:F,fontSize:11,color:T.muted,marginBottom:8}}>⏰ {team.schedule}</div>}
                  {teamAthletes.length===0
                    ?<div style={{fontFamily:F,fontSize:12,color:T.faint,fontStyle:"italic"}}>No athletes assigned to this team yet.</div>
                    :<div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {teamAthletes.map(a=>(
                        <span key={a.id} style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:3,padding:"3px 9px",fontFamily:F,fontSize:11,color:T.dark,fontWeight:600}}>{a.name}</span>
                      ))}
                    </div>
                  }
                </div>
              </div>
            );
          })}

          {/* ── ASSIGN ATHLETE ── */}
          <div style={{borderTop:`2px solid ${T.border}`,paddingTop:20,marginTop:8,marginBottom:24}}>
            <div style={{fontFamily:FC,fontSize:16,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Assign Athlete to Team</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div>
                <Lbl>Athlete</Lbl>
                <select value={assignForm.athleteId} onChange={e=>setAssignForm(p=>({...p,athleteId:e.target.value}))} style={{...inpS,cursor:"pointer"}}>
                  <option value="">Select athlete…</option>
                  {athletes.map(a=><option key={a.id} value={a.id}>{a.name} — currently: {a.team||"Unassigned"}</option>)}
                </select>
              </div>
              <div>
                <Lbl>Team</Lbl>
                <select value={assignForm.teamId} onChange={e=>setAssignForm(p=>({...p,teamId:e.target.value}))} style={{...inpS,cursor:"pointer"}}>
                  <option value="">Select team…</option>
                  {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <button onClick={assignAthlete} style={{background:"#111111",border:"none",color:"#ffffff",padding:"10px 20px",cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>Assign</button>
          </div>

          {/* ── CSV IMPORT ── */}
          <div style={{borderTop:`2px solid ${T.border}`,paddingTop:20}}>
            <div style={{fontFamily:FC,fontSize:16,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Import Roster from Spreadsheet</div>
            <div style={{fontFamily:F,fontSize:12,color:T.muted,marginBottom:14,lineHeight:1.6}}>
              Upload a CSV file with columns: <strong>Name</strong>, <strong>Email</strong>, <strong>Team</strong>. Team names must match teams you've created above. Athletes already in the system (matched by name) will be skipped.
            </div>

            {/* Download template */}
            <button onClick={()=>{
              const header="Name,Email,Team\n";
              const rows=teams.map(t=>`"Example Athlete","athlete@email.com","${t.name}"`).join("\n");
              const blob=new Blob([header+rows],{type:"text/csv"});
              const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="cheer_passport_roster_template.csv";a.click();
            }} style={{background:"#111111",border:"none",color:"#ffffff",padding:"9px 16px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase",marginBottom:14,display:"inline-block"}}>↓ Download CSV Template</button>

            <div style={{border:"2px dashed #111111",borderRadius:4,padding:20,textAlign:"center",marginBottom:14,background:T.s1}}>
              <div style={{fontFamily:F,fontSize:13,color:T.dark,marginBottom:10,fontWeight:600}}>Drop your CSV here or click to upload</div>
              <label style={{background:"#111111",border:"none",color:"#ffffff",padding:"10px 20px",cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:700,borderRadius:3,textTransform:"uppercase",display:"inline-block"}}>
                Choose CSV File
                <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} style={{display:"none"}}/>
              </label>
            </div>

            {csvError&&<div style={{background:"#fff5f5",border:"1px solid #f5c6cb",borderRadius:3,padding:"10px 14px",fontFamily:F,fontSize:12,color:"#c0392b",marginBottom:12}}>{csvError}</div>}

            {csvPreview&&<>
              <div style={{fontFamily:FC,fontSize:14,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{csvPreview.length} Athletes Ready to Import</div>
              <div style={{border:`1px solid ${T.border}`,borderRadius:4,overflow:"hidden",marginBottom:12}}>
                {/* Header */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0,background:"#111111",padding:"8px 14px"}}>
                  {["Name","Email","Team"].map(h=><div key={h} style={{fontFamily:F,fontSize:9,color:"#ffffff",letterSpacing:2,textTransform:"uppercase",fontWeight:700}}>{h}</div>)}
                </div>
                {csvPreview.slice(0,10).map((row,i)=>{
                  const teamMatch=teams.find(t=>t.name.toLowerCase()===row.team.toLowerCase());
                  const exists=athletes.find(a=>a.name.toLowerCase()===row.name.toLowerCase());
                  return(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0,padding:"9px 14px",borderTop:`1px solid ${T.border}`,background:exists?"#fff5f5":i%2===0?"#ffffff":T.s1,alignItems:"center"}}>
                      <div style={{fontFamily:F,fontSize:12,fontWeight:600,color:exists?"#c0392b":T.black}}>{row.name}{exists&&<span style={{fontSize:9,marginLeft:6,color:"#c0392b"}}>(already exists)</span>}</div>
                      <div style={{fontFamily:F,fontSize:11,color:T.muted}}>{row.email||"—"}</div>
                      <div>
                        {row.team
                          ?<span style={{background:teamMatch?"#d4edda":"#fff3cd",color:teamMatch?"#2d8a4e":"#856404",fontFamily:F,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:2}}>{row.team}{!teamMatch&&" ⚠"}</span>
                          :<span style={{fontFamily:F,fontSize:10,color:T.faint}}>Unassigned</span>
                        }
                      </div>
                    </div>
                  );
                })}
                {csvPreview.length>10&&<div style={{padding:"8px 14px",fontFamily:F,fontSize:11,color:T.muted,background:T.s1}}>…and {csvPreview.length-10} more</div>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setCsvPreview(null);}} style={{flex:1,background:"#111111",border:"none",color:"#ffffff",padding:10,cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,borderRadius:3,textTransform:"uppercase"}}>Cancel</button>
                <button onClick={importCsvRoster} style={{flex:2,background:"#111111",border:"none",color:"#ffffff",padding:10,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:800,borderRadius:3,textTransform:"uppercase"}}>Import {csvPreview.filter(r=>!athletes.find(a=>a.name.toLowerCase()===r.name.toLowerCase())).length} New Athletes</button>
              </div>
            </>}

            {importResult&&<div style={{background:"#d4edda",border:"1px solid #c3e6cb",borderRadius:3,padding:"12px 14px",fontFamily:F,fontSize:13,color:"#2d8a4e",fontWeight:600}}>
              ✓ Import complete — {importResult.added} athletes added{importResult.skipped>0?`, ${importResult.skipped} skipped (already existed)`:""}.
            </div>}
          </div>
        </>}

        {tab==="points"&&isOwner&&<>
          <Title accent={ac}>Adjust Points</Title>
          <Sub>All changes are logged</Sub>
          <Lbl>Select Athlete</Lbl>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>{athletes.map(a=><ABt key={a.id} a={a}/>)}</div>
          <Card>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div><Lbl>Amount</Lbl><input type="number" min="1" value={ptAdj.amount} onChange={e=>setPtAdj(f=>({...f,amount:e.target.value}))} placeholder="e.g. 50" style={inpS}/></div>
              <div><Lbl>Reason</Lbl><input value={ptAdj.reason} onChange={e=>setPtAdj(f=>({...f,reason:e.target.value}))} placeholder="e.g. Competition bonus" style={inpS}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <button onClick={()=>adjustPts("add")} style={{background:"#111111",border:"none",color:"#ffffff",padding:12,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:800,borderRadius:3,textTransform:"uppercase"}}>+ Add Points</button>
              <button onClick={()=>adjustPts("remove")} style={{background:"#111111",border:"none",color:"#ffffff",padding:12,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>− Remove</button>
            </div>
          </Card>
        </>}

        {tab==="shop"&&isOwner&&<ShopView gymName={user.gym} accentColor={ac} editable={true} shopItems={shopItems} setShopItems={setShopItems}/>}

        {tab==="fulfillment"&&isOwner&&<>
          <Title accent={ac}>Order Fulfillment</Title>
          <Sub>{(orders||[]).filter(o=>o.status==="pending").length} pending · {(orders||[]).filter(o=>o.status==="fulfilled").length} fulfilled</Sub>

          {(!orders||orders.length===0)&&(
            <div style={{fontFamily:F,fontSize:13,color:T.faint,padding:"40px 0",textAlign:"center",fontStyle:"italic"}}>No orders yet. Orders appear here automatically when athletes redeem points in the shop.</div>
          )}

          {/* Pending orders */}
          {(orders||[]).filter(o=>o.status==="pending").length>0&&<>
            <div style={{fontFamily:FC,fontSize:16,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Pending</div>
            {(orders||[]).filter(o=>o.status==="pending").map(order=>(
              <Card key={order.id} style={{marginBottom:10,border:"2px solid #111111"}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  {order.imageUrl
                    ?<img src={order.imageUrl} alt={order.itemName} style={{width:48,height:48,borderRadius:4,objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none";}}/>
                    :<div style={{width:48,height:48,borderRadius:4,background:T.s1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:ac,flexShrink:0}}>{order.icon||"✦"}</div>
                  }
                  <div style={{flex:1}}>
                    <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:T.black}}>{order.itemName}</div>
                    <div style={{fontFamily:F,fontSize:11,color:T.muted,marginTop:2}}>{order.athleteName}{order.athleteTeam?` · ${order.athleteTeam}`:""}</div>
                    <div style={{fontFamily:F,fontSize:10,color:T.faint,marginTop:2}}>Ordered {order.orderedDate} · {order.cost} pts</div>
                  </div>
                  <button onClick={()=>setOrders(p=>p.map(o=>o.id===order.id?{...o,status:"fulfilled",fulfilledDate:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}:o))} style={{background:"#111111",border:"none",color:"#ffffff",padding:"8px 16px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase",whiteSpace:"nowrap"}}>✓ Mark Fulfilled</button>
                </div>
              </Card>
            ))}
          </>}

          {/* Fulfilled orders */}
          {(orders||[]).filter(o=>o.status==="fulfilled").length>0&&<>
            <div style={{fontFamily:FC,fontSize:16,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginTop:24,marginBottom:10}}>Fulfilled</div>
            {(orders||[]).filter(o=>o.status==="fulfilled").map(order=>(
              <div key={order.id} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${T.border}`,opacity:0.65}}>
                <div style={{width:36,height:36,borderRadius:4,background:T.s1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:T.muted,flexShrink:0}}>{order.icon||"✦"}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:F,fontSize:13,fontWeight:600,color:T.black}}>{order.itemName}</div>
                  <div style={{fontFamily:F,fontSize:10,color:T.faint}}>{order.athleteName} · Fulfilled {order.fulfilledDate}</div>
                </div>
                <span style={{fontFamily:F,fontSize:9,color:"#2d8a4e",letterSpacing:2,textTransform:"uppercase",fontWeight:700}}>✓ Done</span>
              </div>
            ))}
          </>}

          {/* Inventory at a glance */}
          <div style={{borderTop:`2px solid ${T.border}`,paddingTop:20,marginTop:24}}>
            <div style={{fontFamily:FC,fontSize:16,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Current Inventory</div>
            {(shopItems||[]).map(item=>(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{flex:1,fontFamily:F,fontSize:13,fontWeight:600,color:T.black}}>{item.name}</div>
                <span style={{fontFamily:FC,fontSize:16,fontWeight:800,color:item.stock<=3?"#c0392b":T.black}}>{item.stock}</span>
                <span style={{fontFamily:F,fontSize:9,color:T.faint,letterSpacing:1,textTransform:"uppercase"}}>in stock</span>
              </div>
            ))}
            <div style={{fontFamily:F,fontSize:11,color:T.muted,marginTop:10,fontStyle:"italic"}}>Manage stock quantities from the Pro Shop tab.</div>
          </div>
        </>}

        {tab==="access"&&isOwner&&<>
          <Title accent={ac}>Access & Codes</Title>
          <Sub>Share invite codes to onboard your gym</Sub>
          <div style={{display:"grid",gap:10,marginBottom:24}}>
            {(()=>{
              const gymPrefix=Object.entries(INVITE_CODES).find(([code,inv])=>inv.gym===user.gym)?.[0]?.split("-")[0]||user.gym.toUpperCase().replace(/\s+/g,"").slice(0,7);
              return[
                {role:"Athlete",code:`${gymPrefix}-ATH-2026`,desc:"Share with athletes to create their account"},
                {role:"Parent",code:`${gymPrefix}-PARENT-2026`,desc:"For parents of under-18 athletes — links to their child's passport"},
                {role:"Coach",code:`${gymPrefix}-COACH-2026`,desc:"For coaching staff — awards skills, attendance & spirit points"},
              ];
            })().map(c=>(
              <Card key={c.role}>
                <div style={{fontFamily:FC,fontSize:16,fontWeight:800,textTransform:"uppercase",letterSpacing:1,color:T.black,marginBottom:4}}>{c.role} Invite Code</div>
                <div style={{fontFamily:F,fontSize:11,color:T.faint,marginBottom:12}}>{c.desc}</div>
                <div style={{display:"flex",alignItems:"center",gap:10,background:T.s1,borderRadius:3,padding:"12px 14px"}}>
                  <span style={{fontFamily:FC,fontSize:18,fontWeight:800,letterSpacing:4,color:T.black,flex:1}}>{c.code}</span>
                  <button onClick={()=>{navigator.clipboard?.writeText(c.code);notify(`${c.role} code copied!`,true);}} style={{background:"#111111",border:"none",color:"#ffffff",padding:"6px 14px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase",whiteSpace:"nowrap"}}>Copy</button>
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <div style={{fontFamily:FC,fontSize:16,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Permission Levels</div>
            {[
              {role:"Gym Owner",perms:["Full settings control","Award & remove skills","Adjust points","Add custom skills","Issue report cards","Manage invite codes","Pro shop manager","Gym colour settings"]},
              {role:"Coach",perms:["Award skills","Log attendance","Award perfect attendance","Award spirit points","Issue report cards"]},
              {role:"Athlete",perms:["View passport & skills","View spirit points","View report cards","Buy from swag shop","Leaderboard","Transfer passport"]},
              {role:"Parent",perms:["View child's passport","View skills & reports","Buy from swag shop"]},
            ].map((r,i)=>(
              <div key={r.role} style={{padding:"12px 0",borderTop:i>0?`1px solid ${T.border}`:"none"}}>
                <div style={{fontFamily:F,fontSize:11,fontWeight:700,letterSpacing:2,color:T.black,marginBottom:8,textTransform:"uppercase"}}>{r.role}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {r.perms.map(p=><span key={p} style={{fontFamily:F,fontSize:10,color:T.muted,background:T.s1,border:`1px solid ${T.border}`,borderRadius:2,padding:"3px 8px"}}>{p}</span>)}
                </div>
              </div>
            ))}
          </Card>
        </>}

        {tab==="settings"&&isOwner&&<>
          <Title accent={ac}>Gym Settings</Title>
          <Sub>Customise your gym's colours and profile</Sub>
          <Card style={{marginBottom:16}}>
            <Lbl>Gym Display Name</Lbl>
            <input value={gymSettings.name} onChange={e=>setGymSettings(p=>({...p,name:e.target.value}))} style={{...inpS,marginBottom:16}}/>
            <Lbl>Gym Contact Email</Lbl>
            <div style={{fontFamily:F,fontSize:11,color:T.muted,marginBottom:8,lineHeight:1.5}}>Shown to athletes and parents who need to reach the gym directly.</div>
            <input type="email" value={gymSettings.contactEmail} onChange={e=>setGymSettings(p=>({...p,contactEmail:e.target.value}))} placeholder="e.g. info@yourgym.com" style={{...inpS,marginBottom:16}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              <div>
                <Lbl>Primary Colour (header background)</Lbl>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <input type="color" value={gymSettings.primary} onChange={e=>setGymSettings(p=>({...p,primary:e.target.value}))} style={{width:48,height:40,border:`1px solid ${T.border}`,borderRadius:3,cursor:"pointer",padding:2}}/>
                  <input value={gymSettings.primary} onChange={e=>setGymSettings(p=>({...p,primary:e.target.value}))} style={{...inpS,flex:1}}/>
                </div>
              </div>
              <div>
                <Lbl>Secondary Colour (accents & points)</Lbl>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <input type="color" value={gymSettings.secondary} onChange={e=>setGymSettings(p=>({...p,secondary:e.target.value}))} style={{width:48,height:40,border:`1px solid ${T.border}`,borderRadius:3,cursor:"pointer",padding:2}}/>
                  <input value={gymSettings.secondary} onChange={e=>setGymSettings(p=>({...p,secondary:e.target.value}))} style={{...inpS,flex:1}}/>
                </div>
              </div>
            </div>
            <Lbl>Preview</Lbl>
            <div style={{border:`1px solid ${T.border}`,borderRadius:4,overflow:"hidden",marginBottom:14}}>
              <div style={{background:gymSettings.primary,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:gymSettings.secondary,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontSize:12,fontWeight:800,color:gymSettings.primary}}>{gymSettings.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                <div style={{fontFamily:FC,fontSize:14,fontWeight:800,color:"#ffffff",letterSpacing:1,textTransform:"uppercase"}}>{gymSettings.name}</div>
              </div>
            </div>
            <button onClick={()=>notify("Settings saved!",true)} style={{width:"100%",background:"#111111",border:"none",color:"#ffffff",padding:"12px",cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:800,borderRadius:3,textTransform:"uppercase"}}>Save Settings</button>
          </Card>
          <Card>
            <Lbl>Gym Logo</Lbl>
            <div style={{fontFamily:F,fontSize:13,color:T.dark,marginBottom:12,fontWeight:300,lineHeight:1.6}}>In the live app you'll be able to upload your gym logo here.</div>
            <button style={{background:"#111111",border:"none",color:"#ffffff",padding:"14px",cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:700,borderRadius:3,textTransform:"uppercase",width:"100%"}}>Upload Gym Logo (coming soon)</button>
          </Card>
        </>}

      </div>
    </div>
  );
}

// ── PLATFORM ADMIN ────────────────────────────────────────────────────────────
function PlatformAdmin({user,onLogout}){
  const [tab,setTab]=useState("gyms");
  const [toast,setToast]=useState(null);
  const notify=(msg,dark=false)=>{setToast({msg,dark});setTimeout(()=>setToast(null),2200);};

  const [gyms,setGyms]=useState([
    {id:"g1",name:"Dynasty Cheer Allstars",short:"Dynasty Cheer",primary:"#1a1a1a",secondary:"#888888",status:"active",athletes:48,code:"DYNASTY"},
    {id:"g2",name:"University of Calgary Cheerleading",short:"U of C Cheer",primary:"rgb(214,0,28)",secondary:"rgb(255,205,0)",status:"active",athletes:31,code:"UOFC"},
  ]);
  const [showNewGym,setShowNewGym]=useState(false);
  const [editGym,setEditGym]=useState(null);
  const [gymForm,setGymForm]=useState({name:"",short:"",primary:"#1a1a2e",secondary:"#c8a94c",code:""});

  const [skills,setSkills]=useState(BASE_SKILLS);
  const [activeCat,setActiveCat]=useState("stunts");
  const [activeLevel,setActiveLevel]=useState(1);
  const [editPts,setEditPts]=useState({...LEVEL_PTS});
  const [skillForm,setSkillForm]=useState({name:"",desc:""});
  const [editingSkill,setEditingSkill]=useState(null);
  const [editSkillForm,setEditSkillForm]=useState({name:"",desc:""});

  const saveGym=()=>{
    if(!gymForm.name.trim()||!gymForm.short.trim()){notify("Gym name required");return;}
    const code=(gymForm.code.trim()||gymForm.short).toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,10);
    if(!code){notify("Invite code prefix required");return;}
    if(gyms.some(g=>g.code===code&&g.id!==editGym)){notify("Code prefix already used");return;}
    if(editGym){
      setGyms(p=>p.map(g=>g.id===editGym?{...g,...gymForm,code}:g));
      notify(`${gymForm.name} updated`,true);
    } else {
      setGyms(p=>[...p,{id:`g${Date.now()}`,...gymForm,code,status:"active",athletes:0}]);
      notify(`${gymForm.name} created!`,true);
    }
    setGymForm({name:"",short:"",primary:"#1a1a2e",secondary:"#c8a94c",code:""});
    setShowNewGym(false);setEditGym(null);
  };
  const startEditGym=(gym)=>{setEditGym(gym.id);setGymForm({name:gym.name,short:gym.short,primary:gym.primary,secondary:gym.secondary,code:gym.code});setShowNewGym(true);};
  const deleteGym=(id)=>{setGyms(p=>p.filter(g=>g.id!==id));notify("Gym removed");};
  const toggleGym=(id)=>setGyms(p=>p.map(g=>g.id===id?{...g,status:g.status==="active"?"paused":"active"}:g));

  const addSkill=()=>{
    if(!skillForm.name.trim()){notify("Enter a skill name");return;}
    const id=`p_${Date.now()}`;
    setSkills(p=>({...p,[activeCat]:{...p[activeCat],levels:{...p[activeCat].levels,[activeLevel]:[...(p[activeCat].levels[activeLevel]||[]),{id,name:skillForm.name,desc:skillForm.desc,custom:true}]}}}));
    setSkillForm({name:"",desc:""});
    notify(`"${skillForm.name}" added`,true);
  };
  const deleteSkill=(catKey,lvl,id)=>{
    setSkills(p=>({...p,[catKey]:{...p[catKey],levels:{...p[catKey].levels,[lvl]:p[catKey].levels[lvl].filter(s=>s.id!==id)}}}));
    notify("Skill removed");
  };
  const startEditSkill=(catKey,lvl,sk)=>{setEditingSkill({catKey,lvl,id:sk.id});setEditSkillForm({name:sk.name,desc:sk.desc||""});};
  const saveEditSkill=()=>{
    if(!editSkillForm.name.trim()){notify("Enter a skill name");return;}
    const{catKey,lvl,id}=editingSkill;
    setSkills(p=>({...p,[catKey]:{...p[catKey],levels:{...p[catKey].levels,[lvl]:p[catKey].levels[lvl].map(s=>s.id===id?{...s,...editSkillForm}:s)}}}));
    setEditingSkill(null);notify("Skill updated",true);
  };

  const tabs=[{id:"gyms",l:"Gyms"},{id:"skills",l:"Skill Editor"},{id:"points",l:"Point Values"},{id:"spirit",l:"Spirit Awards"}];
  const inpS={background:T.s1,border:`1px solid ${T.border2}`,color:T.black,padding:"10px 12px",fontFamily:F,fontSize:13,width:"100%",outline:"none",borderRadius:3};

  return(
    <div style={{minHeight:"100vh",background:"#ffffff",color:T.black,fontFamily:F}}>
      <style>{GS}</style>
      {toast&&<Toast {...toast}/>}
      <div style={{background:"#111111",padding:"12px 18px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:FC,fontSize:18,fontWeight:800,color:"#ffffff",letterSpacing:2,textTransform:"uppercase",lineHeight:1}}>Cheer Passport</div>
          <div style={{fontFamily:F,fontSize:9,color:"rgba(255,255,255,0.5)",letterSpacing:3,textTransform:"uppercase",marginTop:1}}>Platform Admin</div>
        </div>
        <span style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",padding:"3px 10px",fontFamily:F,fontSize:9,letterSpacing:3,color:"#ffffff",fontWeight:700,borderRadius:2,textTransform:"uppercase"}}>Admin</span>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <CPLogo size={36}/>
          <button onClick={onLogout} style={{background:"#000000",border:"2px solid #ffffff",color:"#ffffff",padding:"5px 12px",cursor:"pointer",fontFamily:F,fontSize:9,letterSpacing:2,borderRadius:2,textTransform:"uppercase",fontWeight:700}}>Log Out</button>
        </div>
      </div>
      <div style={{position:"sticky",top:0,zIndex:100,background:"#ffffff",boxShadow:"0 1px 0 rgba(0,0,0,0.08)"}}>
        <NavTabs tabs={tabs} active={tab} onSelect={setTab}/>
      </div>
      <div style={{padding:"24px 18px",maxWidth:800,margin:"0 auto"}}>

        {tab==="gyms"&&<>
          <Title>Gym Manager</Title>
          <Sub>{gyms.length} gyms on the platform</Sub>
          {showNewGym
            ?<Card style={{marginBottom:20,borderWidth:2,borderColor:T.black}}>
              <div style={{fontFamily:FC,fontSize:18,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>{editGym?"Edit Gym":"Create New Gym"}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                <div><Lbl>Full Gym Name</Lbl><input value={gymForm.name} onChange={e=>setGymForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Dynasty Cheer Allstars" style={inpS}/></div>
                <div><Lbl>Short Name</Lbl><input value={gymForm.short} onChange={e=>setGymForm(p=>({...p,short:e.target.value}))} placeholder="e.g. Dynasty Cheer" style={inpS}/></div>
              </div>
              <div style={{marginBottom:12}}>
                <Lbl>Invite Code Prefix</Lbl>
                <input value={gymForm.code} onChange={e=>setGymForm(p=>({...p,code:e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"")}))} placeholder="e.g. DYNASTY" style={{...inpS,textTransform:"uppercase",letterSpacing:2}}/>
                <div style={{fontFamily:F,fontSize:9,color:T.faint,marginTop:5}}>
                  Generates: <strong>{(gymForm.code.trim()||gymForm.short||"GYM").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,10)||"GYM"}-ATH-2026</strong> · <strong>-COACH-2026</strong> · <strong>-PARENT-2026</strong>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                <div>
                  <Lbl>Primary Colour</Lbl>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <input type="color" value={gymForm.primary} onChange={e=>setGymForm(p=>({...p,primary:e.target.value}))} style={{width:44,height:40,border:`1px solid ${T.border}`,borderRadius:3,cursor:"pointer",padding:2}}/>
                    <input value={gymForm.primary} onChange={e=>setGymForm(p=>({...p,primary:e.target.value}))} style={{...inpS,flex:1}}/>
                  </div>
                </div>
                <div>
                  <Lbl>Secondary Colour</Lbl>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <input type="color" value={gymForm.secondary} onChange={e=>setGymForm(p=>({...p,secondary:e.target.value}))} style={{width:44,height:40,border:`1px solid ${T.border}`,borderRadius:3,cursor:"pointer",padding:2}}/>
                    <input value={gymForm.secondary} onChange={e=>setGymForm(p=>({...p,secondary:e.target.value}))} style={{...inpS,flex:1}}/>
                  </div>
                </div>
              </div>
              <Lbl>Preview</Lbl>
              <div style={{border:`1px solid ${T.border}`,borderRadius:4,overflow:"hidden",marginBottom:16}}>
                <div style={{background:gymForm.primary,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:gymForm.secondary,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontSize:13,fontWeight:800,color:gymForm.primary}}>{gymForm.short?.split(" ").map(w=>w[0]).join("").slice(0,2)||"GY"}</div>
                  <div style={{fontFamily:FC,fontSize:15,fontWeight:800,color:"#ffffff",textTransform:"uppercase",letterSpacing:1}}>{gymForm.name||"Gym Name"}</div>
                  <CPLogo size={32}/>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setShowNewGym(false);setEditGym(null);setGymForm({name:"",short:"",primary:"#1a1a2e",secondary:"#c8a94c",code:""});}} style={{flex:1,background:"#111111",border:"none",color:"#ffffff",padding:11,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:2,borderRadius:3,textTransform:"uppercase"}}>Cancel</button>
                <button onClick={saveGym} style={{flex:2,background:"#111111",border:"none",color:"#ffffff",padding:11,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:800,borderRadius:3,textTransform:"uppercase"}}>{editGym?"Save Changes":"Create Gym"}</button>
              </div>
            </Card>
            :<button onClick={()=>{setShowNewGym(true);setEditGym(null);setGymForm({name:"",short:"",primary:"#1a1a2e",secondary:"#c8a94c",code:""});}} style={{width:"100%",background:"#111111",border:"none",color:"#ffffff",padding:14,cursor:"pointer",fontFamily:F,fontSize:12,letterSpacing:4,fontWeight:800,borderRadius:3,marginBottom:20,textTransform:"uppercase"}}>+ Create New Gym</button>
          }
          {gyms.map(gym=>(
            <Card key={gym.id} style={{marginBottom:10}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:46,height:46,borderRadius:4,background:gym.primary,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontSize:16,fontWeight:800,color:"#ffffff",flexShrink:0}}>{gym.short.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:F,fontSize:15,fontWeight:700}}>{gym.name}</div>
                  <div style={{display:"flex",gap:8,marginTop:4,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{display:"inline-block",width:12,height:12,borderRadius:2,background:gym.primary,border:`1px solid ${T.border}`,flexShrink:0}}/>
                    <span style={{fontFamily:F,fontSize:10,color:T.faint}}>{gym.primary}</span>
                    <span style={{display:"inline-block",width:12,height:12,borderRadius:2,background:gym.secondary,border:`1px solid ${T.border}`,flexShrink:0}}/>
                    <span style={{fontFamily:F,fontSize:10,color:T.faint}}>{gym.secondary}</span>
                    <span style={{fontFamily:F,fontSize:9,color:T.faint,background:T.s1,padding:"1px 7px",borderRadius:2,letterSpacing:2,textTransform:"uppercase"}}>Code: {gym.code}-ATH-2026</span>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end"}}>
                  <span style={{background:gym.status==="active"?"#d4edda":"#fff3cd",color:gym.status==="active"?"#2d8a4e":"#856404",fontFamily:F,fontSize:9,fontWeight:700,letterSpacing:2,padding:"3px 8px",borderRadius:2,textTransform:"uppercase"}}>{gym.status}</span>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>startEditGym(gym)} style={{background:"#111111",border:"none",color:"#ffffff",padding:"4px 10px",cursor:"pointer",fontFamily:F,fontSize:9,letterSpacing:2,borderRadius:2,textTransform:"uppercase"}}>Edit</button>
                    <button onClick={()=>toggleGym(gym.id)} style={{background:"#111111",border:"none",color:"#ffffff",padding:"4px 10px",cursor:"pointer",fontFamily:F,fontSize:9,letterSpacing:2,borderRadius:2,textTransform:"uppercase"}}>{gym.status==="active"?"Pause":"Activate"}</button>
                    <button onClick={()=>deleteGym(gym.id)} style={{background:"#111111",border:"none",color:"#ffffff",padding:"4px 10px",cursor:"pointer",fontFamily:F,fontSize:9,letterSpacing:2,borderRadius:2,textTransform:"uppercase"}}>Remove</button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </>}

        {tab==="skills"&&<>
          <Title>Skill Editor</Title>
          <Sub>Add skills manually, or upload a spreadsheet to bulk import</Sub>

          {/* CSV import for skills */}
          <Card style={{marginBottom:20,background:T.s1}}>
            <div style={{fontFamily:FC,fontSize:13,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Bulk Import Skills via CSV</div>
            <div style={{fontFamily:F,fontSize:11,color:T.muted,marginBottom:12,lineHeight:1.6}}>
              CSV columns: <strong>Category</strong> (stunts/tumbling/jumps/tosses), <strong>Level</strong> (1–7), <strong>SkillName</strong>, <strong>Description</strong>. Skills already in the system (matched by name + level + category) will be skipped.
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
              <button onClick={()=>{
                const rows=["Category,Level,SkillName,Description"];
                Object.entries(skills).forEach(([catKey,cat])=>{
                  Object.entries(cat.levels).forEach(([lvl,sks])=>{
                    sks.forEach(sk=>{rows.push(`"${catKey}",${lvl},"${sk.name}","${sk.desc||""}"`);});
                  });
                });
                const blob=new Blob([rows.join("\n")],{type:"text/csv"});
                const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="skills_template.csv";a.click();
              }} style={{background:"#111111",border:"none",color:"#ffffff",padding:"9px 14px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>↓ Download Current Skills as CSV</button>
              <label style={{background:"#111111",border:"none",color:"#ffffff",padding:"9px 14px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase",display:"inline-block"}}>
                ↑ Upload Skills CSV
                <input type="file" accept=".csv,text/csv" onChange={(e)=>{
                  const file=e.target.files[0];if(!file)return;
                  const reader=new FileReader();
                  reader.onload=(evt)=>{
                    try{
                      const lines=evt.target.result.split("\n").map(l=>l.trim()).filter(Boolean);
                      if(lines.length<2){notify("File needs a header row and at least one skill");return;}
                      const headers=lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/[^a-z]/g,""));
                      const col=(n)=>headers.findIndex(h=>h.includes(n));
                      const catIdx=col("cat"),lvlIdx=col("level")>-1?col("level"):col("lv"),nameIdx=col("skill")>-1?col("skill"):col("name"),descIdx=col("desc");
                      if(nameIdx===-1){notify("CSV must have a SkillName column");return;}
                      let added=0,skipped=0;
                      const newSkills={...skills};
                      lines.slice(1).forEach(line=>{
                        const cols=line.split(",").map(c=>c.trim().replace(/^"|"$/g,""));
                        const catKey=(catIdx>=0?cols[catIdx]:"stunts").toLowerCase();
                        const lv=parseInt(lvlIdx>=0?cols[lvlIdx]:1)||1;
                        const name=cols[nameIdx]||"";
                        const desc=descIdx>=0?cols[descIdx]||"":"";
                        if(!name||!newSkills[catKey])return;
                        const existing=(newSkills[catKey].levels[lv]||[]).find(s=>s.name.toLowerCase()===name.toLowerCase());
                        if(existing){skipped++;return;}
                        if(!newSkills[catKey].levels[lv])newSkills[catKey]={...newSkills[catKey],levels:{...newSkills[catKey].levels,[lv]:[]}};
                        newSkills[catKey]={...newSkills[catKey],levels:{...newSkills[catKey].levels,[lv]:[...(newSkills[catKey].levels[lv]||[]),{id:`csv_${Date.now()}_${added}`,name,desc,custom:true}]}};
                        added++;
                      });
                      setSkills(newSkills);
                      notify(`${added} skills imported, ${skipped} skipped`,true);
                    }catch(err){notify("Could not parse CSV — check format");}
                  };
                  reader.readAsText(file);e.target.value="";
                }} style={{display:"none"}}/>
              </label>
            </div>
            <div style={{fontFamily:F,fontSize:10,color:T.faint}}>Tip: download the current skill list as a starting template, add your new rows, then re-upload.</div>
          </Card>
          <div style={{marginBottom:16}}>
            <Lbl>Category</Lbl>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {Object.entries(skills).map(([k,c])=>(
                <button key={k} onClick={()=>{setActiveCat(k);setActiveLevel(Object.keys(c.levels)[0]*1||1);}} style={{background:"#111111",border:activeCat===k?"2px solid #ffffff":"2px solid transparent",color:"#ffffff",opacity:activeCat===k?1:0.5,padding:"8px 16px",cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase",transition:"all .15s"}}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <Lbl>Level</Lbl>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {[1,2,3,4,5,6,7].map(lv=>{
                const hasSk=(skills[activeCat]?.levels[lv]||[]).length>0;
                return(
                  <button key={lv} onClick={()=>setActiveLevel(lv)} style={{background:"#111111",border:activeLevel===lv?"2px solid #ffffff":"2px solid transparent",color:"#ffffff",opacity:activeLevel===lv?1:(hasSk?0.7:0.4),padding:"7px 14px",cursor:"pointer",fontFamily:FC,fontSize:14,fontWeight:800,borderRadius:3,minWidth:44,transition:"all .15s"}}>
                    {lv}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,paddingBottom:8,borderBottom:`2px solid ${T.black}`}}>
              <div style={{fontFamily:FC,fontSize:18,fontWeight:800,textTransform:"uppercase",letterSpacing:1}}>{skills[activeCat]?.label} — Level {activeLevel}</div>
              <div style={{fontFamily:F,fontSize:10,color:T.faint}}>{(skills[activeCat]?.levels[activeLevel]||[]).length} skills · {editPts[activeLevel]} pts each</div>
            </div>
            {(skills[activeCat]?.levels[activeLevel]||[]).length===0&&(
              <div style={{fontFamily:F,fontSize:13,color:T.faint,padding:"20px 0",textAlign:"center",fontStyle:"italic"}}>No skills at this level yet. Add one below.</div>
            )}
            {(skills[activeCat]?.levels[activeLevel]||[]).map(sk=>(
              <div key={sk.id}>
                {editingSkill?.id===sk.id
                  ?<div style={{background:T.s1,border:`1px solid ${T.border2}`,borderRadius:4,padding:14,marginBottom:6}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <div><Lbl>Skill Name</Lbl><input value={editSkillForm.name} onChange={e=>setEditSkillForm(p=>({...p,name:e.target.value}))} style={inpS}/></div>
                      <div><Lbl>Description</Lbl><input value={editSkillForm.desc} onChange={e=>setEditSkillForm(p=>({...p,desc:e.target.value}))} style={inpS}/></div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>setEditingSkill(null)} style={{flex:1,background:"#111111",border:"none",color:"#ffffff",padding:"7px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,borderRadius:3,textTransform:"uppercase"}}>Cancel</button>
                      <button onClick={saveEditSkill} style={{flex:2,background:"#111111",border:"none",color:"#ffffff",padding:"7px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:800,borderRadius:3,textTransform:"uppercase"}}>Save</button>
                    </div>
                  </div>
                  :<div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:sk.custom?T.s1:"#ffffff",border:`1px solid ${T.border}`,borderRadius:3,marginBottom:5}}>
                    {sk.custom&&<span style={{fontFamily:F,fontSize:8,color:"#ffffff",background:"#555",borderRadius:2,padding:"1px 6px",letterSpacing:2,fontWeight:700,textTransform:"uppercase",flexShrink:0}}>Custom</span>}
                    <div style={{flex:1}}>
                      <div style={{fontFamily:F,fontSize:13,fontWeight:600}}>{sk.name}</div>
                      <div style={{fontFamily:F,fontSize:10,color:T.faint}}>{sk.desc||"—"}</div>
                    </div>
                    <div style={{display:"flex",gap:5}}>
                      <button onClick={()=>startEditSkill(activeCat,activeLevel,sk)} style={{background:"#111111",border:"none",color:"#ffffff",padding:"3px 10px",cursor:"pointer",fontFamily:F,fontSize:9,letterSpacing:2,borderRadius:2,textTransform:"uppercase"}}>Edit</button>
                      <button onClick={()=>deleteSkill(activeCat,activeLevel,sk.id)} style={{background:"#111111",border:"none",color:"#ffffff",padding:"3px 10px",cursor:"pointer",fontFamily:F,fontSize:9,letterSpacing:2,borderRadius:2,textTransform:"uppercase"}}>Remove</button>
                    </div>
                  </div>
                }
              </div>
            ))}
          </div>
          <Card style={{borderStyle:"dashed"}}>
            <Lbl>Add Skill to {skills[activeCat]?.label} — Level {activeLevel}</Lbl>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><Lbl>Skill Name</Lbl><input value={skillForm.name} onChange={e=>setSkillForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Kick Double Twist" style={inpS} onKeyDown={e=>e.key==="Enter"&&addSkill()}/></div>
              <div><Lbl>Description</Lbl><input value={skillForm.desc} onChange={e=>setSkillForm(p=>({...p,desc:e.target.value}))} placeholder="Brief description" style={inpS} onKeyDown={e=>e.key==="Enter"&&addSkill()}/></div>
            </div>
            <button onClick={addSkill} style={{width:"100%",background:"#111111",border:"none",color:"#ffffff",padding:"11px",cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:800,borderRadius:3,textTransform:"uppercase"}}>+ Add Skill</button>
          </Card>
        </>}

        {tab==="points"&&<>
          <Title>Point Values</Title>
          <Sub>Set default points per level, or upload a CSV</Sub>

          {/* CSV import for points */}
          <Card style={{marginBottom:16,background:T.s1}}>
            <div style={{fontFamily:FC,fontSize:13,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Import Point Values via CSV</div>
            <div style={{fontFamily:F,fontSize:11,color:T.muted,marginBottom:12,lineHeight:1.6}}>CSV columns: <strong>Level</strong> (1–7), <strong>Points</strong>. Two rows minimum.</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={()=>{
                const csv="Level,Points\n"+[1,2,3,4,5,6,7].map(lv=>`${lv},${editPts[lv]}`).join("\n");
                const blob=new Blob([csv],{type:"text/csv"});
                const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="point_values.csv";a.click();
              }} style={{background:"#111111",border:"none",color:"#ffffff",padding:"9px 14px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase"}}>↓ Download Template</button>
              <label style={{background:"#111111",border:"none",color:"#ffffff",padding:"9px 14px",cursor:"pointer",fontFamily:F,fontSize:10,letterSpacing:2,fontWeight:700,borderRadius:3,textTransform:"uppercase",display:"inline-block"}}>
                ↑ Upload CSV
                <input type="file" accept=".csv,text/csv" onChange={(e)=>{
                  const file=e.target.files[0];if(!file)return;
                  const reader=new FileReader();
                  reader.onload=(evt)=>{
                    try{
                      const lines=evt.target.result.split("\n").map(l=>l.trim()).filter(Boolean);
                      if(lines.length<2){notify("File needs header + at least one row");return;}
                      const headers=lines[0].split(",").map(h=>h.trim().toLowerCase());
                      const lvlIdx=headers.findIndex(h=>h.includes("level")||h.includes("lv"));
                      const ptsIdx=headers.findIndex(h=>h.includes("point")||h.includes("pts"));
                      if(lvlIdx===-1||ptsIdx===-1){notify("CSV must have Level and Points columns");return;}
                      const newPts={...editPts};
                      let updated=0;
                      lines.slice(1).forEach(line=>{
                        const cols=line.split(",").map(c=>c.trim().replace(/^"|"$/g,""));
                        const lv=parseInt(cols[lvlIdx]);
                        const pts=parseInt(cols[ptsIdx]);
                        if(lv>=1&&lv<=7&&pts>0){newPts[lv]=pts;updated++;}
                      });
                      setEditPts(newPts);
                      notify(`${updated} point values updated`,true);
                    }catch(err){notify("Could not parse CSV");}
                  };
                  reader.readAsText(file);e.target.value="";
                }} style={{display:"none"}}/>
              </label>
            </div>
          </Card>
          <Card>
            {[1,2,3,4,5,6,7].map(lv=>{
              const count=Object.values(skills).reduce((acc,c)=>acc+(c.levels[lv]?.length||0),0);
              return(
                <div key={lv} style={{display:"flex",alignItems:"center",gap:14,padding:"16px 0",borderBottom:lv<7?`1px solid ${T.border}`:"none"}}>
                  <div style={{fontFamily:FC,fontSize:20,fontWeight:800,width:74,flexShrink:0}}>Level {lv}</div>
                  <div style={{flex:1}}><div style={{fontFamily:F,fontSize:11,color:T.faint}}>{count} skills at this level</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <input type="number" min="1" value={editPts[lv]} onChange={e=>setEditPts(p=>({...p,[lv]:parseInt(e.target.value)||0}))} style={{...inpS,width:80,textAlign:"center",fontSize:16,fontWeight:700}}/>
                    <span style={{fontFamily:F,fontSize:12,color:T.muted,whiteSpace:"nowrap"}}>pts</span>
                  </div>
                </div>
              );
            })}
            <button onClick={()=>notify("Point values saved",true)} style={{marginTop:16,width:"100%",background:"#111111",border:"none",color:"#ffffff",padding:"13px",cursor:"pointer",fontFamily:F,fontSize:12,letterSpacing:4,fontWeight:800,borderRadius:3,textTransform:"uppercase"}}>Save Point Values</button>
          </Card>
        </>}

        {tab==="spirit"&&<>
          <Title>Spirit Awards</Title>
          <Sub>Platform-wide soft skill awards — available to all gyms</Sub>
          {SPIRIT_SOFT.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:T.s1,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{s.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:F,fontSize:14,fontWeight:600}}>{s.name}</div>
                <div style={{fontFamily:F,fontSize:10,color:T.faint}}>{s.desc}</div>
              </div>
              <div style={{fontFamily:FC,fontSize:18,fontWeight:800,color:T.black}}>+{s.pts} pts</div>
            </div>
          ))}
          <button onClick={()=>notify("Spirit award editor coming soon",true)} style={{width:"100%",background:"#111111",border:"none",color:"#ffffff",padding:13,cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:3,fontWeight:700,borderRadius:3,marginTop:12,textTransform:"uppercase"}}>+ Add Spirit Award</button>
        </>}

      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
const INIT_SHOP_ITEMS=[
  {id:"sh1",name:"Passport Sticker Pack",cost:50,icon:"✦",stock:99,desc:"Exclusive stickers",imageUrl:""},
  {id:"sh2",name:"Gym Water Bottle",cost:150,icon:"◈",stock:12,desc:"Custom branded bottle",imageUrl:""},
  {id:"sh3",name:"Custom Hair Bow",cost:200,icon:"◇",stock:8,desc:"Team colour hair bow",imageUrl:""},
  {id:"sh4",name:"Cheer Hoodie",cost:500,icon:"△",stock:5,desc:"Gym hoodie",imageUrl:""},
  {id:"sh5",name:"Personalized Bag Tag",cost:75,icon:"○",stock:20,desc:"Custom bag tag",imageUrl:""},
  {id:"sh6",name:"Gold Trophy",cost:1000,icon:"★",stock:3,desc:"Champion trophy",imageUrl:""},
];

export default function App(){
  const [currentUser,setCurrentUser]=useState(null);
  const [athletes,setAthletes]=useState(INIT_ATHLETES);
  const [shopItems,setShopItems]=useState(INIT_SHOP_ITEMS);
  const [orders,setOrders]=useState([]);
  if(!currentUser)return <LoginScreen onLogin={setCurrentUser}/>;
  if(currentUser.role==="platform_admin")return <PlatformAdmin user={currentUser} onLogout={()=>setCurrentUser(null)}/>;
  if(currentUser.role==="athlete"||currentUser.role==="parent")return <AthleteView user={currentUser} athletes={athletes} setAthletes={setAthletes} shopItems={shopItems} setShopItems={setShopItems} orders={orders} setOrders={setOrders} onLogout={()=>setCurrentUser(null)}/>;
  if(currentUser.role==="coach"||currentUser.role==="owner")return <CoachView user={currentUser} athletes={athletes} setAthletes={setAthletes} shopItems={shopItems} setShopItems={setShopItems} orders={orders} setOrders={setOrders} onLogout={()=>setCurrentUser(null)}/>;
  return null;
}

import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu, Moon, Sun, X, Plane, Heart, Map, Compass, CalendarDays, User } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function Layout(){
 const {user,theme,setTheme,toast}=useApp(); const [open,setOpen]=useState(false);
 const nav=[["/explore","Explore",Compass],["/map","Map",Map],["/planner","Planner",CalendarDays],...(user?[["/dashboard","Favourites",Heart],["/profile","Profile",User]]:[])];
 return <div className="app-shell">
  <header className="navbar"><Link to="/" className="brand"><span className="brand-mark"><Plane size={20}/></span>TravelMate</Link>
   <nav className={open?"nav-links open":"nav-links"}>{nav.map(([to,label,Icon])=><NavLink key={to} to={to} onClick={()=>setOpen(false)}><Icon size={17}/>{label}</NavLink>)}
    <div className="mobile-auth">{!user&&<><Link className="btn ghost" to="/login">Login</Link><Link className="btn primary" to="/register">Register</Link></>}</div>
   </nav>
   <div className="nav-actions"><button className="icon-btn" aria-label="Toggle theme" onClick={()=>setTheme(theme==="light"?"dark":"light")}>{theme==="light"?<Moon size={19}/>:<Sun size={19}/>}</button>
   {!user&&<><Link className="btn ghost desktop-only" to="/login">Login</Link><Link className="btn primary desktop-only" to="/register">Register</Link></>}
   <button className="menu-btn" onClick={()=>setOpen(!open)} aria-label="Menu">{open?<X/>:<Menu/>}</button></div>
  </header>
  <main><Outlet/></main>
  <footer><div><Link to="/" className="brand footer-brand"><Plane size={19}/>TravelMate</Link><p>Your simple companion for discovering, saving and planning memorable journeys.</p></div><div><h4>Explore</h4><Link to="/explore">Places</Link><Link to="/map">Navigation</Link><Link to="/planner">Trip planner</Link></div><div><h4>About</h4><a href="mailto:hello@travelmate.example">Contact</a><span>Travel tips</span><span>Privacy</span></div><div><h4>Follow</h4><span>Instagram</span><span>YouTube</span><span>Facebook</span></div><small>© 2026 TravelMate. Made for travel lovers.</small></footer>
  {toast&&<div className="toast">{toast}</div>}
 </div>
}
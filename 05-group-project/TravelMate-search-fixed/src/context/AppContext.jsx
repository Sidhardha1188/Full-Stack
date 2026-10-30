import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { read, write, uid } from "../utils/storage";

const AppContext = createContext(null);
const USERS="tm_users", SESSION="tm_session", FAVS="tm_favourites", TRIPS="tm_trips", THEME="tm_theme";

export function AppProvider({children}) {
  const [user,setUser]=useState(()=>read(SESSION,null));
  const [theme,setTheme]=useState(()=>localStorage.getItem(THEME)||"light");
  const [favourites,setFavourites]=useState(()=>read(FAVS,[]));
  const [trips,setTrips]=useState(()=>read(TRIPS,[]));
  const [toast,setToast]=useState("");

  useEffect(()=>{ document.documentElement.dataset.theme=theme; localStorage.setItem(THEME,theme); },[theme]);
  useEffect(()=>write(FAVS,favourites),[favourites]);
  useEffect(()=>write(TRIPS,trips),[trips]);
  const notify=(message)=>{setToast(message); setTimeout(()=>setToast(""),2600);};

  const register=(form)=>{
    const users=read(USERS,[]);
    if(users.some(u=>u.email.toLowerCase()===form.email.toLowerCase())) return {ok:false,message:"An account with this email already exists."};
    write(USERS,[...users,{id:uid(),name:form.name.trim(),email:form.email.trim(),password:form.password}]);
    return {ok:true};
  };
  const login=(email,password)=>{
    const found=read(USERS,[]).find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.password===password);
    if(!found) return false;
    const session={id:found.id,name:found.name,email:found.email}; write(SESSION,session); setUser(session); return true;
  };
  const logout=()=>{localStorage.removeItem(SESSION);setUser(null);notify("Logged out successfully.");};
  const addFavourite=(place)=>{
    if(favourites.some(f=>f.id===place.id)){notify("This place is already in favourites.");return;}
    setFavourites(v=>[...v,{...place,notes:place.notes||""}]);notify("Place saved to favourites!");
  };
  const saveFavourite=(place)=>{
    setFavourites(v=>v.some(f=>f.id===place.id)?v.map(f=>f.id===place.id?place:f):[...v,{...place,id:place.id||uid()}]);
    notify("Favourite saved successfully!");
  };
  const deleteFavourite=(id)=>{setFavourites(v=>v.filter(f=>f.id!==id));notify("Favourite deleted.");};
  const saveTrip=(trip)=>{setTrips(v=>[...v,{...trip,id:uid()}]);notify("Trip plan saved!");};
  const deleteTrip=(id)=>{setTrips(v=>v.filter(t=>t.id!==id));notify("Trip plan deleted.");};

  const value=useMemo(()=>({user,theme,setTheme,toast,register,login,logout,favourites,addFavourite,saveFavourite,deleteFavourite,trips,saveTrip,deleteTrip,notify}),[user,theme,toast,favourites,trips]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export const useApp=()=>useContext(AppContext);
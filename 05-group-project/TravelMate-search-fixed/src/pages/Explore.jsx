import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { places } from "../data/places";
import PlaceCard from "../components/PlaceCard";
const cats=["All","Beach","Mountains","Historical","Adventure","City"];
export default function Explore(){
 const [params]=useSearchParams(),[q,setQ]=useState(params.get("q")||""),[cat,setCat]=useState("All");
 const [remote,setRemote]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const local=useMemo(()=>places.filter(p=>(cat==="All"||p.category===cat)&&`${p.name} ${p.location} ${p.category} ${p.description}`.toLowerCase().includes(q.trim().toLowerCase())),[q,cat]);
 useEffect(()=>{const term=q.trim();if(term.length<3||local.length||cat!=="All"){setRemote([]);setError("");setLoading(false);return}
 const controller=new AbortController();const timer=setTimeout(async()=>{setLoading(true);setError("");try{const res=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&q=${encodeURIComponent(term)}`,{signal:controller.signal,headers:{Accept:"application/json"}});if(!res.ok)throw new Error();const data=await res.json();setRemote(data.map(item=>({id:`osm-${item.osm_type}-${item.osm_id}`,name:item.name||item.display_name.split(",")[0]||term,location:item.display_name,category:"City",description:`Explore ${item.display_name}. Save this location to your TravelMate favourites.`,image:"https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80",lat:item.lat,lon:item.lon})))}
 catch(e){if(e.name!=="AbortError")setError("Live destination search is unavailable. Check your internet connection and try again.")}finally{setLoading(false)}},500);
 return()=>{clearTimeout(timer);controller.abort()}},[q,cat,local.length]);
 const results=local.length?local:remote;
 return <section className="page section"><div className="page-title"><span className="eyebrow teal">FIND YOUR NEXT PLACE</span><h1>Explore destinations</h1><p>Search any destination or browse inspiring escapes and save the ones you love.</p></div><div className="explore-tools"><label className="search-field"><Search size={19}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search any destination or location"/></label><div className="filters">{cats.map(c=><button className={cat===c?"active":""} onClick={()=>setCat(c)} key={c}>{c}</button>)}</div></div>{loading&&<div className="search-status">Searching destinations…</div>}{error&&<div className="alert error">{error}</div>}{!loading&&results.length>0&&<div className="places-grid">{results.map(p=><PlaceCard key={p.id} place={p}/>)}</div>}{!loading&&!error&&!results.length&&<div className="empty"><MapPin size={34}/><h3>No places found</h3><p>{cat!=="All"?"Choose All to search locations worldwide.":"Type at least 3 characters or try another destination."}</p></div>}</section>
}
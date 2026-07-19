import type { MetadataRoute } from "next";
export default function manifest():MetadataRoute.Manifest{return{name:"FixMind AI",short_name:"FixMind",description:"AI-powered device diagnosis and professional repair booking.",start_url:"/",display:"standalone",background_color:"#ffffff",theme_color:"#2563eb",icons:[{src:"/favicon.svg",sizes:"any",type:"image/svg+xml"}]}}

import type { MetadataRoute } from "next";
export default function robots():MetadataRoute.Robots{return{rules:{userAgent:"*",allow:["/","/resources","/book"],disallow:["/admin","/dashboard","/technician","/api/"]},sitemap:"https://fixmind.ai/sitemap.xml"}}

import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({limit:"15mb"}));

const classify = (text="") => {
  const t=text.toLowerCase();
  if (/light|electric|wire|bijli|pole/.test(t)) return {
    title:"Streetlight / electrical issue", category:"Electricity", severity:"High",
    confidence:94, department:"Electricity Department", asset:"Pole #27",
    safe:false, price:"₹500–₹1,500"
  };
  if (/water|pipe|leak|pani|tap/.test(t)) return {
    title:"Water pipeline leakage", category:"Water", severity:"Medium",
    confidence:89, department:"Water Supply", asset:"Pipe #12",
    safe:true, price:"₹300–₹900"
  };
  if (/road|pothole|sadak/.test(t)) return {
    title:"Road damage / pothole", category:"Roads", severity:"Medium",
    confidence:91, department:"Public Works", asset:"Road Segment #08",
    safe:false, price:"₹1,000–₹4,000"
  };
  return {
    title:"General civic/service issue", category:"Other", severity:"Medium",
    confidence:72, department:"Local Administration", asset:"Unmapped",
    safe:true, price:"₹300–₹1,000"
  };
};

app.get("/api/health",(req,res)=>res.json({ok:true,service:"SAHAYAI API"}));
const parseModelJson = (raw) => {
  try {
    const cleaned = String(raw || "").replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const normalizeAIResult = (value) => {
  const fallback = classify(value?.description || value?.title || "");
  const severity = ["Low","Medium","High","Critical"].includes(value?.severity) ? value.severity : fallback.severity;
  const confidence = Math.max(1, Math.min(99, Number(value?.confidence) || fallback.confidence));
  return {
    title: String(value?.title || fallback.title),
    description: String(value?.description || "AI analyzed the submitted text/photo and extracted the likely civic issue."),
    category: String(value?.category || fallback.category),
    severity,
    confidence,
    department: String(value?.department || fallback.department),
    asset: String(value?.asset || fallback.asset),
    safe: typeof value?.safe === "boolean" ? value.safe : fallback.safe,
    price: String(value?.price || fallback.price),
    recommendedAction: String(value?.recommendedAction || "Verify on site and route to the responsible team."),
    evidence: Array.isArray(value?.evidence) ? value.evidence.slice(0,4).map(String) : [],
    aiMode: "live"
  };
};

async function liveAIAnalyze({text, imageData}) {
  if (!process.env.OPENAI_API_KEY) return null;
  if (imageData && !/^data:image\/(png|jpe?g|webp);base64,/i.test(imageData)) {
    throw new Error("Unsupported image format. Use PNG, JPG or WebP.");
  }
  const content = [
    { type:"input_text", text: `You are the SAHAYAI AI Village Brain. Analyze a citizen civic/service report for an Indian village.\n\nCitizen description: ${text || "No text provided; inspect the image."}\n\nReturn ONLY valid JSON with these keys: title, description, category, severity, confidence, department, asset, safe, price, recommendedAction, evidence.\nRules: category must be one of Electricity, Water, Roads, Sanitation, Public Works, Local Administration, Other. severity must be Low, Medium, High, or Critical. confidence is an integer 1-99. department must be a plausible responsible government/service department. price is a rough INR range for repair/service, or "Not applicable" if uncertain. safe is false when the issue may involve electrical danger, structural danger, traffic danger, sewage/contamination, fire, or another hazard requiring professional inspection. evidence must contain short visual/text observations, not invented facts. Do not claim exact location unless provided.` }
  ];
  if (imageData) content.push({ type:"input_image", image_url:imageData, detail:"high" });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.OPENAI_API_KEY}`},
    body:JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      input:[{role:"user",content}],
      max_output_tokens:700
    })
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI API ${response.status}: ${detail.slice(0,300)}`);
  }
  const data = await response.json();
  const parsed = parseModelJson(data.output_text);
  if (!parsed) throw new Error("AI returned an unreadable result.");
  return normalizeAIResult(parsed);
}

app.get("/api/ai/status",(req,res)=>res.json({configured:Boolean(process.env.OPENAI_API_KEY),model:process.env.OPENAI_MODEL||"gpt-5.6-luna"}));

app.post("/api/ai/analyze", async (req,res)=>{
  const {text="",hasImage=false,imageData=null}=req.body||{};
  try {
    const live = await liveAIAnalyze({text, imageData: hasImage ? imageData : null});
    if (live) return res.json(live);
  } catch (error) {
    console.error("Live AI analysis failed:", error.message);
    // Keep the demo usable even when the API is unavailable.
  }
  const result=classify(text);
  if(hasImage && result.confidence<85) result.confidence+=8;
  res.json({...result, description:"Demo analysis generated from the report text and image presence. Configure OPENAI_API_KEY for live multimodal AI analysis.", recommendedAction:result.safe?"Verify the issue and route it to the responsible team.":"Do not attempt unsafe repair; arrange professional inspection.", evidence:hasImage?["Citizen photo attached for review"]:["Citizen text report received"], aiMode:"demo"});
});
app.post("/api/incidents",(req,res)=>{
  res.status(201).json({ok:true,id:"INC-"+Math.floor(1000+Math.random()*8999),receivedAt:new Date().toISOString()});
});
app.post("/api/bookings",(req,res)=>res.status(201).json({ok:true,bookingId:"BOOK-"+Math.floor(1000+Math.random()*8999),status:"Confirmed",createdAt:new Date().toISOString()}));
app.post("/api/jobs/:id/accept",(req,res)=>res.json({ok:true,jobId:req.params.id,status:"Accepted"}));
app.post("/api/reports/:id/status",(req,res)=>res.json({ok:true,id:req.params.id,status:req.body.status}));
app.get("/api/workers",(req,res)=>res.json([
  {id:"W-01",name:"Raj Kumar",skill:"Electrician",rating:4.8,jobs:182,distance:1.8,available:true,price:"₹350–₹650"},
  {id:"W-02",name:"Amit Sharma",skill:"Plumber",rating:4.7,jobs:126,distance:2.4,available:true,price:"₹300–₹700"},
  {id:"W-03",name:"Suresh Pal",skill:"Mason",rating:4.9,jobs:203,distance:3.1,available:false,price:"₹500–₹1,200"}
]));

app.listen(4000,()=>console.log("SAHAYAI API running on http://localhost:4000"));

import React, { useState } from "react";
import "./App.css";

export default function App() {

const [file,setFile]=useState(null)
const [data,setData]=useState(null)
const [loading,setLoading]=useState(false)

const analyze=async()=>{

if(!file){
alert("Upload file first")
return
}

const formData=new FormData()
formData.append("file",file)

setLoading(true)

try{

const res=await fetch("http://localhost:8000/analyze",{
method:"POST",
body:formData
})

const result=await res.json()
setData(result)

}catch(e){
alert("Backend not connected")
}

setLoading(false)
}

return(

<div className="app">

<div className="sidebar">
<h2>NyaayAI</h2>
<p>Legal AI Dashboard</p>
</div>

<div className="main">

<h1>Legal Notice Analyzer</h1>

<div className="uploadBox">

<input type="file"
onChange={(e)=>setFile(e.target.files[0])}
/>

<button onClick={analyze}>
Analyze
</button>

</div>

{loading && <h3>Analyzing document...</h3>}

{data && (

<div className="grid">

<div className="card">
<h3>Risk Level</h3>
<p>{data.risk_level}</p>
</div>

<div className="card">
<h3>Simplified</h3>
<p>{data.simplified}</p>
</div>

<div className="card">
<h3>AI Reply</h3>
<p>{data.reply}</p>
</div>

</div>

)}

</div>

</div>

)

}
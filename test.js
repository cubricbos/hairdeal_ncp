const https = require("https");
const url = "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDsgee1bsGuyzdLt-1u58Tt2rWt_Zp0eLU";
https.get(url, (res) => {
  let data = "";
  res.on("data", (chunk) => { data += chunk; });
  res.on("end", () => {
    let parsed = JSON.parse(data);
    if(parsed.models) {
      console.log(parsed.models.map(m => m.name).join("\n"));
    } else {
      console.log(data);
    }
  });
});

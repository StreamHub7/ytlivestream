const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

async function hlsUrl(videoUrl) {
    try {
        const response = await fetch(videoUrl);
        const text = await response.text();
        
        const hlsManifestMatch = text.match(/"hlsManifestUrl":"([^"]+\.m3u8)"/);

        if (hlsManifestMatch && hlsManifestMatch[1]) {
            return hlsManifestMatch[1];
        }
    } catch (error) {
        console.log(error);
    }
}


app.get('/', (req, res) => {
    res.send('Youtube live streaming SERVER!');
})

function convertToIST(date) {
  // Create a new DateTimeFormat object with timeZone set to 'Asia/Kolkata' (IST)
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false, // Use 24-hour format
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Format the provided date to IST
  const istDate = istFormatter.format(date);
  return istDate;
}

async function extractStartTimestamp(videoUrl) {
  try {
      const response = await fetch(videoUrl);
      const text = await response.text();
      const timestampMatch = text.match(/"startTimestamp":"([^"]+)"/);

      if (timestampMatch && timestampMatch[1]) {
          const startTimestamp = timestampMatch[1];
          return startTimestamp;
      }
  } catch (error) {
      console.log(error);
  }
}

app.get('/stream', async (req, res) => {
    const channelName = req.query.ch;
    const now = new Date(convertToIST(new Date()));
    if(channelName === "NirankariOrgUpdates"){
        try{
            const steamUrl = await hlsUrl(`https://www.youtube.com/c/${channelName}/live`);
            if(steamUrl){
                res.redirect(streamUrl);
            }
            else{
                const startTimestamp = await extractStartTimestamp(`https://www.youtube.com/c/${channelName}/live`);
                if(startTimestamp){
                    const start =  new Date(startTimestamp);
                    if(now.getDate() === start.getDate()){
                        if(now.getHours() < start.getHours()){
                          console.log("Program is Today!");
                          res.redirect("https://pub-37350e103d1f4ccab85d6164397ea96d.r2.dev/snm/begain/output.m3u8");
                        }
                        else{
                          if(start.getMinutes() - now.getMinutes() < 6){
                            res.redirect("https://pub-37350e103d1f4ccab85d6164397ea96d.r2.dev/snm/just-start/output.m3u8");
                          }
                        }
                      }
                  }
                  else {
                    if(now.getDay()%2 !== 0) res.redirect("https://pub-37350e103d1f4ccab85d6164397ea96d.r2.dev/master.m3u8");
                    else res.redirect("https://pub-37350e103d1f4ccab85d6164397ea96d.r2.dev/index.m3u8");
                  }
            }
                
        }
        catch(e){
            console.log((e));
        }
    }
    else{
        try{
            const steamUrl = await hlsUrl(`https://www.youtube.com/c/${channelName}/live`);
            if(steamUrl){
                res.redirect(streamUrl);
            }
        }
        catch(e){
            console.log(e);
        }
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

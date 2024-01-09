const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

async function hlsUrl(videoUrl) {
    return await fetch(videoUrl)
      .then(async (r) => await r.text())
      .then((r) => r.match(/(?<=hlsManifestUrl":").*\.m3u8/g)[0]);
}

app.get('/', (req, res) => {
    res.send('Youtube live streaming SERVER!');
})

async function ytUrl(channelId) {
    const apiKey = process.env.API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
    try{
        const response = await fetch(url);
        const data = await response.json();
        return data.items[0].id.videoId;
    }
    catch(e){
        console.log(e);
    }
}

app.get('/stream', async (req, res) => {
    const channelId = req.query.id;
    const channelName = req.query.ch;
    if(channelId){
        try{
            const videoId = await ytUrl(channelId);
            console.log(videoId);
            const steamUrl = await hlsUrl(`https://www.youtube.com/watch?v=${videoId}`);
            res.status(200).redirect(steamUrl);
        }
        catch(e){
            res.json({
                error: e
            });
        }
    }
    else{
        try{
            const steamUrl = await hlsUrl(`https://www.youtube.com/c/${channelName}/live`);
            res.status(200).redirect(steamUrl);
        }
        catch(e){
            res.json({
                error: e
            });
        }
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());



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
            res.status(302).redirect("https://pub-c60f024d92cf4c0eb7d6f1f74d9c8a01.r2.dev/error-stream/output.m3u8");
        }
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

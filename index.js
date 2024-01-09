const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

async function hlsUrl(ytUrl) {
    return await fetch(ytUrl)
      .then(async (r) => await r.text())
      .then((r) => r.match(/(?<=hlsManifestUrl":").*\.m3u8/g)[0]);
}

app.get('/', (req, res) => {
    res.send('Youtube live streaming SERVER!');
})

app.get('/stream', async (req, res) => {
    const id = req.query.id;
    const channel = req.query.channel;
    try{
        const response = await fetch(`https://www.youtube.com/watch?v=${id}`);
        if(response.status === 200){
            const hlsStreamUrl = await hlsUrl(`https://www.youtube.com/watch?v=${id}`);
            res.status(200).redirect(hlsStreamUrl);
        }
        else{
            const hlsStreamUrl = await hlsUrl(`https://www.youtube.com/c/${channel}/live`);
            res.status(200).redirect(hlsStreamUrl);
        }
    }
    catch(e){
        res.json({
            error: e
        });
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

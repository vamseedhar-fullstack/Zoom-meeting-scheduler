require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3004;
const bodyParser = require('body-parser');
const cors = require('cors');
const token = process.env.TOKEN;

app.use(cors());
app.use(bodyParser.json());


app.use(cors({
    origin: 'https://creative.thoughts.ashishphotography.co.in',
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
  }));
  app.use(bodyParser.json());


async function getMeetings() {
    try {
        const response = await axios.get('https://api.zoom.us/v2/users/me/meetings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error', error);
        throw error;
    }
}

// Route to handle GET request for fetching meetings
app.get('/meetings', async (req, res) => {
    try {
        const meetings = await getMeetings();
        res.json(meetings);
        console.log("meetings",meetings)
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});



// Function to create a meeting using Zoom API
async function createMeeting(topic, start_time, type, duration, timezone, agenda) {
    try {
        const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
            topic,
            type,
            start_time,
            duration,
            timezone,
            agenda,
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: false,
                mute_upon_entry: true,
                watermark: false,
                use_pmi: false,
                approval_type: 0,
                audio: 'both',
                auto_recording: 'none'
            }
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        const body = response.data;
        return body;
    } catch (error) {
        console.error('Error', error);
        throw error; // Throw the error to handle it in the calling function or route handler
    }
}

// Route to handle POST request for creating a meeting
app.post('/createMeeting', async (req, res) => {
    const { start_time, topic, agenda, duration  } = req.body;
    try {
        const meeting = await createMeeting(topic, start_time, "2", duration, 'UTC', agenda);
        res.json(meeting);
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
});

// (async()=>{
//     console.log(await createMeeting('vamsee','2024-03-25T10:00:00',2,45,'UTC','yatayati'));
//     console.log(await getMeetings());
// })()


app.get('/zoom',async (req,res)=>{
    const code = req.query.code;

    try{
        const response = await axios.post('https://zoom.us/oauth/token',null,{
            params:{
                grant_type: 'authorization_code',
                code:code,
                redirect_uri: process.env.REDIRECT_URI
            },
            headers:{
                'Authorization':`Basic ${Buffer.from(`${process.env.ZOOM_API_KEY}:${process.env.ZOOM_API_SECRET}`).toString('base64')}`
            }
        });
        res.send(response.data.access_token);    
    }catch(error){
        console.error('Error',error);
        res.send('Error');
    }
    
});

app.get('/auth/zoom',(req,res)=>{
    const clientId = process.env.ZOOM_API_KEY;
    const redirect_uri = encodeURIComponent(process.env.REDIRECT_URI);
    const responseType = 'code';
    const authorizationUrl = `https://zoom.us/oauth/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirect_uri}`;
    res.redirect(authorizationUrl);
});

app.get('/callback',async(req,res)=>{
    const code = req.query.code;
    if(!code){
        return res.status(400).send('No code provided');
    }
    try{
        const response = await axios.post('https://zoom.us/oauth/token',null,{params:{
            grant_type:'authorization_code',
            code,
            redirect_uri:process.env.REDIRECT_URI
        },headers:{
            'Authorization':`Basic ${Buffer.from(`${process.env.ZOOM_API_KEY}:${process.env.ZOOM_API_SECRET}`).toString('base64')}`,
            'Content-Type':'application/x-www-form-urlencoded'
        }});
        res.json(response.data);
    }catch(error){
        console.error('Error:',error);
        res.send('Error obtaining token');
    }
})

app.get('/refreshToken',async(req,res)=>{
    try{
        const refresh_token = req.query.refreshToken;

        const response = await axios.post('https://zoom.us/oauth/token',null,{
            params:{
                grant_type:'refresh_token',
                refresh_token
            },
            headers:{
                'Authorization':`Basic ${Buffer.from(`${process.env.ZOOM_API_KEY}:${process.env.ZOOM_API_SECRET}`).toString('base64')}`,
                'Content-Type':'application/x-www-form-urlencoded'
            }
        });

        res.json(response.data);

    }catch(error){
        console.error('Error',error);
        res.send('Error refreshing token')
    }
})

app.listen(port,()=>{
    console.log('Server running',port);
})
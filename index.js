const axios = require('axios');
const camelCase = require('camelcase');
const Twitter = require('twitter-lite');

const client = new Twitter({
    subdomain: "api",
    consumer_key: process.env.CONSUMER_KEY, // from Twitter.
    consumer_secret: process.env.CONSUMER_SECRET, // from Twitter.
    access_token_key: process.env.ACCESS_TOKEN_KEY, // from your User (oauth_token)
    access_token_secret: process.env.ACCESS_TOKEN_SECRET // from your User (oauth_token_secret)
});

const formatHashtag = (text) => {
    return camelCase(text.replace(/[^a-zA-Z0-9]/g, ''));
};

module.exports = (req, res) => { // Zeit boilerplate
    axios.get('https://api.publicapis.org/entries?auth=null')
    .then((response) => {
        if(!response.data.entries.length){
            throw new Error('No APIs found');
        }

        // Build tweet content from random result
        const api = response.data.entries[Math.floor(Math.random() * response.data.entries.length)];
        const isDescriptionShort = api.Description.split(' ').length <= 2;
        let tweet = `📡 Random Open API 📡\n\n${api.API}`; // .API is the name of the API

        // If the description is too short, it's shown as a hashtag later instead
        if(!isDescriptionShort){
            tweet += `: ${api.Description}`;
        }

        tweet += ` ${api.Link} `;

        const tags = ['openAPI', 'api', formatHashtag(api.Category)];
        if(isDescriptionShort){
            tags.push(formatHashtag(api.Description));
        }

        tweet += tags.map(tag => `#${tag}`).join(' ');
        
        // Tweet, tweet!
        client.post("statuses/update", { status: tweet })
        .then(() => res.end('Success!'))
        .catch((err) => {
            res.end(`Error: ${err.message}\n\n${err.stack}`);
        });
    })
    .catch((error) => {
        res.end(`Error: ${error.message}\n\n${error.stack}`);
    });
};
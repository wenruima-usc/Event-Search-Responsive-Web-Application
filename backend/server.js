const express=require("express");
const cors= require("cors");
const fetch=require("node-fetch");
const bodyparser = require("body-parser");
const geohash=require('ngeohash');
const port=process.env.PORT || 8080;
const ticketmasterToken='lPouswuaXnRy2ZlNkflhOdi9iWQX80hD';
const undefined="undefined";
const app=express();
app.use(cors({origin:true,credentials:true}));
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
const path= __dirname +'/frontend/'
const mapSegmentId={"music":"KZFzniwnSyZfZ7v7nJ","sports":"KZFzniwnSyZfZ7v7nE","arts & theatre":"KZFzniwnSyZfZ7v7na",
              "film":"KZFzniwnSyZfZ7v7nn","miscellaneous":"KZFzniwnSyZfZ7v7n1"}
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId: '00391b3251e54db4901163bdf26d1cfe',
  clientSecret: 'a3647511509144b8a77e2be9458f2153',
  redirectUri: 'http://localhost:3000/callback'
});
app.use(express.static(path));
app.get('', (req, res)=>{
   res.sendFile(path+ 'index.html')
})
app.get('/autocomplete/:keyword?', async function(req,res){
    let key = req.params.keyword || '';
    let url=`https://app.ticketmaster.com/discovery/v2/suggest?apikey=${ticketmasterToken}&keyword=${key}`;
    let names=[];
    const response=await fetch(url)
        .then(res=>res.json())
        .catch(e=>console.log(e));
    if('_embedded' in response && 'attractions' in response['_embedded']){
        names=response['_embedded']['attractions'].map(attraction=>
            attraction.name
        );
    }
    res.json(names);
});

function sortByDateTime(first,second){
    let firstDateTime=first.date+first.time;
    let secondDateTime=second.date+second.time;
    if(firstDateTime< secondDateTime){
        return -1;
    }
    else if(firstDateTime>secondDateTime){
        return 1;
    }
    return 0;
}

app.get('/search/:keyword/:category/:distance/:lat/:lng',async function(req,res){
    let keyword=req.params.keyword;
    let category=req.params.category;
    let distance=req.params.distance;
    let lat=req.params.lat;
    let lng=req.params.lng;
    let precision=7;
    let geoPoint=geohash.encode(lat,lng,precision);
    let url="";
    let data=[];
    let defaultItemsNum=20;
    if (category.toLocaleLowerCase()=='default'){
        url=`https://app.ticketmaster.com/discovery/v2/events.json?apikey=${ticketmasterToken}&keyword=${keyword}&segmentId=&radius=${distance}&unit=miles&geoPoint=${geoPoint}`;
    }
    else{
        let segmentId=mapSegmentId[category.toLowerCase()];
        url=`https://app.ticketmaster.com/discovery/v2/events.json?apikey=${ticketmasterToken}&keyword=${keyword}&segmentId=${segmentId}&radius=${distance}&unit=miles&geoPoint=${geoPoint}`;
    }
    const response=await fetch(url)
        .then(res=>res.json())
        .catch(e=>console.log(e));
    if ('errors' in response || response['page']['totalElements']==0){
        res.json({'data':data});
        return;
    }
    let num= Math.min(defaultItemsNum,response['page']['totalElements']);
    let events=response['_embedded']['events'];
    for(let i=0;i<num;i++){
        eventItem=events[i];
        temp={
            id:"",
            date:"",
            time:"",
            icon:"",
            event:"",
            genre:"",
            venue:""
        };
        temp['id']=eventItem['id'];
        if('dates' in eventItem && 'start' in eventItem['dates']&& 'localDate' in eventItem['dates']['start']){
            temp['date']=eventItem['dates']['start']['localDate'];
        }
        if('dates' in eventItem && 'start' in eventItem['dates'] && 'localTime' in eventItem['dates']['start']){
            temp['time']=eventItem['dates']['start']['localTime'];
        }
        if ('images' in eventItem && eventItem['images'].length>0 && 'url' in eventItem['images'][0]){
            temp['icon']=eventItem['images'][0]['url'];
        }
        if ('name' in eventItem && eventItem['name'].toLowerCase()!=undefined){
            temp['event']=eventItem['name'];
        }
        if ('classifications' in eventItem && eventItem['classifications'].length>0 && 'segment' in eventItem['classifications'][0] && 'name' in eventItem['classifications'][0]['segment']
        && eventItem['classifications'][0]['segment']['name'].toLowerCase()!=undefined){
            temp['genre']=eventItem['classifications'][0]['segment']['name'];
        }
        if ('_embedded' in eventItem && 'venues' in eventItem['_embedded'] && eventItem['_embedded']['venues'].length>0 && 'name' in eventItem['_embedded']['venues'][0]
        && eventItem['_embedded']['venues'][0]['name'].toLowerCase()!=undefined){
            temp['venue']=eventItem['_embedded']['venues'][0]['name'];
        }
        data.push(temp);
    }
    data.sort(sortByDateTime);
    res.json({'data':data});
});

app.get('/venueDetail/:name',async (req,res)=>{
    const name=req.params.name;
    let url=`https://app.ticketmaster.com/discovery/v2/venues?apikey=${ticketmasterToken}&keyword=${name}`;
    const response=await fetch(url)
        .then(res=>res.json())
        .catch(e=>console.log(e));
    let addressList=[];
    let venue=response['_embedded']['venues'][0];
    if ('address' in venue && 'line1' in venue['address'] && venue['address']['line1'].toLowerCase()!=undefined){
        addressList.push(venue['address']['line1']);
    }
    if ('city' in venue && 'name' in venue['city'] && venue['city']['name'].toLowerCase()!=undefined){
        addressList.push(venue['city']['name']);
    }
    if ('state' in venue && 'name' in venue['state'] && venue['state']['name'].toLowerCase()!=undefined ){
        addressList.push(venue['state']['name']);
    }
    let address=addressList.join(', ');
    let phoneNum="";
    if ('boxOfficeInfo' in venue && 'phoneNumberDetail' in venue['boxOfficeInfo'] && venue['boxOfficeInfo']['phoneNumberDetail'].toLowerCase()!=undefined){
        phoneNum=venue['boxOfficeInfo']['phoneNumberDetail'];
    }
    let openHours="";
    if ('boxOfficeInfo' in venue && 'openHoursDetail' in venue['boxOfficeInfo'] && venue['boxOfficeInfo']['openHoursDetail'].toLowerCase()!=undefined){
        openHours=venue['boxOfficeInfo']['openHoursDetail'];
    }
    let generalRule="";
    if ('generalInfo' in venue && 'generalRule' in venue['generalInfo'] && venue['generalInfo']['generalRule'].toLowerCase()!=undefined){
        generalRule=venue['generalInfo']['generalRule'];
    }
    let childRule="";
    if ('generalInfo' in venue && 'childRule' in venue['generalInfo'] && venue['generalInfo']['childRule'].toLowerCase()!=undefined){
        childRule=venue['generalInfo']['childRule'];
    }
    let data={
        name:name,
        address:address,
        phoneNum: phoneNum,
        openHours:openHours,
        generalRule: generalRule,
        childRule:childRule
    };
    res.json({data:data});
});

app.get('/eventDetail/:id',async (req,res)=>{
    let id=req.params.id;
    let url=`https://app.ticketmaster.com/discovery/v2/events/${id}?apikey=${ticketmasterToken}`;
    const response= await fetch(url)
        .then(res=>res.json())
        .catch(e=>console.log(e));
    let date="";
    if ('dates' in response && 'start' in response['dates'] && 'localDate' in response['dates']['start']){
        date += response['dates']['start']['localDate'];
    }
    if ('dates' in response && 'start' in response['dates'] && 'localTime' in response['dates']['start']){
        date += ' '+response['dates']['start']['localTime'];
    }
    let artistsList=[];
    if('attractions' in response['_embedded']){
        for(let artist of response['_embedded']['attractions']){
            if('name' in artist && artist['name'].toLowerCase()!='undefined'){
                artistsList.push(artist['name']);
            }
        }
    }
    let artists=artistsList.join(' | ');
    let genresList=[];
    if('classifications' in response && response['classifications'].length > 0){
        let classification=response['classifications'][0];
        if('segment' in classification && 'name' in classification['segment'] && classification['segment']['name'].toLowerCase()!='undefined'){
            genresList.push(classification['segment']['name']);
        }
        if ('genre' in classification && 'name' in classification['genre'] && classification['genre']['name'].toLowerCase()!='undefined'){
            genresList.push(classification['genre']['name']);
        }
            
        if ('subGenre' in classification && 'name' in classification['subGenre'] && classification['subGenre']['name'].toLowerCase()!='undefined'){
            genresList.push(classification['subGenre']['name']);
        }

        if ('type' in classification && 'name' in classification['type'] && classification['type']['name'].toLowerCase()!='undefined'){
            genresList.push(classification['type']['name']);
        }

        if ('subType' in classification && 'name' in classification['subType'] && classification['subType']['name'].toLowerCase()!='undefined'){
            genresList.push(classification['subType']['name']);
        }
    }
    let genres=genresList.join(' | ');
    let priceRanges="";
    if ('priceRanges' in response && response['priceRanges'].length>0){
        if ('min' in response['priceRanges'][0]){
            priceRanges+=response['priceRanges'][0]['min'];
        }
        if('max' in response['priceRanges'][0]){
            priceRanges+=" - "+response['priceRanges'][0]['max'];
        }
    }
    let status="";
    if ('dates' in response && 'status' in response['dates'] && 'code' in response['dates']['status'] && response['dates']['status']['code'].toLowerCase()!=undefined){
        statusOri=response['dates']['status']['code'];
        switch(statusOri){
            case "onsale":
                status="On Sale";
                break;
            case "offsale":
                status="Off Sale";
                break;
            case "canceled":
                status="Canceled";
                break;
            case "postponed":
                status="Postponed";
                break;
            case "rescheduled":
                status="Rescheduled";
                break;
            default:
                break;
        }

    }
    let ticketUrl="";
    if ('url' in response){
        ticketUrl=response['url'];
    }
    let seatmapUrl="";
    if ('seatmap' in response && 'staticUrl' in response['seatmap']){
        seatmapUrl=response['seatmap']['staticUrl'];
    }
    let venue="";
    if ('_embedded' in response && 'venues' in response['_embedded'] && response['_embedded']['venues'].length > 0 && 'name' in response['_embedded']['venues'][0]
    && response['_embedded']['venues'][0]['name'].toLowerCase()!=undefined){
        venue=response['_embedded']['venues'][0]['name'];
    }
    let name=""
    if ('name' in response){
        name=response['name'];
    }
    let data={
        id:id,
        name: name,
        date: date,
        artist: artists,
        venue: venue,
        genre:genres,
        priceRange: priceRanges,
        status:status,
        buyTicketAt:ticketUrl,
        seatmap: seatmapUrl
    };
    res.json({'data':data});
});

function formatFollowers(followers){
    return followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
async function getArtistTabResponse(artistData){
    if(artistData['body']['artists']['items'].length==0){
        return {
            name: "",
        artistImg:"",
        popularity:0,
        followers:"",
        spotifyUrl:"",
        albums:[]
        }
    }
    const artist=artistData['body']['artists']['items'][0];
    let name=artist['name'];
    let artistImg=artist['images'][0]['url'];
    let popularity=artist['popularity'];
    let followers=formatFollowers(artist['followers']['total']);
    let spotifyUrl=artist['external_urls']['spotify'];
    const albumData=await spotifyApi.getArtistAlbums(artist['id'] ,{ limit: 3});
    let albums=[];
    for(j=0;j<Math.min(albumData['body']['items'].length,3);j++){
        albums.push(albumData['body']['items'][j]['images'][0]['url']);
    }
    let data={
        name: name,
        artistImg:artistImg,
        popularity:popularity,
        followers:followers,
        spotifyUrl:spotifyUrl,
        albums:albums
    };
    return data;
}

app.get('/searchArtist/:name',async (req,res)=>{
    const name=req.params.name;
    try{
        const artistData=await spotifyApi.searchArtists(name);
        const response=await getArtistTabResponse(artistData);
        res.json({data:response});
    } catch(e){
        if(e.statusCode==401){
            try{
                const data=await spotifyApi.clientCredentialsGrant();
                spotifyApi.setAccessToken(data.body.access_token);
                const artistData=await spotifyApi.searchArtists(name);
                const response=await getArtistTabResponse(artistData);
                res.json({data:response});
            } catch(e){
                res.json({message:e.message});
            }
        }
        else{
            res.json({message:e.message});
        }
    }
});


app.get("callback",async (req,res)=>{
    const code=req.query.code;
    try{
        const data = await spotifyApi.authorizationCodeGrant(code);
        spotifyApi.setAccessToken(data.body.access_token);
        spotifyApi.setRefreshToken(data.body.refresh_token);
    } catch (e) {
        res.json({message:e.message});
    }
});
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
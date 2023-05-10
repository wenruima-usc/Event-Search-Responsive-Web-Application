import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { throws } from 'assert';
import { Subscription } from 'rxjs';
import { EventDetail } from 'src/app/modules/eventdetail.module';
import { TableItem, TableItems } from 'src/app/modules/tableitem.module';
import { TicketmasterService } from 'src/app/services/ticketmaster.service';
import { ArtistDetail } from 'src/app/modules/artistdetail.module';
import { lastValueFrom } from 'rxjs';
import { VenueDetail } from 'src/app/modules/venuedetail.module';
import { GetgeoService } from 'src/app/services/getgeo.service';
import { FavoriteService } from 'src/app/services/favorite.service';

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent implements OnInit,OnDestroy {
  isFavorite=false;
  mapOptions: google.maps.MapOptions={};
  marker = {position:{lng:0,lat:0}};
  width="auto";
  height="400px";
 paragraphText="";
  isChildRuleExpanded=false;
  isGeneralRuleExpanded=false;
  isOpenHourExpanded=false;
  venueDetail:VenueDetail={
    name:"",
    address:"",
    phoneNum:"",
    openHours:"",
    generalRule:"",
    childRule:""  
  }
  isMusicArtist:boolean=false;
  eventDetail: EventDetail={
    id:"",
    name: "",
    date: "",
    artist: "",
    venue: "",
    genre: "",
    priceRange: "",
    status: "",
    buyTicketAt: "",
    seatmap: "" 
  };
  artistDetails:Array<ArtistDetail>=[];
  tableItems: TableItems= {display: false,showResult: false,isEmpty:false,data:[]};
  private tableItemsSub:Subscription|undefined;
  showResult:boolean=false;
  constructor(private ticketmasterService: TicketmasterService, private geoService: GetgeoService,private favoriteService:FavoriteService) { }

  ngOnInit(): void {
    this.tableItemsSub=this.ticketmasterService.getTableItems().subscribe((tableItems:TableItems)=>{
      this.tableItems=tableItems;
      this.showResult=true;
    });
  }

  isMusicRelated(genre:string):boolean{
    if(genre==""){
      return false;
    }
    let genres=genre.replace(' ','').split('|');
    if(genres[0].toLowerCase()=="music"){
      return true;
    }
    return false;
  }

  checkFavorite(id:string):void{
    let value=localStorage.getItem(id);
    if(value==null){
      this.isFavorite=false;
    }
    else{
      this.isFavorite=true;
    }
  }

  getDetailCard(item:TableItem):void{
    this.tableItems.showResult=false;
    this.ticketmasterService.getDetailsCard(item.id).subscribe((response:EventDetail)=>{
      this.eventDetail=response;
      this.checkFavorite(this.eventDetail.id);
      if(this.eventDetail.artist!="" && this.isMusicRelated(this.eventDetail.genre)){
        this.isMusicArtist=true;
        let artists=this.eventDetail.artist.replace(' ','').split('|');
        this.getArtistDetail(artists);
      }
      else{
        this.isMusicArtist=false;
      }
      this.getVenueDetail(this.eventDetail.venue);
    });
  }

  getVenueGeo(address:string):void{
    this.geoService.getGeo(address).subscribe((response:{lat:number,lng:number})=>{
      this.mapOptions={...this.mapOptions ,center:{lat:response.lat,lng:response.lng}};
      this.marker={position:{lat:response.lat,lng:response.lng}};
    });
  }

  getVenueDetail(name:string):void{
    this.ticketmasterService.getVenueDetail(name).subscribe((response:VenueDetail)=>{
      this.venueDetail=response;
      this.getVenueGeo(this.venueDetail.address);
    });

  }
  getArtistDetail(artists:Array<string>):void{
    this.artistDetails=[];
    const promises: Promise<ArtistDetail>[]=[];
    for(let artist of artists){
      promises.push(lastValueFrom(this.ticketmasterService.getArtistDetail(artist)));
    }
    Promise.all(promises)
      .then((responses: ArtistDetail[]) => {
          this.artistDetails = responses.filter((response)=>{ 
            return response.name!="" || response.artistImg!="" || response.followers!="" || response.popularity!=0 || response.spotifyUrl!="" || response.albums!=[]
      });
      })
      .catch((error) => {
         console.error(error);
      });
  }


  clickFavorite():void{
    this.isFavorite=!this.isFavorite;
    if(this.isFavorite){     
      let favorite={id:this.eventDetail.id,date: this.eventDetail.date,event: this.eventDetail.name,
      category:this.eventDetail.genre,venue:this.eventDetail.venue};
      alert("Event Added to Favorites!");
      this.favoriteService.addToFavorite(favorite);
    }
    else{
      alert("Removed from Favorites!");
      this.favoriteService.deleteFavorite(this.eventDetail.id);
    }
  }


  showResultTable():void{
    this.tableItems.showResult=true;
  }

  shareOnTwitter():void{
    const tweetText=`Check out ${this.eventDetail.name} on Ticketmaster: ${this.eventDetail.buyTicketAt}`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  }

  shareOnFacebook():void{
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${this.eventDetail.buyTicketAt}`;
    window.open(facebookUrl, '_blank');
  }

  ngOnDestroy(): void {
    this.tableItemsSub?.unsubscribe();
  }

}

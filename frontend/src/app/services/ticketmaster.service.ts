import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableItem, TableItems } from '../modules/tableitem.module';
import { FormData } from '../modules/form.module';
import {map} from 'rxjs/operators';
import { response } from 'express';
import { baseUrl } from './constants';
import { EventDetail } from '../modules/eventdetail.module';
import { ArtistDetail } from '../modules/artistdetail.module';
import { VenueDetail } from '../modules/venuedetail.module';
@Injectable({
  providedIn: 'root'
})
export class TicketmasterService {
  private tableItems =new BehaviorSubject<TableItems>({display: false,showResult:false,isEmpty:false,data:[]});

  setTableItems(newTableItems: TableItems):void{
    this.tableItems.next(newTableItems);
  }

  getTableItems(): Observable<TableItems>{
    return this.tableItems.asObservable();
  }


  constructor(private http: HttpClient) { }

  getSearchResult(form: FormData):void{
     this.http.get(`${baseUrl}/search/${form.keyword}/${form.category}/${form.distance}/${form.lat}/${form.lng}`)
     .subscribe((response:any)=>{
       const isEmpty=response.data.length ==0;
       const res={display:true, showResult: true,isEmpty:isEmpty,data:response.data};
       this.setTableItems(res);
     });
  }

  getDetailsCard(id:string):Observable<EventDetail>{
    return this.http.get(`${baseUrl}/eventDetail/${id}`)
    .pipe(
      map((response:any)=>{
        const detailCard:EventDetail=response.data;
        return detailCard;
      })
    )
  }

  getArtistDetail(name:string):Observable<ArtistDetail>{
    return this.http.get(`${baseUrl}/searchArtist/${name}`)
    .pipe(
      map((response:any)=>{
        const artistDetail:ArtistDetail=response.data;
        return artistDetail;
      })
    )
  }

  getVenueDetail(name:string):Observable<VenueDetail>{
    return this.http.get(`${baseUrl}/venueDetail/${name}`)
    .pipe(
      map((response:any)=>{
        const venueDetail:VenueDetail=response.data;
        return venueDetail;
      })
    )
  }
  
  clearSearchResult(){
    const tableItems={display: false,showResult:false, isEmpty:false, data: []};
    this.setTableItems(tableItems);

  }
}

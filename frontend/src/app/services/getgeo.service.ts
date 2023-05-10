import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { response } from 'express';
@Injectable({
  providedIn: 'root'
})
export class GetgeoService {
  private token="556a37763de18b";
  private googleToken="AIzaSyBon3YcFzZlcOEqA_1VX8gq9i5Iy7lb-io";
  private autoBaseURL="https://ipinfo.io/?";
  private googleBaseURL="https://maps.googleapis.com/maps/api/geocode/json?"

  constructor(private http:HttpClient) { }

  getAutoGeo(){
    return this.http.get(`${this.autoBaseURL}token=${this.token}`)
    .pipe(
      map((response:any)=>{
        const location=response['loc'].split(',');
        const selectedFields={
          lat: location[0],
          lng: location[1]
        };
        return selectedFields;
      })
    );
  }

  getGeo(location:string){
    return this.http.get(`${this.googleBaseURL}address=${location}&key=${this.googleToken}`)
    .pipe(
      map((response:any)=>{
        const selectedFields={
          lat: response.results[0].geometry.location.lat,
          lng: response.results[0].geometry.location.lng
        };
        return selectedFields;
      })
    );
  }
}

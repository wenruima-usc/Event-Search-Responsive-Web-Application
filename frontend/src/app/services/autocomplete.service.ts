import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from './constants';
@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {
  

  constructor(private http:HttpClient) { }

  getData(keyword:string){
    return this.http.get<Array<string>>(`${baseUrl}/autocomplete/${keyword}`);
  }
}

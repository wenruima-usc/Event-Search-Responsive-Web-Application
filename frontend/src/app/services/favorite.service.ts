import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Favorite } from '../modules/favorite.module';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favorites=new BehaviorSubject<Favorite[]>([]);

  setFavorites(newFavorites:Favorite[]):void{
    this.favorites.next(newFavorites);
  }
  
  getFavorites(): Observable<Favorite[]>{
    return this.favorites.asObservable();
  }

  constructor() {
    this.updateFavorites();
   }

  updateFavorites():void{
    let favoriteItems=[];
    let keyOrderString=localStorage.getItem("keyOrder");
    if(keyOrderString!=null){
      let keyOrder:string[]=JSON.parse(keyOrderString);
      for(let key of keyOrder){
        let valueString=localStorage.getItem(key);
        if(valueString!=null){
          let favorite:Favorite=JSON.parse(valueString);
          favoriteItems.push(favorite);
        }
      }
    }
    this.setFavorites(favoriteItems);
  }

  addToFavorite(favorite:Favorite):void{
    let keyOrderString=localStorage.getItem("keyOrder");
    let keyOrder=[];
    if(keyOrderString!=null){  
      keyOrder=JSON.parse(keyOrderString);
    }
    keyOrder.push(favorite.id);
    localStorage.setItem("keyOrder",JSON.stringify(keyOrder));
    localStorage.setItem(favorite.id,JSON.stringify(favorite));
    this.updateFavorites();
  
  }

  deleteFavorite(id:string):void{
    let keyOrderString=localStorage.getItem("keyOrder");
    if(keyOrderString!=null){
      let keyOrder:string[]=JSON.parse(keyOrderString);
      let newKeyOrder=keyOrder.filter(key=>{
        return key!=id;
      });
      localStorage.setItem("keyOrder",JSON.stringify(newKeyOrder));
      localStorage.removeItem(id);
    }
    this.updateFavorites();
  }
}

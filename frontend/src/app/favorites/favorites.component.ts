import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Favorite } from '../modules/favorite.module';
import { FavoriteService } from '../services/favorite.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: Favorite[]=[];
  private favoriteSub:Subscription|undefined;

  constructor(private favoriteService:FavoriteService) { 
  }

  ngOnInit(): void {
    this.favoriteSub=this.favoriteService.getFavorites().subscribe((favorites:Favorite[])=>{
      this.favorites=favorites;
    });
  }

  moveToTrash(favorite:Favorite):void{
    alert("Removed from Favorites!");
    this.favoriteService.deleteFavorite(favorite.id);
  }

  ngOnDestroy():void{
    this.favoriteSub?.unsubscribe();
  }

}

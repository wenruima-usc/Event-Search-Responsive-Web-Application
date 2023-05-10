import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isActiveSearch=true;
  isActiveFav=false;
  constructor() { }

  ngOnInit(): void {
  }
  addClass():void{
    this.isActiveFav=!this.isActiveFav;
    this.isActiveSearch=!this.isActiveSearch;
  }

}

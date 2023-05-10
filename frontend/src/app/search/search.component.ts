import { Component, OnInit } from '@angular/core';
import { TicketmasterService } from '../services/ticketmaster.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  constructor(private ticketmasterService: TicketmasterService) { 
  }

  ngOnInit(): void {
    this.ticketmasterService.clearSearchResult();
  }

}

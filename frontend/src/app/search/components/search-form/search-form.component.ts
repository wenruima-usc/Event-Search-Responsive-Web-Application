import { Component, OnInit, Output } from '@angular/core';
import { Form, FormControl, NgForm } from '@angular/forms';
import { AutocompleteService } from 'src/app/services/autocomplete.service';
import { EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GetgeoService } from 'src/app/services/getgeo.service';
import {FormData} from 'src/app/modules/form.module';
import { AbstractControl } from '@angular/forms';
import { throws } from 'assert';
import { TicketmasterService } from 'src/app/services/ticketmaster.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { delay } from 'rxjs/operators';
@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss']
})
export class SearchFormComponent implements OnInit {
  isLoading=false;
  options:string[]=[];
  searchForm: FormGroup;
  isChecked:boolean=false;
  form: FormData={keyword: '',distance: 10,category: 'Default',lat: '',lng: ''};

  constructor(private autocompleteService: AutocompleteService,private getGeoService: GetgeoService,private ticketmasterService: TicketmasterService) {
 
  this.searchForm = new FormGroup({
    keyword: new FormControl(),
    distance: new FormControl('10'),
    category: new FormControl('Default',Validators.required),
    location: new FormControl(''),
    auto: new FormControl()
  });
    }

  onInputChange(event:Event):void {
    const inputElement = event.target as HTMLInputElement;
    if(inputElement!=null){
      const value=inputElement.value.trim();
      if(value==""){
        return;
      }
      this.isLoading=true;
      this.autocompleteService.getData(value)
      .subscribe((response) => {
        this.isLoading=false;
        this.options=response;
      },
      (error)=>{
        console.log("Error",error);
        this.isLoading=false;
      });
    }
  
  }
  
  onCheckboxChange(event:Event):void{
    this.isChecked=!this.isChecked;
    if(this.isChecked){
      this.searchForm.get("location")?.disable();
      this.searchForm.get("location")?.setValue("");
    }
    else{
      this.searchForm.get("location")?.enable();
    }

  }
  onSubmit(): void{

    this.form.keyword=this.searchForm.get('keyword')?.value;
    this.form.distance=this.searchForm.get('distance')?.value ?? 10;
    this.form.category=this.searchForm.get('category')?.value ?? 'Default';
    if(this.searchForm.get('location')?.enabled){
      const location=this.searchForm.get('location')?.value;
      this.getGeoService.getGeo(location).subscribe(
        response=>{
          this.form.lat=response.lat;
          this.form.lng=response.lng;
          this.ticketmasterService.getSearchResult(this.form);
        });
    }
    else{
      this.getGeoService.getAutoGeo().subscribe(response=>{
        this.form.lat=response.lat;
        this.form.lng=response.lng;
        this.ticketmasterService.getSearchResult(this.form);
      });
    }
  }

  clearAll():void{
    this.searchForm.get('keyword')?.setValue("");
    this.searchForm.get('distance')?.setValue("");
    this.searchForm.get('category')?.setValue("Default");
    this.searchForm.get('location')?.setValue("");
    this.searchForm.get('location')?.enable();
    this.searchForm.get('auto')?.setValue(0);
    this.form=={keyword: '',distance: 10,category: 'Default',lat: '',lng: ''};
    this.isChecked=false;
    this.ticketmasterService.clearSearchResult();
  }
  ngOnInit(): void {
    
  }

}


import { TestBed } from '@angular/core/testing';

import { GetgeoService } from './getgeo.service';

describe('GetgeoService', () => {
  let service: GetgeoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetgeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

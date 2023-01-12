import { TestBed } from '@angular/core/testing';

import { StringGeneratorService } from './string-generator.service';

describe('StringGeneratorService', () => {
  let service: StringGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StringGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

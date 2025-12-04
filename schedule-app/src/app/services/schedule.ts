import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CreateScheduleDto, UpdateScheduleDto, ScheduleDetailsDto } from '../models/schedule-models';
import { ScheduleStatus } from '../models/ScheduleStatus.enum';
import { ApiResult } from '../models/api-result';

@Injectable({
  providedIn: 'root',
})
export class Schedule {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:44312/api/schedule';

  
  private handleApiResult = <T>() => (source: Observable<ApiResult<T>>) =>
    source.pipe(
     
      map((response) => {
        if (response.isSuccess) {
          return response.data;
        } else {
        
          throw new Error(response.errorMessage || 'Operation failed');
        }
      }),
      
      catchError((err: HttpErrorResponse) => {
       
        if (err.error && err.error.isSuccess === false) {
           const apiResult = err.error as ApiResult<T>;
           return throwError(() => new Error(apiResult.errorMessage));
        }
        
    
        return throwError(() => new Error(err.message || 'Server Error'));
      })
    );


  createSchedule(data: CreateScheduleDto): Observable<any> {
    return this.http.post<ApiResult<any>>(`${this.apiUrl}/CreateSchedule`, data)
      .pipe(this.handleApiResult());
  }

  updateSchedule(data: UpdateScheduleDto): Observable<any> {
    return this.http.put<ApiResult<any>>(`${this.apiUrl}/UpdateSchedule`, data)
      .pipe(this.handleApiResult());
  }

  getUsersSchedules(): Observable<ScheduleDetailsDto[]> {
    return this.http.get<ApiResult<ScheduleDetailsDto[]>>(`${this.apiUrl}/GetUserSchedules`)
      .pipe(this.handleApiResult<ScheduleDetailsDto[]>());
  }

  getPendingSchedules(): Observable<ScheduleDetailsDto[]> {
    return this.http.get<ApiResult<ScheduleDetailsDto[]>>(`${this.apiUrl}/pending`)
      .pipe(this.handleApiResult<ScheduleDetailsDto[]>());
  }

  changeStatus(id: string, status: ScheduleStatus): Observable<any> {
    return this.http.patch<ApiResult<any>>(`${this.apiUrl}/${id}/status`, status)
      .pipe(this.handleApiResult());
  }
}
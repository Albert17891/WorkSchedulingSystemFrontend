import { ScheduleStatus } from "./ScheduleStatus.enum";

export interface CreateJobDto {
  title: string;
  description: string;
  duration: string; 
}

export interface UpdateJobDto {
  id:string  
  title: string;
  description: string;
  duration: string; 
}

export interface JobDetailsDto{
  id:string  
  title: string;
  description: string;
  duration: string; 
}

export interface CreateScheduleDto {
  date: string;          
  jobs: CreateJobDto[];
}

export interface UpdateScheduleDto {
  id:string  
  date: string;          
  jobs: CreateJobDto[];
}

export interface ScheduleDetailsDto{
     id:string  
     date: string;     
     Status:ScheduleStatus     
     jobs: JobDetailsDto[];
}
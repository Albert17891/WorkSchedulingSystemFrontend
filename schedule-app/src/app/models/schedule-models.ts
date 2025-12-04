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
  jobId:string  
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
     scheduleId:string  
     date: string;     
     status:string     
     jobs: JobDetailsDto[];
}
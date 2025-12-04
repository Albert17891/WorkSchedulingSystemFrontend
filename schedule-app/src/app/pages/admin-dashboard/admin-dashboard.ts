import { Component, inject, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Schedule } from '../../services/schedule'; 
import { ScheduleDetailsDto } from '../../models/schedule-models';
import { ScheduleStatus } from '../../models/ScheduleStatus.enum';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard  implements OnInit{

  constructor(private cd: ChangeDetectorRef) {}

   private scheduleService = inject(Schedule);
  
   pendingSchedules: ScheduleDetailsDto[] = [];
   isLoading = false;  

   ngOnInit() {
    this.loadPending();
   
  }

  loadPending() {
    this.isLoading = true;
    this.scheduleService.getPendingSchedules().subscribe({
      next: (data) => {
        this.pendingSchedules = data;
       
        this.isLoading = false;
        
          this.cd.detectChanges(); 
      },
      error: (err) => {
        console.error('Failed to load schedules', err);
        this.isLoading = false;
      }
    });
  }

  approve(id: string) {
    this.processDecision(id, ScheduleStatus.Approved);
  }
  
  reject(id: string) {
    this.processDecision(id, ScheduleStatus.Rejected);
  }

  private processDecision(id: string, status: ScheduleStatus) {
    if(!confirm(`Are you sure you want to ${status === 1 ? 'Approve' : 'Reject'} this request?`)) return;

    this.scheduleService.changeStatus(id, status).subscribe({
      next: () => {
       
        this.pendingSchedules = this.pendingSchedules.filter(s => s.scheduleId !== id);
        
      },
      error: (err) => {
        alert('Error updating status');
        console.error(err);
      }
    });
  }
}

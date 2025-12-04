import { Component, inject, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Schedule } from '../../services/schedule';
import { ScheduleDetailsDto, CreateScheduleDto, UpdateScheduleDto } from '../../models/schedule-models';
import { ScheduleStatus } from '../../models/ScheduleStatus.enum';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';     
import { MatIconModule } from '@angular/material/icon';      
import { MatInputModule } from '@angular/material/input';       
import { MatFormFieldModule } from '@angular/material/form-field'; 

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table'; 
import { TagModule } from 'primeng/tag';  

@Component({
  selector: 'app-worker-dashboard',
  imports: [CommonModule, ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,

    DialogModule,
    ButtonModule,
    InputTextModule,
    RippleModule,
     TableModule, 
    TagModule
  ],
  templateUrl: './worker-dashboard.html',
  styleUrl: './worker-dashboard.scss',
})
export class WorkerDashboard implements OnInit {
  private fb = inject(FormBuilder);
  private scheduleService = inject(Schedule);


 currentDate = new Date();
  weekDays: Date[] = [];
  mySchedules: ScheduleDetailsDto[] = [];
  
  // Flat data for the p-table view
  tableData: any[] = []; 
  
  // View State
  viewMode: 'calendar' | 'list' = 'calendar'; // Controls the active view

  isLoading = false;
  showModal = false;
  isEditMode = false;
  currentScheduleId: string | null = null;
  eStatus = ScheduleStatus;

  scheduleForm: FormGroup = this.fb.group({
    date: ['', Validators.required],
    jobs: this.fb.array([]) 
  });

  ngOnInit() {
    this.generateWeek(this.currentDate);
    this.loadMySchedules();
  }

  // --- DATA LOADING & PROCESSING ---
  loadMySchedules() {
    this.isLoading = true;
    this.scheduleService.getUsersSchedules().subscribe({
      next: (data) => { 
        this.mySchedules = data; 
        this.processTableData(data); // <--- Process data for table
        this.isLoading = false; 
      },
      error: () => this.isLoading = false
    });
  }

  // Flattens the schedule hierarchy into a list of jobs for the table
  processTableData(schedules: ScheduleDetailsDto[]) {
    this.tableData = schedules.flatMap(schedule => 
      schedule.jobs.map(job => ({
        ...job, // title, description, duration
        scheduleDate: schedule.date,
        scheduleStatus: schedule.status,
        scheduleId: schedule.scheduleId
      }))
    );
  }

  // --- HELPER FOR TABLE TAGS ---
  // Fixed: Changed 'warning' to 'warn' to match PrimeNG Tag severity type
  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | undefined {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warn';
      default: return 'info';
    }
  }

  // --- CALENDAR LOGIC ---
  generateWeek(refDate: Date) {
    this.weekDays = [];
    const start = this.getStartOfWeek(new Date(refDate));
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      this.weekDays.push(day);
    }
  }

  getStartOfWeek(date: Date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  changeWeek(offset: number) {
    this.currentDate.setDate(this.currentDate.getDate() + (offset * 7));
    this.generateWeek(this.currentDate);
  }

  getScheduleForDate(date: Date) {
    return this.mySchedules.find(s => {
      const d = new Date(s.date);
      return d.getDate() === date.getDate() && 
             d.getMonth() === date.getMonth() && 
             d.getFullYear() === date.getFullYear();
    });
  }

  isToday(date: Date) {
    const t = new Date();
    return date.getDate() === t.getDate() && 
           date.getMonth() === t.getMonth() && 
           date.getFullYear() === t.getFullYear();
  }

  // --- FORM LOGIC ---
  get jobsArray() { return this.scheduleForm.get('jobs') as FormArray; }

  createJobGroup(title = '', desc = '', duration = '01:00') {
    return this.fb.group({
      title: [title, Validators.required],
      description: [desc],
      duration: [duration, Validators.required]
    });
  }

  addJob() { this.jobsArray.push(this.createJobGroup()); }
  removeJob(i: number) { this.jobsArray.removeAt(i); }

  openCreateForDate(date: Date) {
    this.isEditMode = false;
    this.currentScheduleId = null;
    this.scheduleForm.reset();
    this.jobsArray.clear();
    this.addJob();

    // Adjust date string for input
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    const dateStr = localDate.toISOString().split('T')[0];

    this.scheduleForm.patchValue({ date: dateStr });
    this.showModal = true;
  }

  // Opens modal for a specific schedule (found by ID in flat table row)
  openEditById(scheduleId: string) {
    const schedule = this.mySchedules.find(s => s.scheduleId === scheduleId);
    if (schedule) {
      this.openEdit(schedule);
    }
  }

  openEdit(schedule: ScheduleDetailsDto) {
    this.isEditMode = true;
    this.currentScheduleId = schedule.scheduleId;
    this.jobsArray.clear();
    
    const dateStr = new Date(schedule.date).toISOString().split('T')[0];
    this.scheduleForm.patchValue({ date: dateStr });

    schedule.jobs.forEach(j => {
      this.jobsArray.push(this.createJobGroup(j.title, j.description, j.duration));
    });
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  onSubmit() {
    if (this.scheduleForm.invalid) return;
    const val = this.scheduleForm.value;

    if (this.isEditMode && this.currentScheduleId) {
      const dto: UpdateScheduleDto = { id: this.currentScheduleId, date: val.date, jobs: val.jobs };
      this.scheduleService.updateSchedule(dto).subscribe({
        next: () => { this.closeModal(); this.loadMySchedules(); }
      });
    } else {
      const dto: CreateScheduleDto = { date: val.date, jobs: val.jobs };
      this.scheduleService.createSchedule(dto).subscribe({
        next: () => { this.closeModal(); this.loadMySchedules(); }
      });
    }
  }
}
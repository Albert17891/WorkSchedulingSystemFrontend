import { Component, inject, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Schedule } from '../../services/schedule';
import { ScheduleDetailsDto, CreateScheduleDto, UpdateScheduleDto } from '../../models/schedule-models';
import { ScheduleStatus } from '../../models/ScheduleStatus.enum';

@Component({
  selector: 'app-worker-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './worker-dashboard.html',
  styleUrl: './worker-dashboard.scss',
})
export class WorkerDashboard implements OnInit {
  private fb = inject(FormBuilder);
  private scheduleService = inject(Schedule);

 

   // --- CALENDAR STATE ---
  currentDate = new Date();
  weekDays: Date[] = [];
  
  // --- DATA STATE ---
  mySchedules: ScheduleDetailsDto[] = [];
  isLoading = false;
  
  // --- MODAL STATE ---
  showModal = false;
  isEditMode = false;
  currentScheduleId: string | null = null;
  eStatus = ScheduleStatus; // Helper for Template comparisons

  scheduleForm: FormGroup = this.fb.group({
    date: ['', Validators.required],
    jobs: this.fb.array([]) 
  });

  ngOnInit() {
    this.generateWeek(this.currentDate);
    this.loadMySchedules();
  }

  // ==========================================
  // 📅 CALENDAR / WEEK VIEW LOGIC
  // ==========================================
  
  // Generates the 7 days for the "Group by Calendar" Grid View
  generateWeek(refDate: Date) {
    this.weekDays = [];
    const start = this.getStartOfWeek(new Date(refDate));
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      this.weekDays.push(day);
    }
  }

  // Ensures Monday is the start of the week
  getStartOfWeek(date: Date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  // Navigates Previous/Next Week
  changeWeek(offset: number) {
    this.currentDate.setDate(this.currentDate.getDate() + (offset * 7));
    this.generateWeek(this.currentDate);
  }

  // Groups data by date: Finds the specific schedule for a grid column
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

  // ==========================================
  // 💾 DATA & FORM LOGIC
  // ==========================================
  
  get jobsArray() { return this.scheduleForm.get('jobs') as FormArray; }

  loadMySchedules() {
    this.isLoading = true;
    this.scheduleService.getUsersSchedules().subscribe({
      next: (data) => { this.mySchedules = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  createJobGroup(title = '', desc = '', duration = '01:00') {
    return this.fb.group({
      title: [title, Validators.required],
      description: [desc],
      duration: [duration, Validators.required]
    });
  }

  addJob() { this.jobsArray.push(this.createJobGroup()); }
  removeJob(i: number) { this.jobsArray.removeAt(i); }

  // Opens the Create Modal pre-filled with the date clicked in the calendar
  openCreateForDate(date: Date) {
    this.isEditMode = false;
    this.currentScheduleId = null;
    this.scheduleForm.reset();
    this.jobsArray.clear();
    this.addJob();

    // Adjust for timezones to ensure the date input shows the correct day selected
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    const dateStr = localDate.toISOString().split('T')[0];

    this.scheduleForm.patchValue({ date: dateStr });
    this.showModal = true;
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
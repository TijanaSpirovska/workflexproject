export class WorkationDto {
  id: string = '';
  employeeName: string = '';
  origin: string = '';
  destination: string = '';
  start: Date = new Date();
  endDate: Date = new Date();
  status: string = 'PENDING';
  reason: string = '';
  approverName: string = '';
  workingDays: number = 0;
  createdAt: Date = new Date();
  risk: string = ''; // "HIGH_RISK", "LOW_RISK", "NO_RISK"
}

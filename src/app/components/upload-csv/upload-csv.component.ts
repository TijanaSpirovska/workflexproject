import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WorkationService } from '../../services/workation.service';
import { WorkationUploadCsvService } from '../../services/workation-csv-upload.service';

@Component({
  selector: 'app-upload-csv',
  standalone: false,
  templateUrl: './upload-csv.component.html',
  styleUrls: ['./upload-csv.component.scss'],
})
export class UploadCsvComponent {
  selectedFile: File | null = null;
  fileName: string = '';

  constructor(
    private readonly toastr: ToastrService,
    private readonly workationUploadService: WorkationUploadCsvService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
    }
  }

  onUpload(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.workationUploadService.create(formData).subscribe({
      next: () => {
        this.toastr.success('CSV uploaded successfully!', 'Success');
        this.selectedFile = null;
        this.fileName = '';
      },
      error: (err) => {
        this.selectedFile = null;
        this.fileName = '';
      },
    });
  }
}

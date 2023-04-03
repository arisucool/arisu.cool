import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [CommonModule, MaterialModule],
  exports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule],
})
export class SharedModule {}

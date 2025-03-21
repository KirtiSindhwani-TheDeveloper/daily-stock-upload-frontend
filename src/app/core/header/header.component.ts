import { Component } from '@angular/core';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';
import { SharedModule } from '../../shared/shared.module';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [PrimengModuleModule, SharedModule, SidebarComponent,RouterModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  visible:boolean=false
  visibleSidebar: boolean = false;  // Controls the visibility of the sidebar

  // Toggle Sidebar visibility
  toggleSidebar() {
    this.visibleSidebar = !this.visibleSidebar;
  }

  onSidebarVisibilityChange(visible: boolean) {
    this.visibleSidebar = visible;
  }
}

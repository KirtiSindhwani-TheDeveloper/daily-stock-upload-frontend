import { Component, EventEmitter, Input, Output, output, ViewChild, ViewEncapsulation } from '@angular/core';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { MenuItem, MessageService } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { TieredMenu } from 'primeng/tieredmenu';

@Component({
  selector: 'app-sidebar',
  imports: [PrimengModuleModule,SharedModule,FormsModule,ReactiveFormsModule,CommonModule,RouterModule],
  providers:[],
  templateUrl: './sidebar.component.html',
  encapsulation:ViewEncapsulation.None,
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
 
  @ViewChild('menu') menu:TieredMenu |null=  null;
  @Input() visible: boolean = false; 
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  items: MenuItem[] | undefined;
  visibleSidebar: boolean = true;
  searchQuery: string = '';
  activeIndex:any;
  isVisible: boolean = true;
  sidebarItems = [
    {id: 1, value: "Mapping", children: [
        {id: 2, value: "Stock Upload Mapping", route: 'mapping/stock-upload',isActive: false},
        {id: 3, value: "Dealer Location Mapping", route: 'mapping/dealer-location',isActive: false}
      ], isExpanded: false},
    {id: 4, value: "Stock Upload", children: [
      {id: 2, value: "Single Location Upload", route: '',isActive: false},
      {id: 3, value: "Multi Location Upload", route: '',isActive: false},
      {id: 3, value: "Single Upload", route: '',isActive: false},
      {id: 3, value: "Bulk Upload", route: '',isActive: false}
    ], isExpanded: false}
  ];
  
    filteredItems: any[] = [...this.sidebarItems]; // Initially, all items are visible

    // Function to filter items based on the search query
    filterItems() {
      // If search query is empty or contains only spaces, reset to show all items
      if (!this.searchQuery || this.searchQuery.trim() === '') {
        this.filteredItems = [...this.sidebarItems]; // Show all items
        return;
      }
    
      // Filter items based on search query
      this.filteredItems = this.sidebarItems.map(item => {
        // Check if the parent matches the search query
        let matchesParent = item.value.toLowerCase().includes(this.searchQuery.trim().toLowerCase());
    
        if (item.children) {
          // Filter child items that match the search query
          const filteredChildren = item.children.filter(child =>
            child.value.toLowerCase().includes(this.searchQuery.trim().toLowerCase())
          );
    
          // If any child matches, include the parent and the filtered children
          if (filteredChildren.length > 0) {
            return {
              ...item,  // Keep the parent item
              children: filteredChildren  // Only keep the matching children
            };
          }
        }
    
        // Include the parent item if it matches the search query
        if (matchesParent) {
          return item;
        }
    
        return null; // Exclude items that don't match
      }).filter(item => item !== null);  // Remove null values
    }
    
    openSidebar() {
      this.isVisible = true;
    }
  
    toggleSidebar() {
      this.visible = !this.visible;
      this.visibleChange.emit(this.visible);  // Notify the parent about the visibility change
    }
    // Method to close the sidebar
    closeSidebar() {
      this.isVisible = false;
    }
    onButtonClick(event: any) {
      console.log('Button clicked');
      this.menu?.toggle(event);
    }
    
    

   
   setActive(subItem: any, parentItem: any) {

    // console.log(subItem);
     // Reset the active state for all main menu items and submenus
     this.sidebarItems.forEach((menuItem: any) => {
       menuItem.isActive = false;  // Reset active state for all main items
       menuItem?.children.forEach((sub: any) => {
         sub.isActive = false;  // Reset active state for all submenus
       });
     });
   
     // Set the clicked submenu item as active
     subItem.isActive = true;
   
     // Also set the parent main menu item as active
     parentItem.isActive = true;
   
     // Ensure that the parent submenu is opened
     parentItem.isOpen = true;
   }

 

  toggleChildren(item:any) {
    item.isExpanded = !item.isExpanded;
  
    // When expanding, reset the active state of child items
    if (item.isExpanded) {
      item.children.forEach((child:any) => child.isActive = false);  // Reset active state of children
    }
  }
  
  // Function to set an active child item
  setActiveChild(child:any) {
    // Deactivate all children in the sidebar
    this.sidebarItems.forEach(item => {
      if (item.children) {
        item.children.forEach(childItem => {
          if (childItem !== child) {
            childItem.isActive = false;  // Deactivate other children
          }
        });
      }
    });
  }
  ngOnInit(){
  this.items = [
    {
      label: 'Update Profile',
      icon: 'pi pi-user',
    
  },
  {
    label: 'Settings',
    icon: ' pi pi-cog',
  
  },   
    {
        label: 'Log Out',
        icon: 'pi pi-sign-out',
      
    },
    {
        separator: true
    },
 
    
  ]
  
}
   
}

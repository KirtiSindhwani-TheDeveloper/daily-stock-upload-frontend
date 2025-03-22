import { Component, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CoreModule } from './core/core.module';
import { SidebarComponent } from "./core/sidebar/sidebar.component";
import { HeaderComponent } from "./core/header/header.component";
import { CommonModule } from '@angular/common';
import { PrimengModuleModule } from './shared/primeng-module/primeng-module.module';
import { SharedModule } from './shared/shared.module';
import { BlockUI } from 'primeng/blockui';
import { GlobalBlockUiService } from './services/global-block-ui.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CoreModule, SidebarComponent, HeaderComponent,CommonModule,SharedModule,PrimengModuleModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'stock-upload-frontend';
  visibleSidebar:boolean=true;
  isLoading:boolean=false;
  blocked:boolean=false;
  isLoginPage = false;
  @ViewChild('blockUI') blockUI!: BlockUI;
  constructor(private globalBlockUIService: GlobalBlockUiService,
    private router:Router, private route: ActivatedRoute,
    private renderer: Renderer2) {}

  ngOnInit() {
    // Set BlockUI reference in the global service
    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
       
    //     if (event.urlAfterRedirects.includes('stock-upload')) {
    //       this.isLoading=true;  // Start loading for stock-upload route
    //     } else {
    //       this.isLoading=false;   // Stop loading for other routes
    //     }
    //   }
    // });
    this.globalBlockUIService.loading$.subscribe((loading:any)=>{
      this.isLoading=loading;
    })

    this.router.events.subscribe(() => {
      // Update whether the current route is the login page
      this.isLoginPage = this.router.url.includes('/login');
    });
  }

  updateLoaderHeight() {
    if (this.blockUI) {
      const contentHeight = document.documentElement.scrollHeight; // Full page height
      const viewportHeight = window.innerHeight; // Viewport height
      const viewportWidth = window.innerWidth; // Full screen width

      const newHeight = contentHeight > viewportHeight ? `${contentHeight}px` : '100vh';

      this.blockUI.el.nativeElement.style.height = newHeight;
      this.blockUI.el.nativeElement.style.width = `${viewportWidth}px`;
    }
  }

  ngAfterViewInit() {
    this.updateLoaderHeight();
    window.addEventListener('resize', () => this.updateLoaderHeight());
  }
  ngAfterContentChecked() {
    this.updateLoaderHeight(); // Adjust height when content updates
  }
}

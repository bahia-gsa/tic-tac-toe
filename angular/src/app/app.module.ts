import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {FormsModule} from "@angular/forms";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { IndexComponent } from './pages/index/index.component';
import { PlayerConnectedComponent } from './pages/player-connected/player-connected.component';
import { MatchComponent } from './pages/match/match.component';
import {MatIconModule} from "@angular/material/icon";
import { MatDialogModule } from '@angular/material/dialog';
import { TypingEffectComponent } from './components/typing-effect/typing-effect.component';
import { ChalengesLoaderComponent } from './components/chalenges-loader/chalenges-loader.component';
import { FooterComponent } from './components/footer/footer.component';
import { ReadmeComponent } from './components/readme/readme.component';


@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    PlayerConnectedComponent,
    MatchComponent,
    TypingEffectComponent,
    ChalengesLoaderComponent,
    FooterComponent,
    ReadmeComponent,
    
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        BrowserAnimationsModule,
        MatTableModule,
        MatListModule,
        MatIconModule,
        MatDialogModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

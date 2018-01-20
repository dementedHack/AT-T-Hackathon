import { Component, OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
// node_modules/tracking/build/tracking.js
import 'tracking/build/tracking';
import 'tracking';
// node_modules/tracking/build/data/face.js
import 'tracking/build/data/face';


import {Howl, Howler} from 'howler';
import { Point } from '../models/point.model';
import { Subject } from 'rxjs/Subject';

interface Navigator {
    getUserMedia(
        options: { video?: boolean; audio?: boolean; },
        success: (stream: any) => void,
        error?: (error: string) => void
    ): void;
}

@Component({
    selector: 'app-game-mode',
    templateUrl: './game-mode.component.html',
    styleUrls: ['./game-mode.component.css']
})
export class GameModeComponent implements AfterViewInit {
    window: any;
    tracking: any;

    @ViewChild('upperLeft') upperLeftBox;
    upperLBoxBound:Point[];

    @ViewChild('upperRight') upperRightBox;
    upperRBoxBound:Point[];

    @ViewChild('lowerLeft') lowerLeftBox;
    lowerLBoxBound:Point[];

    @ViewChild('lowerRight') lowerRightBox;
    lowerRBoxBound:Point[];
    
    bounds:any[];
    
    cdnEndpoint = 'http://d33k0w5tn3c49w.cloudfront.net/'
    hitBoxImage = 'http://www.freeiconspng.com/uploads/circle-png-7.png';
    hitBoxImages = ['CircleTeal.png', 'CircleRed.png', 'CircleGreen.png']
    
    canCheck: boolean = true;
    sounds:Howl[];
    @ViewChild('myVideo') hardwareVideo;

    collisionDetection = new Subject();

    constructor() {}

    startVideo() {


        const video = this.hardwareVideo.nativeElement;

        var n = <any>navigator;

        n.getUserMedia = ( n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia  || n.msGetUserMedia );
        n.mediaDevices.getUserMedia({ video: true }).then(
            (stream) => {
                console.log("called");
                video.src = window.URL.createObjectURL(stream);
                video.play();
            },
            (err) => {
                console.log(err);
            });

        // Custom color tracking for RGB(60, 0, 160) (+/- 50 for error)
        tracking.ColorTracker.registerColor('purple', function(r, g, b) {
            if (r >= 10 && r <= 110  && g <= 50 && b >= 110 && b <= 210) {
                return true;
            }
            return false;
            });

        // Change the minimum dimension for color tracking to 1
        //tracking.ColorTracker.prototype.minDimension = 1;

        var colors = new tracking.ColorTracker(['yellow']);
        colors.on('track', (event) => {
            if (event.data.length === 0) {
                // No colors were detected in this frame.
            } else {
                event.data.forEach((rect) => {
                    this.collisionDetection.next(new Point((this.hardwareVideo.nativeElement.clientWidth - rect.x), rect.y));
                });
            }
        });

        tracking.track('#myVideo', colors);
        
    }

    ngOnInit(){
        this.sounds = [new Howl({src:'../../assets/audio/Famoush.wav'}), 
                      new Howl({src:'../../assets/audio/Hiagogo.wav'}),
                      new Howl({src:'../../assets/audio/LowMedHit.wav'}),
                      new Howl({src:'../../assets/audio/LowHit.wav'})];
        
        this.upperLBoxBound = [new Point(this.upperLeftBox.nativeElement.x, this.upperLeftBox.nativeElement.y),
            new Point(this.upperLeftBox.nativeElement.x + this.upperLeftBox.nativeElement.width, this.upperLeftBox.nativeElement.y),
            new Point(this.upperLeftBox.nativeElement.x,this.upperLeftBox.nativeElement.y + this.upperLeftBox.nativeElement.height),
            new Point(this.upperLeftBox.nativeElement.x + this.upperLeftBox.nativeElement.width,this.upperLeftBox.nativeElement.y + this.upperLeftBox.nativeElement.height)
        ];
        this.upperRBoxBound =  [new Point(this.upperRightBox.nativeElement.x, this.upperRightBox.nativeElement.y),
            new Point(this.upperRightBox.nativeElement.x + this.upperRightBox.nativeElement.width, this.upperRightBox.nativeElement.y),
            new Point(this.upperRightBox.nativeElement.x,this.upperRightBox.nativeElement.y + this.upperRightBox.nativeElement.height),
            new Point(this.upperRightBox.nativeElement.x + this.upperRightBox.nativeElement.width,this.upperRightBox.nativeElement.y + this.upperRightBox.nativeElement.height)
        ];
        this.lowerLBoxBound =  [new Point(this.lowerLeftBox.nativeElement.x, this.lowerLeftBox.nativeElement.y),
            new Point(this.lowerLeftBox.nativeElement.x + this.lowerLeftBox.nativeElement.width, this.lowerLeftBox.nativeElement.y),
            new Point(this.lowerLeftBox.nativeElement.x,this.lowerLeftBox.nativeElement.y + this.lowerLeftBox.nativeElement.height),
            new Point(this.lowerLeftBox.nativeElement.x + this.lowerLeftBox.nativeElement.width,this.lowerLeftBox.nativeElement.y + this.lowerLeftBox.nativeElement.height)
        ];
        this.lowerRBoxBound =  [new Point(this.lowerRightBox.nativeElement.x, this.lowerRightBox.nativeElement.y),
            new Point(this.lowerRightBox.nativeElement.x + this.lowerRightBox.nativeElement.width, this.lowerRightBox.nativeElement.y),
            new Point(this.lowerRightBox.nativeElement.x,this.lowerRightBox.nativeElement.y + this.lowerRightBox.nativeElement.height),
            new Point(this.lowerRightBox.nativeElement.x + this.lowerRightBox.nativeElement.width,this.lowerRightBox.nativeElement.y + this.lowerRightBox.nativeElement.height)
        ];
        
        

        

        this.bounds = [this.upperLBoxBound, this.upperRBoxBound, this.lowerLBoxBound, this.lowerRBoxBound];
        for(let i = 0; i < this.bounds.length; i++){
            console.log(this.bounds[i]);
        }

        this.collisionDetection.subscribe(
            (point:Point)=>{
                if(this.canCheckCollision()){
                    this.checkIfCollision(point);
                }
            }
        );
    }

    ngAfterViewInit() {
        this.startVideo();
    }

    playSoundZero(){
        this.sounds[0].play();
    }
    playSoundOne(){
        this.sounds[1].play();
    }
    playSoundTwo(){
        this.sounds[2].play();
    }
    playSoundThree(){
        this.sounds[3].play();
    }

    //takes a param point, checks if param is inside any box.
    checkIfCollision(point:Point){
        if(!(this.bounds == null)){
            console.log("input: " + point.y);
            console.log("value: " + this.bounds[0][0].y)
            
            for(let i = 0; i < this.bounds.length; i++){
                    
                this.playSound(i);
                
                    // console.log
                }
            }
        
    }

    playSound(index: number){
        this.canCheck = false;
        const id = setTimeout(
            ()=>{
                this.sounds[index].play();
                this.canCheck = true;
            }
        , 2000);
    }
    canCheckCollision(){
        return this.canCheck;
    }
    // Side as in left or right side. Region as in upper left, lower right.
    generateFallingObject(side, region) {

    }

}

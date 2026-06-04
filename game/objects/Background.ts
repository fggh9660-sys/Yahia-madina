
import Phaser from 'phaser';
import { PigeonFlock } from './PigeonFlock';
import { AtmosphereGenerator } from '../generators/AtmosphereGenerator';
import { DesertLayers } from './backgrounds/DesertLayers';
import { CityLayers } from './backgrounds/CityLayers';
import { LibraryLayers } from './backgrounds/LibraryLayers';
import { ObservatoryLayers } from './backgrounds/ObservatoryLayers';

export class Background {
  private scene: Phaser.Scene;
  private width: number;
  private height: number;

  // Layer Managers
  private desertLayers: DesertLayers;
  private cityLayers: CityLayers;
  private libraryLayers: LibraryLayers;
  private observatoryLayers: ObservatoryLayers;

  // -- ATMOSPHERE --
  private sky!: Phaser.GameObjects.Image;
  private haze!: Phaser.GameObjects.TileSprite;
  private clouds1!: Phaser.GameObjects.TileSprite;
  private clouds2!: Phaser.GameObjects.TileSprite;
  private starsGroup!: Phaser.GameObjects.Group;
  
  private shootingStarTimer: number = 0;
  private pigeons!: PigeonFlock;

  // State
  private isCityActive: boolean = false;
  private isLibraryActive: boolean = false;
  private isObservatoryActive: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.width = Math.max(10, Math.ceil(scene.scale.width));
    this.height = Math.max(10, Math.ceil(scene.scale.height));

    this.desertLayers = new DesertLayers(scene);
    this.cityLayers = new CityLayers(scene);
    this.libraryLayers = new LibraryLayers(scene);
    this.observatoryLayers = new ObservatoryLayers(scene);

    AtmosphereGenerator.init(scene);
    this.create();
  }

  private create() {
    this.createSky();
    this.createCelestialBodies();
    
    this.createAtmosphereLayers();

    // Create Managers
    this.cityLayers.create(this.width, this.height);
    this.desertLayers.create(this.width, this.height);
    this.libraryLayers.create(this.width, this.height);
    this.observatoryLayers.create(this.width, this.height);
    
    this.createParticles();
  }

  public resize(width: number, height: number) {
      this.width = width;
      this.height = height;

      if (this.sky) {
          this.sky.setPosition(width / 2, height / 2);
          this.sky.setDisplaySize(width, height);
      }

      const updateLayer = (layer: Phaser.GameObjects.TileSprite, yOffset: number) => {
          if (layer) {
              layer.setPosition(0, height - yOffset);
              layer.width = width;
              layer.setTileScale(1, 1);
          }
      };
      
      updateLayer(this.haze, 0);
      updateLayer(this.clouds1, height * 0.4);
      updateLayer(this.clouds2, height * 0.2);

      this.cityLayers.resize(width, height);
      this.desertLayers.resize(width, height);
      this.libraryLayers.resize(width, height);
      this.observatoryLayers.resize(width, height);
  }

  public update(time: number, delta: number, speed: number) {
    this.clouds1.tilePositionX += (speed * 0.01) + (delta * 0.005);
    this.clouds2.tilePositionX += (speed * 0.02) + (delta * 0.01);

    this.desertLayers.update(speed);
    this.cityLayers.update(speed);
    this.libraryLayers.update(speed);
    this.observatoryLayers.update(speed);

    this.updateShootingStars(time);
    
    if (this.pigeons) {
        this.pigeons.update(delta, speed);
    }
  }

  public transitionToCity(duration: number = 3000) {
      if (this.isCityActive) return;
      this.isCityActive = true;

      this.desertLayers.fadeOut(duration);
      this.cityLayers.fadeIn(duration);
  }

  public transitionToLibrary(duration: number = 2000) {
      if (this.isLibraryActive) return;
      this.isLibraryActive = true;
      
      if (this.isCityActive) {
          this.cityLayers.fadeOut(duration);
      } else {
          this.desertLayers.fadeOut(duration);
      }

      this.libraryLayers.fadeIn(duration);
      
      this.scene.tweens.add({
          targets: [this.haze, this.clouds1, this.clouds2],
          alpha: 0,
          duration: duration
      });
  }

  public transitionLibraryToCity(duration: number = 3000) {
      if (!this.isLibraryActive) return;
      this.isLibraryActive = false;
      this.isCityActive = true; // Ensure active

      // Fade out Library
      this.libraryLayers.fadeOut(duration);
      
      // Fade In City
      this.cityLayers.fadeIn(duration);

      // Restore Atmosphere
      this.scene.tweens.add({
          targets: [this.haze, this.clouds1, this.clouds2],
          alpha: 1, // Restore
          duration: duration
      });
  }

  public setFlightMode(active: boolean) {
      // Pass flight status to City Layers to handle foreground elements
      this.cityLayers.setFlightMode(active);
  }

  /** M3B — Stage 3: ascend into the Observatory. Fade out whatever world layer is active,
   *  fade in the observatory domes + colonnade, and lean into the night sky (haze/clouds out so
   *  the existing starfield + moon carry the celestial mood). */
  public transitionToObservatory(duration: number = 3000) {
      if (this.isObservatoryActive) return;
      this.isObservatoryActive = true;

      this.libraryLayers.fadeOut(duration);
      this.cityLayers.fadeOut(duration);
      this.desertLayers.fadeOut(duration);
      this.observatoryLayers.fadeIn(duration);

      // Clear the daytime haze/clouds so the night sky reads cleanly.
      this.scene.tweens.add({
          targets: [this.haze, this.clouds1, this.clouds2],
          alpha: 0,
          duration
      });

      // Brighten the existing starfield for the observatory.
      if (this.starsGroup) {
          this.starsGroup.getChildren().forEach((s) => {
              const star = s as Phaser.GameObjects.Image;
              this.scene.tweens.add({ targets: star, alpha: Math.min(1, (star.alpha || 0.5) + 0.3), duration });
          });
      }

      // Soft nebula glow drifting across the upper sky — a signature of the celestial stage.
      const nebula = this.scene.add.ellipse(this.width * 0.5, this.height * 0.26, this.width * 1.3, this.height * 0.55, 0x3a5bd0);
      nebula.setScrollFactor(0);
      nebula.setBlendMode(Phaser.BlendModes.ADD);
      nebula.setDepth(-88);
      nebula.setAlpha(0);
      this.scene.tweens.add({ targets: nebula, alpha: 0.14, duration });
      this.scene.tweens.add({ targets: nebula, scaleX: 1.12, scaleY: 1.2, duration: 9000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private createSky() {
    this.sky = this.scene.add.image(this.width / 2, this.height / 2, 'skyGradient_fixed');
    this.sky.setScrollFactor(0);
    this.sky.setDepth(-100); 
    this.sky.setDisplaySize(this.width, this.height);
  }

  private createAtmosphereLayers() {
      this.clouds1 = this.scene.add.tileSprite(0, 0, this.width, 256, 'bg_cloud');
      this.clouds1.setOrigin(0, 0);
      this.clouds1.setScrollFactor(0);
      this.clouds1.setDepth(-80);
      this.clouds1.setAlpha(0.4);

      this.clouds2 = this.scene.add.tileSprite(0, 0, this.width, 256, 'bg_cloud');
      this.clouds2.setOrigin(0, 0);
      this.clouds2.setScrollFactor(0);
      this.clouds2.setDepth(-75);
      this.clouds2.setAlpha(0.2);
      this.clouds2.setFlipY(true); 

      this.haze = this.scene.add.tileSprite(0, 0, this.width, 256, 'bg_haze');
      this.haze.setOrigin(0, 1);
      this.haze.setScrollFactor(0);
      this.haze.setDepth(-45); 
      this.haze.setBlendMode(Phaser.BlendModes.SCREEN);
  }

  private createCelestialBodies() {
    this.starsGroup = this.scene.add.group();
    for(let i = 0; i < 60; i++) {
        const x = Phaser.Math.Between(0, this.width);
        const y = Phaser.Math.Between(0, this.height * 0.6);
        const scale = Phaser.Math.FloatBetween(0.4, 1.0); 
        
        const star = this.scene.add.image(x, y, 'star');
        star.setScale(scale);
        star.setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
        star.setScrollFactor(0.01);
        star.setDepth(-90); 
        
        this.scene.tweens.add({
            targets: star,
            alpha: 0.1,
            scale: scale * 0.8,
            duration: Phaser.Math.Between(2000, 5000),
            yoyo: true,
            repeat: -1,
            delay: Phaser.Math.Between(0, 3000),
            ease: 'Sine.easeInOut'
        });
    }

    const moonX = this.width * 0.85;
    const moonY = this.height * 0.15;
    
    const glow = this.scene.add.image(moonX, moonY, 'moon');
    glow.setScrollFactor(0);
    glow.setAlpha(0.2);
    glow.setScale(1.2);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setDepth(-85);
    
    const moon = this.scene.add.image(moonX, moonY, 'moon');
    moon.setScrollFactor(0);
    moon.setScale(0.7);
    moon.setDepth(-84);
    
    this.scene.tweens.add({
        targets: glow,
        scale: 1.3,
        alpha: 0.15,
        duration: 4000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
  }

  private createParticles() {
    if (!this.scene.textures.exists('dust')) {
        const dustCanvas = this.scene.textures.createCanvas('dust', 4, 4);
        if (dustCanvas) {
            const ctx = dustCanvas.context;
            ctx.fillStyle = '#ffffff'; 
            ctx.beginPath();
            ctx.arc(2, 2, 2, 0, Math.PI * 2);
            ctx.fill();
            dustCanvas.refresh();
        }
    }

    const particles = this.scene.add.particles(0, 0, 'dust', {
        x: { min: 0, max: this.width },
        y: { min: 0, max: this.height },
        lifespan: 8000,
        speedX: { min: -10, max: -30 }, 
        speedY: { min: -5, max: 5 },
        scale: { start: 0.2, end: 0 }, 
        alpha: { start: 0.3, end: 0 }, 
        quantity: 1,
        frequency: 500, 
        tint: 0xffd700, 
        blendMode: 'ADD'
    });
    particles.setScrollFactor(0);
    particles.setDepth(15); 

    this.pigeons = new PigeonFlock(this.scene);
  }

  private updateShootingStars(time: number) {
    if (time > this.shootingStarTimer) {
        // M3B: the Observatory sky is far more active — shooting stars streak much more often.
        this.shootingStarTimer = time + (this.isObservatoryActive
            ? Phaser.Math.Between(2500, 6000)
            : Phaser.Math.Between(10000, 25000));
        const startX = Phaser.Math.Between(this.width * 0.2, this.width * 0.8);
        const startY = Phaser.Math.Between(0, this.height * 0.3);
        
        const star = this.scene.add.rectangle(startX, startY, 40, 2, 0xffffff);
        star.setOrigin(1, 0.5);
        star.setRotation(Phaser.Math.DegToRad(35));
        star.setDepth(-90);
        
        const head = this.scene.add.circle(startX, startY, 2, 0xffffff);
        head.setDepth(-90);

        this.scene.tweens.add({
            targets: [star, head],
            x: '+=200',
            y: '+=140',
            alpha: 0,
            duration: 600,
            ease: 'Cubic.out',
            onComplete: () => { star.destroy(); head.destroy(); }
        });
        
        this.scene.tweens.add({
            targets: star,
            width: 0,
            duration: 600
        });
    }
  }
}

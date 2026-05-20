
import Phaser from 'phaser';
import { PHYSICS, PROGRESS, SKILL, COMBO, PERFECT_JUMP, BOND_HUD, HITSTOP, SPEED_LINES, BRIDGE_WIND, getPlayerStartX, getGameplayCameraZoom, getPlayerSpawnY } from '../../constants';
import { NOOR_BOND_REWARDS, getBondTier, getBondTierDef, getNextTierThreshold, getCurrentTierFloor } from '../../data/noorBond';
import { Player } from '../objects/Player';
import { Obstacle } from '../objects/Obstacle';
import { Question, GameState, NoorMessage, StageResultsData, ActivePuzzle, PuzzleType } from '../../types';
import { getQuestions } from '../data/questions';

// Objects for Texture Generation
import { Star } from '../objects/Star';
import { Heart } from '../objects/Heart';
import { ShieldItem } from '../objects/ShieldItem';
import { RewardBox } from '../objects/RewardBox';
import { MerchantCart } from '../objects/MerchantCart';
import { StackOfRugs } from '../objects/StackOfRugs';
import { MagicCarpet } from '../objects/MagicCarpet'; 
import { StreetCat } from '../objects/StreetCat'; // Import Cat
import { NurController, type NurState } from '../objects/NurController';

// Managers
import { EnvironmentManager } from '../managers/EnvironmentManager';
import { SpawnManager } from '../managers/SpawnManager';
import { EventManager } from '../managers/EventManager';
import { CollisionManager } from '../managers/CollisionManager';
import { AudioManager } from '../managers/AudioManager';

export class MainScene extends Phaser.Scene {
  declare scale: Phaser.Scale.ScaleManager;
  declare add: Phaser.GameObjects.GameObjectFactory;
  declare physics: Phaser.Physics.Arcade.ArcadePhysics;
  declare input: Phaser.Input.InputPlugin;
  declare tweens: Phaser.Tweens.TweenManager;
  declare time: Phaser.Time.Clock;
  declare textures: Phaser.Textures.TextureManager;
  declare cameras: Phaser.Cameras.Scene2D.CameraManager;
  declare scene: Phaser.Scenes.ScenePlugin;
  declare load: Phaser.Loader.LoaderPlugin;

  // Components
  public player!: Player;
  public environmentManager!: EnvironmentManager;
  public spawnManager!: SpawnManager;
  public eventManager!: EventManager;
  public collisionManager!: CollisionManager;
  public nurController!: NurController;
  public audioManager!: AudioManager;

  // Visuals
  private sandstormOverlay!: Phaser.GameObjects.TileSprite;
  private sandstormEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private debrisEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private cinematicVignette!: Phaser.GameObjects.Image;

  // Game State
  public baseSpeed: number = PHYSICS.RUN_SPEED_START ?? PHYSICS.RUN_SPEED; 
  private speedModifier: number = 1.0;
  private speedModifierTimer: number = 0;
  
  private currentStage: number = 1;
  private collectedStarsCount: number = 0;
  private runDistance: number = 0;
  private hearts: number = 3;
  private isGameOver: boolean = false;

  // Skill depth — sub-slice 2: combo chain state
  private comboCount: number = 0;
  private comboTier: number = 1;
  private comboHudText: Phaser.GameObjects.Text | null = null;

  // Skill depth — sub-slice 4: Noor bond meter state (per-run; persistence is a slice 5/post-trial concern)
  private bondPoints: number = 0;
  private bondTier: number = 0;
  private bondHudBg: Phaser.GameObjects.Graphics | null = null;
  private bondHudFill: Phaser.GameObjects.Graphics | null = null;
  private bondHudLabel: Phaser.GameObjects.Text | null = null;

  private speedLinesTop: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private speedLinesBottom: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  private bridgeWindEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private bridgeOverlay: Phaser.GameObjects.Graphics | null = null;
  private bridgeTint: Phaser.GameObjects.Graphics | null = null;
  private bridgeBanners: Phaser.GameObjects.Sprite[] = [];
  private bridgeBannerTimer: number = 0;

  // UI State
  private activeMessage: string | null = null; 
  private currentNoorMessage: NoorMessage | null = null;
  private messageTimer: Phaser.Time.TimerEvent | null = null;
  private isSoftPaused: boolean = false;
  private isPausedMenu: boolean = false; 
  private activeQuestion: Question | null = null; 
  private questionPool: Question[] = [];
  
  // Stage results (desert end / library event)
  private correctAnswersCount: number = 0;
  private wrongAnswersCount: number = 0;
  private stageStartTime: number = 0;
  private cityStageStartTime: number = 0;
  private cityStartDistanceForStats: number = 0;
  public stageResults: StageResultsData | null = null;
  public pendingTransition: 'DESERT_END' | 'LIBRARY_END' | null = null;
  
  // Phase 4: Climbing
  public climbProgress: number = 0;

  // Step 2 – Progress: stage title overlay (Arabic), cleared after 2–3 s
  private stageTitle: string | null = null;

  // Step 6 – Mini puzzles (storm / library / dual-path)
  private activePuzzle: ActivePuzzle | null = null;
  private puzzleTimer: Phaser.Time.TimerEvent | null = null;
  
  // Guidance Flags
  private guideFlags = {
      welcome: false,
      firstJump: false,
      firstGate: false
  };
  public firstObstacleRef: Obstacle | null = null;

  private lastUiUpdate: number = 0;
  private onScoreUpdate: (data: GameState) => void;

  constructor(onScoreUpdate: (data: GameState) => void) {
    super({ key: 'MainScene' });
    this.onScoreUpdate = onScoreUpdate;
  }

  preload() {
      this.load.crossOrigin = 'anonymous';
      // Audio – from public/audio (no overlapping long tracks)
      this.load.audio('sfx_button', '/audio/button.wav');
      this.load.audio('sfx_star', '/audio/star.wav');
      this.load.audio('sfx_heart', '/audio/heart.wav');
      this.load.audio('sfx_jump', '/audio/jump.wav');
      this.load.audio('sfx_box', '/audio/box.wav');
      this.load.audio('sfx_damage', '/audio/damage.wav');
      this.load.audio('sfx_sandstorm', '/audio/sandstorm.wav');
      this.load.audio('sfx_fail', '/audio/fail.wav');
      this.load.audio('sfx_magicGate', '/audio/magic-gate.mp3');
      this.load.audio('sfx_stageSuccess', '/audio/stageSuccess.wav');
      this.load.audio('sfx_flying', '/audio/flying.wav');
      this.load.audio('bgm_main', '/audio/background-music.mp3');
      // Nur character images (5 expressions) – served from public/nur/
      this.load.image('nur_img_greet', '/nur/nur_greet.png');
      this.load.image('nur_img_encourage', '/nur/nur_encourage.png');
      this.load.image('nur_img_think', '/nur/nur_think.png');
      this.load.image('nur_img_warning', '/nur/nur_warning.png');
      this.load.image('nur_img_success', '/nur/nur_success.png');
  }

  create() {
    this.initializeState();
    this.physics.world.setBoundsCollision(true, true, true, false);
    
    // 1. Initialize Managers
    this.environmentManager = new EnvironmentManager(this);
    this.spawnManager = new SpawnManager(this);
    this.eventManager = new EventManager(this);
    this.collisionManager = new CollisionManager(this);
    this.nurController = new NurController(this);

    // 2. Generate Assets (core gameplay textures – already prewarmed in HomeScene, so this is cheap)
    Player.generateTexture(this);
    Obstacle.generateTextures(this);
    Star.generateTexture(this);
    Heart.generateTexture(this);
    ShieldItem.generateTexture(this);
    RewardBox.generateTexture(this);
    MerchantCart.generateTexture(this);
    StackOfRugs.generateTexture(this);
    StreetCat.generateTexture(this); // Gen Cat

    // 3. Core environment & spawners: only what is needed for the first seconds of running.
    this.environmentManager.create();
    this.spawnManager.create();

    // 4. Create Player
    const height = Math.max(10, Math.ceil(this.scale.height));
    this.player = new Player(this, getPlayerStartX(this.scale.width), getPlayerSpawnY(height));
    this.cameras.main.setZoom(getGameplayCameraZoom(this.scale.width, this.scale.height));
    this.player.setVariableJump(true);

    // 5. Setup Collisions (needed for safe running after intro)
    this.collisionManager.setupCollisions();

    // 6. Audio (preferences from localStorage)
    const soundOn = typeof localStorage !== 'undefined' && localStorage.getItem('soundEnabled') !== '0';
    const musicOn = typeof localStorage !== 'undefined' && localStorage.getItem('musicEnabled') !== '0';
    this.audioManager = new AudioManager(this, { soundEnabled: soundOn, musicEnabled: musicOn });

    // 7. Event Listeners
    this.scale.on('resize', this.handleResize, this);
    this.input.on('pointerdown', this.handleGlobalTap, this);

    // 8. Bond meter HUD hidden 2026-05-17 pending Yahia's redesign direction. Data scaffold
    //    (state, hooks, data/noorBond.ts) preserved — only the visible HUD + tier-up notification
    //    are suppressed. Flip BOND_HUD_VISIBLE to re-enable when the redesigned UI lands.
    // this.updateBondHud();

    // 9. Speed lines emitters (subtle motion streaks scaled by combo tier).
    this.initSpeedLines();

    // 10. Nur intro at center (cinematic), then start running
    this.startNurIntro();
  }

  /** Audio: button press (pause, toggles, etc.). */
  public playButton(): void {
    this.audioManager?.playButton();
  }

  /** Audio: star collected. */
  public playStar(): void {
    this.audioManager?.playStar();
  }

  /** Audio: extra life collected. */
  public playHeart(): void {
    this.audioManager?.playHeart();
  }

  /** Audio: jump. */
  public playJump(): void {
    this.audioManager?.playJump();
  }

  /** At stage 1 magic gate: 5 sec silence then play magic-gate.mp3. */
  public playMagicGateAfterSilence(): void {
    this.audioManager?.playMagicGateAfterSilence();
  }

  public setSoundEnabled(value: boolean): void {
    this.audioManager?.setSoundEnabled(value);
    this.syncUI();
  }

  public setMusicEnabled(value: boolean): void {
    this.audioManager?.setMusicEnabled(value);
    this.syncUI();
  }

  public getSoundEnabled(): boolean { return this.audioManager?.soundEnabled ?? true; }
  public getMusicEnabled(): boolean { return this.audioManager?.musicEnabled ?? true; }

  /** Generate texture for the magic carpet path gate (gold barrier – clearly visible). */
  public generateCarpetGateTexture() {
    if (this.textures.exists('carpet_gate')) return;
    const W = 100;
    const H = 130;
    const canvas = this.textures.createCanvas('carpet_gate', W, H);
    if (!canvas) return;
    const ctx = canvas.context;
    // Dark base so gate stands out
    ctx.fillStyle = '#5c4a1a';
    ctx.fillRect(0, 0, W, H);
    // Thick gold frame
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, W - 6, H - 6);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, W - 16, H - 16);
    // Vertical bars (gate)
    ctx.fillStyle = '#ffd700';
    for (let i = 0; i < 5; i++) {
      const x = 14 + i * 18;
      ctx.fillRect(x, 20, 10, H - 40);
    }
    // Top lintel “entrance” band
    ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.fillRect(0, 0, W, 22);
    ctx.fillStyle = '#8B6914';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧩', W / 2, 16);
    canvas.refresh();
  }

  /** Prelude: Nur + welcome message, then run starts with stage title, then jump instruction from top. */
  private startNurIntro() {
    const welcomeMessage =
      'مرحبًا بك في مدينة العلم…\nقد لا تكون الرحلة سهلة،\nلكنني سأكون معك في كل خطوة.';
    this.currentNoorMessage = { text: welcomeMessage };
    this.nurController.show('greet', {
      position: 'center',
      message: welcomeMessage
    });
    this.syncUI();

    // While Nur is greeting the player (5 seconds), finish heavy one-time setup
    // that is not required for the very first frame: VFX overlays, distant
    // event assets, etc. This keeps the second \"Start the adventure\" click
    // feeling responsive while still preparing the full experience.
    this.time.delayedCall(0, () => {
      this.createSandstormOverlay();
      this.createSandstormEmitter();
      this.createCinematicVignette();
      MagicCarpet.init(this);
      this.generateCarpetGateTexture();
    });

    this.time.delayedCall(4000, () => {
      this.nurController.hide();
      this.currentNoorMessage = null;
      this.syncUI();
      this.eventManager.eventPhase = 'INTRO_RUN';
      this.stageStartTime = this.time.now;
      this.baseSpeed = PHYSICS.RUN_SPEED_START ?? PHYSICS.RUN_SPEED;
      this.physics.resume();
      this.player.play('run');

      this.stageTitle = 'المرحلة 1 – طريق الصحراء';
      this.syncUI();
      this.time.delayedCall(2500, () => {
        this.stageTitle = null;
        this.syncUI();
        const jumpInstruction = 'اضغط للقفز وتجاوز العقبات!';
        this.currentNoorMessage = { text: jumpInstruction };
        this.nurController.show('greet', {
          position: 'top',
          message: jumpInstruction,
          animateFromTop: true
        });
        this.syncUI();
        this.time.delayedCall(4000, () => {
          this.currentNoorMessage = null;
          this.nurController.hide();
          this.syncUI();
        });
      });
    });
  }

  public recordCityStart(distance: number) {
    this.cityStartDistanceForStats = distance;
  }

  public recordCityStageStart() {
    this.cityStageStartTime = this.time.now;
  }

  public showDesertStageResults() {
    this.audioManager?.playStageSuccess();
    this.stageResults = {
      stageName: 'نهاية الصحراء',
      distance: this.runDistance,
      stars: this.collectedStarsCount,
      correctAnswers: this.correctAnswersCount,
      wrongAnswers: this.wrongAnswersCount,
      timeSeconds: (this.time.now - this.stageStartTime) / 1000
    };
    this.showNoorMessage('رائع! لقد أنهيت هذه المرحلة بنجاح.', false, 'success');
    this.pendingTransition = 'DESERT_END';
    this.syncUI();
  }

  public showLibraryStageResults() {
    this.audioManager?.stopBGM();
    this.audioManager?.playStageSuccess();
    const distInCity = this.runDistance - this.cityStartDistanceForStats;
    this.stageResults = {
      stageName: 'بيت الحكمة',
      distance: Math.max(0, distInCity),
      stars: this.collectedStarsCount,
      correctAnswers: this.correctAnswersCount,
      wrongAnswers: this.wrongAnswersCount,
      timeSeconds: (this.time.now - this.cityStageStartTime) / 1000
    };
    this.showNoorMessage('كل خطوة تقرّبك من نورٍ جديد.', false, 'success');
    this.pendingTransition = 'LIBRARY_END';
    this.syncUI();
  }

  public continueAfterStageResults() {
    if (this.pendingTransition === 'DESERT_END') {
      if (this.nurController) this.nurController.hide();
      this.eventManager.continueDesertTransition();
    } else if (this.pendingTransition === 'LIBRARY_END') {
      if (this.nurController) this.nurController.hide();
      this.beginFinalCinematicEnding();
      return;
    }
    this.stageResults = null;
    this.pendingTransition = null;
    this.syncUI();
  }

  private initializeState() {
    this.isGameOver = false;
    this.currentStage = 1;
    this.hearts = 3;
    this.runDistance = 0;
    this.collectedStarsCount = 0;
    this.comboCount = 0;
    this.comboTier = 1;
    // Reference is stale after scene.restart() destroys the old GameObject; let updateComboHud recreate.
    this.comboHudText = null;
    this.bondPoints = 0;
    this.bondTier = 0;
    this.bondHudBg = null;
    this.bondHudFill = null;
    this.bondHudLabel = null;
    this.speedLinesTop = null;
    this.speedLinesBottom = null;
    this.bridgeWindEmitter = null;
    this.bridgeOverlay = null;
    this.bridgeTint = null;
    this.bridgeBanners = [];
    this.bridgeBannerTimer = 0;
    this.baseSpeed = PHYSICS.RUN_SPEED_START ?? PHYSICS.RUN_SPEED;
    this.speedModifier = 1.0; 
    this.physics.world.timeScale = 1.0; 
    this.questionPool = getQuestions();
    
    this.guideFlags = { welcome: false, firstJump: false, firstGate: false };
    this.firstObstacleRef = null;
    
    this.activeQuestion = null;
    this.activeMessage = null;
    this.currentNoorMessage = null;
    this.isSoftPaused = false;
    this.climbProgress = 0;
    this.correctAnswersCount = 0;
    this.wrongAnswersCount = 0;
    this.stageResults = null;
    this.pendingTransition = null;
    this.stageTitle = null;
  }

  update(time: number, delta: number) {
    if (this.eventManager.eventPhase === 'NUR_INTRO') return;
    if (this.isGameOver) return;
    if (this.activeMessage || this.activeQuestion) return;
    if (this.isPausedMenu) return;

    // When storm is active, keep all obstacles/collectibles cleared so player cannot lose to obstacles
    const phase = this.eventManager.eventPhase;
    if (phase === 'SANDSTORM_ONSET' || phase === 'SANDSTORM_WALK' || phase === 'SANDSTORM_APPROACH') {
      this.spawnManager.removeAllSpawned();
      this.firstObstacleRef = null;
    }
    
    const timeScale = this.physics.world.timeScale;
    const scaledDelta = delta * timeScale; // * so that timeScale < 1 slows the game down 
    const dt = scaledDelta / 1000;

    this.updateSpeed(scaledDelta, dt);
    let currentSpeed = this.baseSpeed * this.speedModifier;
    if (this.environmentManager.getZone() === 'LIBRARY') {
      const libDist = this.environmentManager.getLibraryRunDistance();
      const rampMeters = 80;
      const startFactor = 0.6;
      const endFactor = 0.8;
      const t = Math.min(1, libDist / rampMeters);
      const factor = startFactor + (endFactor - startFactor) * t;
      currentSpeed *= factor;
    }
    // City section: slightly slower run (0.8x) for better readability and control
    if (this.currentStage >= 2 && this.environmentManager.getZone() === 'CITY') {
      currentSpeed *= 0.8;
    }
    const frameMove = (currentSpeed * dt); 

    if (currentSpeed > 0) {
        this.runDistance += frameMove * PROGRESS.DISTANCE_SCALE;
    }

    if ((phase === 'SANDSTORM_ONSET' || phase === 'SANDSTORM_WALK' || phase === 'SANDSTORM_APPROACH') && this.sandstormOverlay) {
        this.sandstormOverlay.tilePositionX += (currentSpeed * 0.2) + 25; 
    }
        
    this.environmentManager.update(time, scaledDelta, frameMove);
    this.player.update(time, scaledDelta);
    this.spawnManager.update(scaledDelta, frameMove, currentSpeed);
    this.eventManager.update(frameMove, scaledDelta);
    this.eventManager.handleEncounterPause(this.player.x);

    this.updateBridgeBanners(frameMove, scaledDelta);
    
    // Check dynamic overlaps (Carpet)
    this.collisionManager.checkDynamicOverlaps();

    this.checkGuidanceTriggers();

    if (this.cinematicVignette) {
        this.cinematicVignette.setVisible(this.eventManager.eventPhase === 'LEVEL_END_GATE');
    }

    if (time > this.lastUiUpdate + 100) {
        this.syncUI();
        this.lastUiUpdate = time;
    }
    
    // --- BOUNDS CHECK ---
    // If Flying, bounds are different
    if (!this.player.isFlying && this.player.y > this.scale.height + 50) {
        this.damagePlayer(true); 
    }
  }

  // ... (Rest of the file remains same, keeping methods to ensure full file content logic) ...
  public advanceStage() {
      this.currentStage++;
      this.baseSpeed = PHYSICS.RUN_SPEED + ((this.currentStage - 1) * 20); 
  }

  private createSandstormOverlay() {
      const { width, height } = this.scale;
      this.sandstormOverlay = this.add.tileSprite(width/2, height/2, width, height, 'sandstorm_overlay');
      this.sandstormOverlay.setScrollFactor(0);
      this.sandstormOverlay.setDepth(100); 
      this.sandstormOverlay.setAlpha(0); 
      this.sandstormOverlay.setBlendMode(Phaser.BlendModes.OVERLAY);
  }

  private createSandstormEmitter() {
      if (!this.textures.exists('wind_particle')) {
          const canvas = this.textures.createCanvas('wind_particle', 32, 4);
          if (canvas) {
              const ctx = canvas.context;
              const grd = ctx.createLinearGradient(0, 0, 32, 0);
              grd.addColorStop(0, 'rgba(255, 235, 200, 0)');
              grd.addColorStop(0.5, 'rgba(255, 235, 200, 0.8)');
              grd.addColorStop(1, 'rgba(255, 235, 200, 0)');
              ctx.fillStyle = grd;
              ctx.fillRect(0, 0, 32, 4);
              canvas.refresh();
          }
      }
      const { width, height } = this.scale;
      this.sandstormEmitter = this.add.particles(width + 50, 0, 'wind_particle', {
          y: { min: 0, max: height },
          speedX: { min: -1200, max: -800 },
          speedY: { min: -50, max: 50 },
          scaleX: { min: 1, max: 3 },
          scaleY: { min: 0.5, max: 1 },
          alpha: { start: 0.6, end: 0 },
          lifespan: 1500,
          quantity: 4,
          frequency: 50,
          blendMode: 'ADD',
          emitting: false
      });
      this.sandstormEmitter.setDepth(101); 
      this.sandstormEmitter.setScrollFactor(0);
  }

  private createCinematicVignette() {
      const { width, height } = this.scale;
      if (!this.textures.exists('cinematic_vignette')) {
          const w = 512;
          const h = 512;
          const canvas = this.textures.createCanvas('cinematic_vignette', w, h);
          if (canvas) {
              const ctx = canvas.context;
              const cx = w / 2;
              const cy = h / 2;
              const grd = ctx.createRadialGradient(cx, cy, w * 0.15, cx, cy, w * 0.7);
              grd.addColorStop(0, 'rgba(0,0,0,0)');
              grd.addColorStop(0.5, 'rgba(0,0,0,0.15)');
              grd.addColorStop(1, 'rgba(0,0,0,0.7)');
              ctx.fillStyle = grd;
              ctx.fillRect(0, 0, w, h);
              canvas.refresh();
          }
      }
      this.cinematicVignette = this.add.image(width / 2, height / 2, 'cinematic_vignette');
      this.cinematicVignette.setScrollFactor(0);
      this.cinematicVignette.setDepth(199);
      this.cinematicVignette.setVisible(false);
      this.cinematicVignette.setDisplaySize(width, height);
  }

  public triggerSandstormEffects(active: boolean) {
      if (active) this.sandstormEmitter.start(); else this.sandstormEmitter.stop();
  }

  public triggerDebris(active: boolean) {
      if (!this.debrisEmitter) this.createDebrisEmitter();
      if (active) this.debrisEmitter.start(); else this.debrisEmitter.stop();
  }

  private createDebrisEmitter() {
      if (!this.textures.exists('debris_chunk')) {
          const canvas = this.textures.createCanvas('debris_chunk', 16, 16);
          if (canvas) {
              const ctx = canvas.context;
              ctx.fillStyle = '#5d4037'; 
              ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(16, 6); ctx.lineTo(10, 16); ctx.lineTo(0, 10); ctx.fill();
              canvas.refresh();
          }
      }
      this.debrisEmitter = this.add.particles(0, 0, 'debris_chunk', {
          x: { min: 0, max: this.scale.width },
          y: -50,
          lifespan: 2000,
          speedY: { min: 400, max: 800 },
          speedX: { min: -100, max: 100 },
          scale: { min: 0.5, max: 1.5 },
          rotate: { min: 0, max: 360 },
          quantity: 2,
          frequency: 50,
          emitting: false
      });
      this.debrisEmitter.setDepth(102); 
      this.debrisEmitter.setScrollFactor(0);
  }

  public startSandstorm() {
      this.audioManager?.pauseBGM();
      this.audioManager?.startSandstorm();
      // If a question was open (chest encounter), clear it and resume physics so we don't get stuck
      this.clearQuestionAndResumePhysics();
      this.eventManager.isEncounterActive = false;
      this.eventManager.encounterType = 'NONE';
      this.eventManager.isEncounterOpening = false;

      this.tweens.add({ targets: this, speedModifier: 0.3, duration: 2000, ease: 'Power2' });
      this.tweens.add({ targets: this.sandstormOverlay, alpha: 0.8, duration: 2500, ease: 'Sine.easeInOut' });
      this.triggerSandstormEffects(true);
      this.player.startStruggle();
      // Remove all obstacles, stars, chests, lives, shields, etc. during sandstorm (none left on screen)
      this.spawnManager.removeAllSpawned();
      this.firstObstacleRef = null;
      this.eventManager.removeEncounterObjects();
      // Sandstorm warning – clearer that a sandstorm is coming
      this.showNoorMessage('انتبه… عاصفة رملية قادمة!', false, 'warning');
  }

  /** Clear question overlay and resume physics (e.g. when sandstorm interrupts a chest encounter). */
  public clearQuestionAndResumePhysics(): void {
      this.activeQuestion = null;
      if (this.physics.world.isPaused) this.physics.resume();
      this.player.anims.resume();
      this.syncUI();
  }

  public endSandstorm() {
      this.audioManager?.stopSandstorm();
      this.audioManager?.resumeBGM();
      this.tweens.add({ targets: this.sandstormOverlay, alpha: 0, duration: 2000, ease: 'Sine.easeInOut' });
      this.triggerSandstormEffects(false);
      this.tweens.add({ targets: this, speedModifier: 1.0, duration: 1000 });
  }

  private updateSpeed(delta: number, dt: number) {
      if (this.eventManager.eventPhase.startsWith('INTRO') || this.eventManager.eventPhase.startsWith('LEVEL')) return;

      if (!this.eventManager.isEncounterActive && this.eventManager.eventPhase === 'NONE') {
          if (this.speedModifierTimer > 0) {
              this.speedModifierTimer -= delta;
              if (this.speedModifierTimer <= 0) {
                  this.tweens.add({ targets: this, speedModifier: 1.0, duration: 1000 });
              }
          }
          const maxSpeed = PHYSICS.RUN_SPEED + (this.currentStage * 25);
          // Gradual speed increase with distance (first ~80m ramp from start to normal)
          const rampDistance = 80;
          const startSpeed = PHYSICS.RUN_SPEED_START ?? PHYSICS.RUN_SPEED;
          if (this.runDistance < rampDistance && this.baseSpeed < maxSpeed) {
              const t = Math.min(1, this.runDistance / rampDistance);
              const target = startSpeed + t * (PHYSICS.RUN_SPEED - startSpeed);
              if (this.baseSpeed < target) this.baseSpeed = Math.min(this.baseSpeed + dt * 8, target);
          } else if (this.baseSpeed < maxSpeed) {
              this.baseSpeed += dt * 1.5;
          }
      }
  }

  private checkGuidanceTriggers() {
      // Jump explanation only at the very beginning (intro); no repeat before first obstacle
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
      const width = gameSize.width;
      const height = gameSize.height;
      this.cameras.main.setViewport(0, 0, width, height);
      this.cameras.main.setZoom(getGameplayCameraZoom(width, height));
      this.environmentManager.resize(width, height);
      if (this.sandstormOverlay) {
          this.sandstormOverlay.setPosition(width/2, height/2);
          this.sandstormOverlay.setSize(width, height);
      }
      if (this.sandstormEmitter) {
          this.sandstormEmitter.setPosition(width + 50, 0);
      }
      if (this.nurController) {
          this.nurController.resize(width, height);
      }
      if (this.cinematicVignette) {
          this.cinematicVignette.setPosition(width / 2, height / 2);
          this.cinematicVignette.setDisplaySize(width, height);
      }
      if (this.player.y > height + 200 && !this.eventManager.eventPhase.startsWith('INTRO') && !this.player.isFlying) {
          this.player.y = getPlayerSpawnY(height);
          this.player.setVelocityY(0);
      }
      this.rebuildSpeedLines();
      if (this.comboHudText?.active) {
          this.comboHudText.x = width * COMBO.HUD_X_RATIO;
      }
  }

  private rebuildSpeedLines() {
      const currentTier = this.comboTier;
      if (this.speedLinesTop?.active) this.speedLinesTop.destroy();
      if (this.speedLinesBottom?.active) this.speedLinesBottom.destroy();
      this.speedLinesTop = null;
      this.speedLinesBottom = null;
      this.initSpeedLines();
      this.setSpeedLinesTier(currentTier);
  }

  private handleGlobalTap() {
      if (this.eventManager.eventPhase === 'NUR_INTRO') return;
      if (this.eventManager.eventPhase.startsWith('INTRO')) return;
      if (this.eventManager.eventPhase.startsWith('LEVEL')) return;

      if (this.isSoftPaused) {
          this.isSoftPaused = false;
          this.physics.world.timeScale = 1.0; 
          this.hideNoorMessage();
          this.player.setVelocityY(PHYSICS.JUMP_FORCE);
          return;
      }

      if (this.player.isHanging) {
          this.climbProgress += 15; 
          if (this.climbProgress > 100) this.climbProgress = 100;
          this.syncUI();
          this.tweens.add({ targets: this.player, y: this.player.y - 2, duration: 50, yoyo: true });
          if (this.climbProgress >= 100) {
              this.completeClimb();
          }
          return; 
      }
  }
  
  private completeClimb() {
      const targetY = this.player.y - 30; 
      this.player.climbUp(targetY, () => {
          this.climbProgress = 0;
          this.eventManager.eventPhase = 'RECOVERY';
          this.showNoorMessage("أحسنت! ذلك كان وشيكاً! 😅", false, 'encourage');
          this.time.delayedCall(1000, () => {
              this.setGameSpeed(1.0);
              this.eventManager.eventPhase = 'NONE';
          });
      });
  }
  
  public setGameSpeed(modifier: number) {
      this.speedModifier = modifier;
  }
  
  public getGameSpeed(): number {
      return this.speedModifier;
  }

  /** Called by Player when they execute a jump – dismiss first-jump soft pause so we never slow again. */
  public onPlayerJump(): void {
      if (this.isSoftPaused && this.currentNoorMessage?.isSoftPause) {
          this.isSoftPaused = false;
          this.physics.world.timeScale = 1.0;
          this.hideNoorMessage();
      }
  }

  public getRunDistance(): number { return this.runDistance; }
  public getCurrentStage(): number { return this.currentStage; }
  /** City-stage start distance (meters); used to compute distance run in Stage 2. */
  public getCityStartDistance(): number { return this.cityStartDistanceForStats; }
  
  public addScore(amount: number) {
      this.collectedStarsCount += amount;
  }

  /**
   * Skill depth — Sub-slice 2 entry point. Called by Obstacle when it passes the player
   * without overlap. Increments combo (any clean clear) and fires near-miss juice when
   * the player threaded the gap.
   */
  public onObstacleCleared(wasNearMiss: boolean, x: number, y: number, obstacle?: Phaser.GameObjects.Sprite) {
      if (this.isGameOver || this.isPausedMenu) return;
      if (this.eventManager?.eventPhase === 'STAGE_2_INTRO' || this.eventManager?.eventPhase === 'LEVEL_TRANSITION') return;

      this.bumpCombo();
      this.addBondPoints(wasNearMiss ? NOOR_BOND_REWARDS.NEAR_MISS : NOOR_BOND_REWARDS.CLEAN_CLEAR);

      if (wasNearMiss) this.fireNearMissJuice(x, y, obstacle);
  }

  /**
   * Single source of truth for combo +1. Updates state, refreshes HUD, and awards a bond
   * milestone if the tier just crossed up.
   */
  private bumpCombo() {
      const prevTier = this.comboTier;
      this.comboCount += 1;
      this.comboTier = this.computeComboTier(this.comboCount);
      const tierChanged = this.comboTier !== prevTier;
      this.updateComboHud(tierChanged);
      this.player?.setComboAuraTier?.(this.comboTier);
      if (tierChanged) this.setSpeedLinesTier(this.comboTier);
      if (tierChanged && this.comboTier > prevTier) {
          this.addBondPoints(NOOR_BOND_REWARDS.COMBO_TIER_UP);
          this.hitStop(HITSTOP.TIER_UP_MS, HITSTOP.TIER_UP_SCALE);
      }
  }

  /** Map combo count → tier index (1-based). */
  private computeComboTier(count: number): number {
      if (count >= COMBO.TIER_4_AT) return 4;
      if (count >= COMBO.TIER_3_AT) return 3;
      if (count >= COMBO.TIER_2_AT) return 2;
      return 1;
  }

  private getComboMultiplier(): number {
      return COMBO.MULTIPLIERS[this.comboTier - 1];
  }

  /** Called from damagePlayer when the player actually takes damage. */
  private resetCombo() {
      if (this.comboCount === 0) return;
      this.comboCount = 0;
      this.comboTier = 1;
      this.updateComboHud(false);
      this.player?.setComboAuraTier?.(1);
      this.setSpeedLinesTier(1);
  }

  private updateComboHud(tierChanged: boolean) {
      // Drop stale reference if the previous Text was destroyed by scene.restart() — its internal
      // texture is gone and calling setText on it crashes Phaser's renderer.
      if (this.comboHudText && !this.comboHudText.active) {
          this.comboHudText = null;
      }
      if (!this.comboHudText) {
          this.comboHudText = this.add.text(
              this.scale.width * COMBO.HUD_X_RATIO, COMBO.HUD_Y, '',
              { fontFamily: 'Cairo', fontSize: '32px', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 }
          ).setOrigin(0.5, 0.5).setDepth(500).setScrollFactor(0);
      } else {
          // Keep centered if the canvas was resized (orientation change on mobile).
          this.comboHudText.x = this.scale.width * COMBO.HUD_X_RATIO;
      }
      if (this.comboTier < 2) {
          this.comboHudText.setVisible(false);
          this.comboHudText.setText('');
          return;
      }
      this.comboHudText.setVisible(true);
      this.comboHudText.setText(`COMBO ×${this.getComboMultiplier()}`);
      this.comboHudText.setColor(COMBO.TIER_COLORS[this.comboTier - 1]);
      this.tweens.killTweensOf(this.comboHudText);
      const pulseScale = tierChanged ? COMBO.TIER_UP_PULSE_SCALE : COMBO.TICK_PULSE_SCALE;
      const pulseMs = tierChanged ? COMBO.TIER_UP_PULSE_MS : COMBO.TICK_PULSE_MS;
      this.comboHudText.setScale(1);
      this.tweens.add({
          targets: this.comboHudText,
          scale: { from: pulseScale, to: 1 },
          duration: pulseMs,
          ease: tierChanged ? 'Back.easeOut' : 'Sine.easeOut',
      });
  }

  /**
   * Skill depth — Sub-slice 1: Near-miss juice (slow-mo, zoom punch, tint, audio, +bonus).
   * Bonus is multiplied by the current combo multiplier (sub-slice 2).
   */
  private fireNearMissJuice(x: number, y: number, obstacle?: Phaser.GameObjects.Sprite) {
      const multiplier = this.getComboMultiplier();
      const bonus = SKILL.NEAR_MISS_BONUS * multiplier;

      this.addScore(bonus);

      const anchorX = this.player ? this.player.x - 20 : x + 40;
      const label = multiplier > 1 ? `+${bonus} NEAR ×${multiplier}` : `+${bonus} NEAR`;
      const nearText = this.add.text(anchorX, y - 60, label, {
          fontFamily: 'Cairo', fontSize: '14px', fontStyle: 'bold',
          color: COMBO.TIER_COLORS[this.comboTier - 1], stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(400).setAlpha(0.9);
      this.tweens.add({ targets: nearText, y: y - 100, alpha: 0, duration: 700, onComplete: () => nearText.destroy() });

      if (obstacle) {
          const sprite = obstacle as Phaser.GameObjects.Sprite & {
              setTint?: (color: number) => void;
              clearTint?: () => void;
          };
          sprite.setTint?.(0x00f2ff);
          this.time.delayedCall(180, () => {
              sprite.clearTint?.();
          });
      }

      this.cameras.main.shake(
          SKILL.NEAR_MISS_SHAKE_MS,
          new Phaser.Math.Vector2(SKILL.NEAR_MISS_SHAKE_INTENSITY_X, 0),
      );

      this.audioManager?.playStarPitched(COMBO.TIER_DETUNE[this.comboTier - 1]);
  }

  private hitStop(durationMs: number, scale: number) {
      const prevSpeed = this.getGameSpeed();
      const target = prevSpeed * scale;
      this.setGameSpeed(target);
      this.time.delayedCall(durationMs, () => {
          if (this.getGameSpeed() === target) this.setGameSpeed(prevSpeed);
      });
  }

  private initSpeedLines() {
      const TEX_KEY = 'speed_streak';
      if (!this.textures.exists(TEX_KEY)) {
          const canvas = this.textures.createCanvas(TEX_KEY, SPEED_LINES.STREAK_W, SPEED_LINES.STREAK_H);
          if (canvas) {
              const ctx = canvas.context;
              const grad = ctx.createLinearGradient(0, 0, SPEED_LINES.STREAK_W, 0);
              grad.addColorStop(0, 'rgba(255,255,255,0)');
              grad.addColorStop(0.4, 'rgba(255,255,255,0.9)');
              grad.addColorStop(1, 'rgba(255,255,255,0)');
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, SPEED_LINES.STREAK_W, SPEED_LINES.STREAK_H);
              canvas.refresh();
          }
      }

      const W = this.scale.width;
      const H = this.scale.height;
      const bandHeight = H * SPEED_LINES.BAND_HEIGHT_RATIO;
      const topCenter = H * SPEED_LINES.TOP_BAND_RATIO;
      const botCenter = H * SPEED_LINES.BOTTOM_BAND_RATIO;

      const makeEmitter = (centerY: number) =>
          this.add.particles(0, 0, TEX_KEY, {
              x: W + 60,
              y: { min: centerY - bandHeight / 2, max: centerY + bandHeight / 2 },
              speedX: { min: SPEED_LINES.STREAK_SPEED_MIN, max: SPEED_LINES.STREAK_SPEED_MAX },
              lifespan: SPEED_LINES.STREAK_LIFESPAN_MS,
              alpha: { start: 0.55, end: 0 },
              scaleX: { min: 0.6, max: 1.4 },
              scaleY: { min: 0.8, max: 1.2 },
              quantity: 1,
              frequency: -1,
              emitting: false,
          }).setDepth(15).setScrollFactor(0);

      this.speedLinesTop = makeEmitter(topCenter);
      this.speedLinesBottom = makeEmitter(botCenter);
  }

  /**
   * Bridge wind set-piece — visual dust streaks while BRIDGE_WIND phase is active.
   * Reuses the speed_streak texture from speed lines for consistency. Called by
   * EventManager when entering/exiting the phase.
   */
  public setBridgeWindActive(active: boolean) {
      const W = this.scale.width;
      const H = this.scale.height;

      if (active) {
          // Entry telegraphing — bigger shake + longer hit-stop for clear cinematic moment.
          this.cameras.main.shake(
              BRIDGE_WIND.ENTRY_SHAKE_MS,
              new Phaser.Math.Vector2(0, BRIDGE_WIND.ENTRY_SHAKE_INTENSITY),
          );
          this.hitStop(BRIDGE_WIND.ENTRY_HITSTOP_MS, BRIDGE_WIND.ENTRY_HITSTOP_SCALE);
          this.audioManager?.playStarPitched(-400);

          if (!this.textures.exists('speed_streak')) this.initSpeedLines();

          // Full-screen tint — immediate atmospheric shift
          if (!this.bridgeTint) {
              this.bridgeTint = this.add.graphics().setDepth(7).setScrollFactor(0);
          }
          this.bridgeTint.clear();
          this.bridgeTint.fillStyle(BRIDGE_WIND.TINT_COLOR, BRIDGE_WIND.TINT_ALPHA);
          this.bridgeTint.fillRect(0, 0, W, H);
          this.bridgeTint.setAlpha(0);
          this.tweens.add({ targets: this.bridgeTint, alpha: 1, duration: 280 });

          // Dust streaks — high density
          if (!this.bridgeWindEmitter) {
              this.bridgeWindEmitter = this.add.particles(0, 0, 'speed_streak', {
                  x: W + 60,
                  y: { min: H * 0.10, max: H * 0.90 },
                  speedX: { min: BRIDGE_WIND.DUST_PARTICLE_SPEED_X_MIN, max: BRIDGE_WIND.DUST_PARTICLE_SPEED_X_MAX },
                  lifespan: BRIDGE_WIND.DUST_PARTICLE_LIFESPAN_MS,
                  alpha: { start: 0.85, end: 0 },
                  scaleX: { min: 1.1, max: 2.0 },
                  scaleY: { min: 0.8, max: 1.2 },
                  quantity: 3,
                  frequency: BRIDGE_WIND.DUST_PARTICLE_EMIT_MS,
                  emitting: false,
              }).setDepth(14).setScrollFactor(0);
          }
          this.bridgeWindEmitter.start();

          // Stone band overlay — thick + textured stripe at ground level
          if (!this.bridgeOverlay) {
              this.bridgeOverlay = this.add.graphics().setDepth(9).setScrollFactor(0);
          }
          this.drawBridgeOverlay();
          this.bridgeOverlay.setAlpha(0);
          this.tweens.add({ targets: this.bridgeOverlay, alpha: 1, duration: 280 });

          this.bridgeBannerTimer = 0;
          // Spawn an entry pillar marker so the player has a clear "gate" they pass through
          this.spawnBridgeEntryPillar();
      } else {
          if (this.bridgeWindEmitter?.active) this.bridgeWindEmitter.stop();
          if (this.bridgeOverlay?.active) {
              this.tweens.add({ targets: this.bridgeOverlay, alpha: 0, duration: 400 });
          }
          if (this.bridgeTint?.active) {
              this.tweens.add({ targets: this.bridgeTint, alpha: 0, duration: 400 });
          }
      }
  }

  private drawBridgeOverlay() {
      if (!this.bridgeOverlay) return;
      const W = this.scale.width;
      const H = this.scale.height;
      const groundY = getPlayerSpawnY(H) + 39;
      const h = BRIDGE_WIND.OVERLAY_HEIGHT;
      const top = groundY - h / 2;
      this.bridgeOverlay.clear();
      // Base fill (warm stone)
      this.bridgeOverlay.fillStyle(BRIDGE_WIND.OVERLAY_COLOR, BRIDGE_WIND.OVERLAY_ALPHA);
      this.bridgeOverlay.fillRect(0, top, W, h);
      // Top + bottom edges darker for definition
      this.bridgeOverlay.fillStyle(0x2a2018, 0.75);
      this.bridgeOverlay.fillRect(0, top, W, 3);
      this.bridgeOverlay.fillRect(0, top + h - 3, W, 3);
      // Repeating stripe pattern across the band — gives a "stone tile" feel
      this.bridgeOverlay.fillStyle(0x2a2018, 0.4);
      for (let x = 0; x < W; x += 48) {
          this.bridgeOverlay.fillRect(x, top + 4, 2, h - 8);
      }
  }

  private spawnBridgeEntryPillar() {
      const TEX_KEY = 'bridge_entry_pillar';
      if (!this.textures.exists(TEX_KEY)) {
          const w = BRIDGE_WIND.ENTRY_PILLAR_WIDTH;
          const h = BRIDGE_WIND.ENTRY_PILLAR_HEIGHT;
          const canvas = this.textures.createCanvas(TEX_KEY, w, h);
          if (canvas) {
              const ctx = canvas.context;
              // Pillar body
              ctx.fillStyle = '#6b5a4a';
              ctx.fillRect(0, 8, w, h - 8);
              // Cap top
              ctx.fillStyle = '#3a2f24';
              ctx.fillRect(-2, 0, w + 4, 12);
              // Darker shading line down center-right
              ctx.fillStyle = '#3a2f24';
              ctx.fillRect(w - 6, 8, 2, h - 8);
              // Highlight line on left
              ctx.fillStyle = '#8a7a6a';
              ctx.fillRect(2, 10, 2, h - 12);
              canvas.refresh();
          }
      }

      const H = this.scale.height;
      const groundY = getPlayerSpawnY(H) + 39;
      const pillar = this.add.sprite(this.scale.width + 40, groundY, TEX_KEY);
      pillar.setOrigin(0.5, 1).setDepth(13);
      // Flag on top of pillar
      if (this.textures.exists('bridge_banner')) {
          const flag = this.add.sprite(pillar.x + 6, groundY - BRIDGE_WIND.ENTRY_PILLAR_HEIGHT + 18, 'bridge_banner');
          flag.setOrigin(0.5, 0).setDepth(13).setScale(0.8);
          this.tweens.add({
              targets: flag,
              scaleX: { from: 0.8, to: 0.6 },
              duration: 280,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
          });
          // Attach flag to pillar by pushing it through the same banner pool for scroll + cleanup
          this.bridgeBanners.push(flag);
      }
      this.bridgeBanners.push(pillar);
  }

  /** Generate a small banner-on-pole placeholder sprite and spawn at right edge. Caller pushes it
   *  into bridgeBanners and scrolls each frame. */
  private spawnBridgeBanner() {
      const TEX_KEY = 'bridge_banner';
      if (!this.textures.exists(TEX_KEY)) {
          const w = 28;
          const h = 88;
          const canvas = this.textures.createCanvas(TEX_KEY, w, h);
          if (canvas) {
              const ctx = canvas.context;
              // Pole
              ctx.fillStyle = '#3a2f24';
              ctx.fillRect(w / 2 - 1, 0, 2, h);
              // Flag — simple trapezoid
              ctx.fillStyle = `#${BRIDGE_WIND.BANNER_FLAG_COLOR.toString(16).padStart(6, '0')}`;
              ctx.beginPath();
              ctx.moveTo(w / 2, 6);
              ctx.lineTo(w - 1, 12);
              ctx.lineTo(w - 5, 26);
              ctx.lineTo(w / 2, 32);
              ctx.closePath();
              ctx.fill();
              canvas.refresh();
          }
      }

      const H = this.scale.height;
      const groundY = getPlayerSpawnY(H) + 39;
      const banner = this.add.sprite(this.scale.width + 30, groundY - 44, TEX_KEY);
      banner.setOrigin(0.5, 1).setDepth(12);
      // Subtle flap tween via x-scale wobble
      this.tweens.add({
          targets: banner,
          scaleX: { from: 1, to: 0.85 },
          duration: 320,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
      });
      this.bridgeBanners.push(banner);
  }

  private updateBridgeBanners(frameMove: number, delta: number) {
      if (this.eventManager?.eventPhase === 'BRIDGE_WIND') {
          this.bridgeBannerTimer += delta;
          if (this.bridgeBannerTimer >= BRIDGE_WIND.BANNER_SPAWN_INTERVAL_MS) {
              this.spawnBridgeBanner();
              this.bridgeBannerTimer = 0;
          }
      }
      for (let i = this.bridgeBanners.length - 1; i >= 0; i--) {
          const banner = this.bridgeBanners[i];
          if (!banner.active) {
              this.bridgeBanners.splice(i, 1);
              continue;
          }
          banner.x -= frameMove;
          if (banner.x < -50) {
              this.tweens.killTweensOf(banner);
              banner.destroy();
              this.bridgeBanners.splice(i, 1);
          }
      }
  }

  private setSpeedLinesTier(tier: number) {
      const idx = Math.max(0, Math.min(3, tier - 1));
      const alphaMax = SPEED_LINES.TIER_ALPHA_MAX[idx];
      const freq = SPEED_LINES.TIER_FREQUENCY_MS[idx];

      for (const em of [this.speedLinesTop, this.speedLinesBottom]) {
          if (!em || !em.active) continue;
          if (alphaMax <= 0 || freq <= 0) {
              em.stop();
              continue;
          }
          em.frequency = freq;
          // alpha range is fixed at init; tier intensity comes from emit frequency.
          em.start();
      }
  }

  /**
   * Skill depth — Sub-slice 3: perfect-jump apex bonus.
   * Called by Player when the user taps jump inside the apex velocity window (once per arc).
   * Counts as a clean clear (feeds combo), awards score scaled by combo, plays gold ring + chime.
   */
  public onPerfectJump(x: number, y: number) {
      if (this.isGameOver || this.isPausedMenu) return;
      if (this.eventManager?.eventPhase === 'STAGE_2_INTRO' || this.eventManager?.eventPhase === 'LEVEL_TRANSITION') return;

      this.bumpCombo();
      this.addBondPoints(NOOR_BOND_REWARDS.PERFECT_JUMP);

      const multiplier = this.getComboMultiplier();
      const bonus = PERFECT_JUMP.BONUS * multiplier;
      this.addScore(bonus);

      const label = multiplier > 1 ? `+${bonus} PERFECT ×${multiplier}` : `+${bonus} PERFECT`;
      const txt = this.add.text(x, y - 50, label, {
          fontFamily: 'Cairo', fontSize: '14px', fontStyle: 'bold',
          color: '#ffd700', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(400).setAlpha(0.95);
      this.tweens.add({ targets: txt, y: y - 90, alpha: 0, duration: 700, onComplete: () => txt.destroy() });

      if (this.textures.exists('dust_particle')) {
          const emitter = this.add.particles(x, y, 'dust_particle', {
              lifespan: PERFECT_JUMP.PARTICLE_LIFESPAN_MS,
              speed: { min: PERFECT_JUMP.PARTICLE_SPEED_MIN, max: PERFECT_JUMP.PARTICLE_SPEED_MAX },
              angle: { min: 0, max: 360 },
              scale: { start: 0.9, end: 0 },
              alpha: { start: 1, end: 0 },
              tint: PERFECT_JUMP.PARTICLE_COLOR,
              quantity: PERFECT_JUMP.PARTICLE_COUNT,
              emitting: false,
          });
          emitter.setDepth(399);
          emitter.explode(PERFECT_JUMP.PARTICLE_COUNT);
          this.time.delayedCall(PERFECT_JUMP.PARTICLE_LIFESPAN_MS + 60, () => emitter.destroy());
      }

      this.cameras.main.shake(
          PERFECT_JUMP.SHAKE_MS,
          new Phaser.Math.Vector2(0, PERFECT_JUMP.SHAKE_INTENSITY_Y),
      );
      this.hitStop(HITSTOP.PERFECT_JUMP_MS, HITSTOP.PERFECT_JUMP_SCALE);

      this.audioManager?.playStarPitched(PERFECT_JUMP.DETUNE);
  }

  /**
   * Skill depth — Sub-slice 4: Noor bond meter.
   * Accumulates points across the run. Damage does NOT decrement (progression only goes up
   * per the design spec). Crossing a tier threshold fires onBondTierUp which currently just
   * surfaces a notification; slice 5 will wire cosmetics, passives, and Nur dialogue.
   */
  private addBondPoints(amount: number) {
      if (amount <= 0) return;
      if (this.isGameOver || this.isPausedMenu) return;
      this.bondPoints += amount;
      this.bondTier = getBondTier(this.bondPoints);
      // HUD render + tier-up notification suppressed pending Yahia's redesign — data still accumulates.
  }

  /**
   * Slice 4 scaffold: floating notification only. Slice 5 will resolve the tier's
   * cosmeticKey, passiveKey, and dialogue (see data/noorBond.ts) into actual gameplay effects.
   */
  private onBondTierUp(newTier: number) {
      const def = getBondTierDef(newTier);
      if (!def) return;
      const x = this.scale.width / 2;
      const y = BOND_HUD.Y + 30;
      const txt = this.add.text(x, y, def.label, {
          fontFamily: 'Cairo', fontSize: '22px', fontStyle: 'bold',
          color: '#ffd700', stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5, 0.5).setDepth(500).setScrollFactor(0);
      this.tweens.add({
          targets: txt,
          scale: { from: 0.5, to: 1.0 },
          duration: 320,
          ease: 'Back.easeOut',
      });
      this.tweens.add({
          targets: txt,
          alpha: 0,
          y: y + 40,
          delay: 1200,
          duration: 600,
          onComplete: () => txt.destroy(),
      });
      this.audioManager?.playStarPitched(800);
  }

  private updateBondHud() {
      const x = this.scale.width / 2;
      const y = BOND_HUD.Y;
      const w = BOND_HUD.WIDTH;
      const h = BOND_HUD.HEIGHT;

      // Drop stale refs after scene.restart()
      if (this.bondHudBg && !this.bondHudBg.active) this.bondHudBg = null;
      if (this.bondHudFill && !this.bondHudFill.active) this.bondHudFill = null;
      if (this.bondHudLabel && !this.bondHudLabel.active) this.bondHudLabel = null;

      if (!this.bondHudBg) {
          this.bondHudBg = this.add.graphics().setDepth(498).setScrollFactor(0);
      }
      if (!this.bondHudFill) {
          this.bondHudFill = this.add.graphics().setDepth(499).setScrollFactor(0);
      }
      if (!this.bondHudLabel) {
          this.bondHudLabel = this.add.text(x, y, '', {
              fontFamily: 'Cairo', fontSize: `${BOND_HUD.LABEL_SIZE}px`, fontStyle: 'bold',
              color: '#ffffff', stroke: '#000', strokeThickness: 2,
          }).setOrigin(0.5, 0.5).setDepth(500).setScrollFactor(0);
      }

      // Compute fill ratio within the current tier (banked points → next threshold)
      const floor = getCurrentTierFloor(this.bondTier);
      const ceil = getNextTierThreshold(this.bondTier);
      const ratio = ceil === null
          ? 1
          : Math.max(0, Math.min(1, (this.bondPoints - floor) / (ceil - floor)));

      // Background
      this.bondHudBg.clear();
      this.bondHudBg.fillStyle(BOND_HUD.BG_COLOR, 0.75);
      this.bondHudBg.fillRect(x - w / 2, y - h / 2, w, h);
      this.bondHudBg.lineStyle(BOND_HUD.BORDER_WIDTH, BOND_HUD.BORDER_COLOR, 0.7);
      this.bondHudBg.strokeRect(x - w / 2, y - h / 2, w, h);

      // Fill
      this.bondHudFill.clear();
      const innerW = (w - BOND_HUD.PADDING * 2) * ratio;
      const innerH = h - BOND_HUD.PADDING * 2;
      this.bondHudFill.fillStyle(BOND_HUD.FILL_COLOR, 1);
      if (innerW > 0) {
          this.bondHudFill.fillRect(x - w / 2 + BOND_HUD.PADDING, y - h / 2 + BOND_HUD.PADDING, innerW, innerH);
      }

      // Label
      const labelText = ceil === null
          ? `BOND • MAX • ${this.bondPoints}`
          : `BOND • T${this.bondTier} • ${this.bondPoints}/${ceil}`;
      this.bondHudLabel.setText(labelText);
      this.bondHudLabel.x = x;
      this.bondHudLabel.y = y;
  }

  public addHeart(): boolean {
      if (this.hearts < 5) {
          this.hearts++;
          return true;
      }
      return false;
  }

  public replenishHealth() {
      const diff = 5 - this.hearts;
      if (diff > 0) {
          let count = 0;
          this.time.addEvent({
              delay: 300,
              repeat: diff - 1,
              callback: () => {
                  this.addHeart();
                  count++;
                  this.showFloatingText(this.player.x, this.player.y - 50 - (count*20), "❤", '#ff4d4d');
              }
          });
          this.addHeart();
          this.showFloatingText(this.player.x, this.player.y - 50, "❤", '#ff4d4d');
      }
  }

  public damagePlayer(fatal: boolean = false) {
      // Only skip damage during cinematic intros (Nur intro, city intro), not during desert run (INTRO_RUN)
      if (this.eventManager.eventPhase === 'NUR_INTRO') return;
      if (this.eventManager.eventPhase === 'STAGE_2_INTRO') return;
      if (this.eventManager.eventPhase.startsWith('LEVEL')) return;

      // Combo chain: actual damage breaks the chain (shield blocks do not — those are filtered upstream).
      this.resetCombo();

      if (fatal) {
          this.hearts = 0;
          this.gameOver();
          return;
      }
      this.audioManager?.playDamage();
      this.hearts--;
      if (this.hearts <= 0) this.gameOver();
  }

  public showFloatingText(x: number, y: number, text: string, color: string = '#ffd700') {
      const txt = this.add.text(x, y, text, {
          fontFamily: 'Cairo', fontSize: '24px', fontStyle: 'bold', color: color, stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);
      this.tweens.add({ targets: txt, y: y - 50, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
  }

  /** Show Nur and the message together. Pass optional NurState for expression; defaults to 'greet'. */
  public showNoorMessage(text: string, isSoftPause: boolean = false, nurState: NurState = 'greet') {
      if (this.currentNoorMessage && !isSoftPause && this.currentNoorMessage.isSoftPause) return;
      if (this.messageTimer) this.messageTimer.remove();

      this.currentNoorMessage = { text, isSoftPause };
      if (this.nurController) {
          this.nurController.show(nurState, { position: 'top' });
      }
      // Nur voice / sound effect matched to her current expression.
      this.audioManager?.playNurVoice(nurState);
      if (isSoftPause) {
          this.isSoftPaused = true;
          this.physics.world.timeScale = 0.15; // Slow down so player can read the jump hint (first time only)
      } else {
          const duration = this.eventManager.eventPhase.startsWith('INTRO') || this.eventManager.eventPhase.startsWith('LEVEL') ? 4000 : 3000;
          this.messageTimer = this.time.delayedCall(duration, () => this.hideNoorMessage());
      }
      this.syncUI();
  }

  public hideNoorMessage() {
      this.currentNoorMessage = null;
      if (this.nurController) this.nurController.hide();
      this.syncUI();
  }

  public pauseGameplayForQuestion(specificId?: string) {
      this.speedModifier = 0; 
      this.player.anims.pause();
      if (this.physics.world.isPaused === false) {
           this.physics.pause();
           this.hideNoorMessage();
           this.showQuestionUI(specificId);
      }
  }

  private showQuestionUI(specificId?: string) {
      if (this.activeQuestion) return;
      let question: Question | undefined;
      if (specificId) {
          const allQuestions = getQuestions();
          question = allQuestions.find(q => q.id === specificId);
      }
      if (!question) {
          if (this.questionPool.length === 0) this.questionPool = getQuestions();
          question = this.questionPool.pop();
      }
      if (question) {
          this.activeQuestion = question;
          this.syncUI();
      }
  }

  public resumeGameFromNoor(isCorrect: boolean) {
      if (isCorrect) {
          this.audioManager?.playPuzzleCorrect();
          this.cameras.main.flash(220, 255, 220, 120);
          this.correctAnswersCount++;
          this.addBondPoints(NOOR_BOND_REWARDS.QUIZ_CORRECT);
          this.activeQuestion = null;
          this.eventManager.isEncounterOpening = true;
          this.showNoorMessage('أحسنت! استمر، أنت تتقدم.', false, 'encourage');
          this.syncUI();

          if (this.eventManager.encounterType === 'GATE' && this.eventManager.currentGate) {
              this.eventManager.currentGate.open();
              this.handlePostAnswerDelay(false);
          } else if (this.eventManager.encounterType === 'CHEST' && this.eventManager.currentChest) {
              this.eventManager.currentChest.open(() => {
                  const reward = Phaser.Math.Between(5, 20);
                  this.addScore(reward);
                  this.showFloatingText(this.player.x, this.player.y - 100, `+${reward} نجمة!`, '#ffd700');
                  this.handlePostAnswerDelay(false);
              });
          }
      } else {
          this.audioManager?.playDamage();
          this.cameras.main.shake(180, 0.014);
          this.showNoorMessage('حاول مرة أخرى.', false, 'warning');
          this.wrongAnswersCount++;
          this.syncUI();
      }
  }

  private handlePostAnswerDelay(advanceStage: boolean) {
      this.time.delayedCall(1000, () => {
         this.physics.resume();
         this.player.anims.resume();
         this.speedModifier = 1.0; 
         
         this.time.delayedCall(3000, () => {
             this.eventManager.isEncounterActive = false;
             this.eventManager.encounterType = 'NONE';
             this.eventManager.eventPhase = 'NONE';
             
             if (this.eventManager.currentGate) { this.eventManager.currentGate.destroy(); this.eventManager.currentGate = null; }
             if (this.eventManager.currentChest) { this.eventManager.currentChest.destroy(); this.eventManager.currentChest = null; }
         });
      });
  }

  public dismissMessage() {
      this.activeMessage = null;
      this.physics.resume();
      this.player.play('run');
      this.syncUI();
  }

  // --- MINI PUZZLES (Storm / Library / Dual Path) ---

  /** Show a short puzzle overlay and pause gameplay softly. */
  public showPuzzle(puzzle: ActivePuzzle) {
      // Avoid stacking puzzles
      if (this.activePuzzle) return;
      this.activePuzzle = puzzle;
      this.speedModifier = 0;
      this.player.anims.pause();
      if (!this.physics.world.isPaused) {
          this.physics.pause();
      }
      this.syncUI();

      if (this.puzzleTimer) this.puzzleTimer.remove();
      this.puzzleTimer = this.time.delayedCall(puzzle.timeoutMs, () => {
          if (this.activePuzzle === puzzle) {
              this.resolvePuzzle(false);
          }
      });
  }

  /** Called from React when player taps a puzzle option. */
  public resolvePuzzleAnswer(selectedIndex: number) {
      if (!this.activePuzzle) return;
      const isCorrect = selectedIndex === this.activePuzzle.correctIndex;
      this.resolvePuzzle(isCorrect);
  }

  private resolvePuzzle(isCorrect: boolean) {
      const puzzle = this.activePuzzle;
      this.activePuzzle = null;
      if (this.puzzleTimer) {
          this.puzzleTimer.remove();
          this.puzzleTimer = null;
      }

      // --- Clear feedback for all puzzles: sound + visual ---
      if (isCorrect) {
          this.audioManager?.playPuzzleCorrect();
          this.cameras.main.flash(220, 255, 220, 120);
      } else {
          this.audioManager?.playDamage();
          this.cameras.main.shake(180, 0.014);
      }

      if (puzzle) {
          switch (puzzle.type) {
              case 'STORM':
                  if (isCorrect) {
                      this.addScore(10);
                      this.showFloatingText(this.player.x, this.player.y - 80, '+١٠ نجمة', '#ffd700');
                  }
                  break;
              case 'LIBRARY':
                  if (isCorrect) {
                      this.addScore(20);
                      this.showFloatingText(this.scale.width / 2, this.scale.height / 2 - 80, '+٢٠ نجمة', '#ffd700');
                  }
                  break;
              case 'DUAL_PATH':
                  if (isCorrect) {
                      this.addScore(15);
                      this.showFloatingText(this.player.x, this.player.y - 80, '+١٥ نجمة', '#ffd700');
                  }
                  break;
              case 'CARPET_GATE':
                  this.eventManager.finishCarpetGatePuzzle(isCorrect);
                  if (isCorrect) {
                      this.showNoorMessage('أحسنت! 🎉', false, 'success');
                  } else {
                      this.showNoorMessage('حاول مرة أخرى.', false, 'warning');
                  }
                  this.physics.resume();
                  this.player.anims.resume();
                  this.speedModifier = 1.0;
                  this.syncUI();
                  return;
              case 'BRIDGE_BOX':
                  if (isCorrect) {
                      this.addScore(15);
                      this.showFloatingText(this.player.x, this.player.y - 80, '+١٥ نجمة', '#ffd700');
                  }
                  break;
          }
      }

      if (isCorrect) {
          this.showNoorMessage('أحسنت! 🎉', false, 'success');
      } else {
          this.showNoorMessage('حاول مرة أخرى.', false, 'warning');
      }

      this.eventManager.reportPuzzleResolved(isCorrect);
      this.physics.resume();
      this.player.anims.resume();
      this.speedModifier = 1.0;
      this.syncUI();
  }

  private syncUI() {
      const progressPercent = this.getStageProgressPercent();
      this.onScoreUpdate({
          distance: this.runDistance,
          stars: this.collectedStarsCount,
          hearts: this.hearts,
          isGameOver: this.isGameOver,
          activeQuestion: this.activeQuestion || undefined,
          activeMessage: this.activeMessage || undefined,
          noorMessage: this.currentNoorMessage,
          isHanging: this.player?.isHanging || false,
          climbProgress: this.climbProgress,
          stageResults: this.stageResults || undefined,
          stageProgressPercent: progressPercent,
          currentStage: this.currentStage,
          stageTitle: this.stageTitle === null ? null : this.stageTitle,
          soundEnabled: this.getSoundEnabled(),
          musicEnabled: this.getMusicEnabled(),
          activePuzzle: this.activePuzzle,
          isPaused: this.isPausedMenu
      });
  }

  /** Pause menu: open (physics pause, show menu). */
  public pauseGame() {
      if (this.isGameOver || this.isPausedMenu) return;
      this.isPausedMenu = true;
      this.physics.pause();
      this.audioManager?.pauseBGM();
      this.syncUI();
  }

  /** Pause menu: close (resume). */
  public resumeGame() {
      if (!this.isPausedMenu) return;
      this.isPausedMenu = false;
      this.audioManager?.resumeBGM();
      this.physics.resume();
      this.syncUI();
  }

  /** Pause menu: restart current run from the beginning. */
  public restartStage() {
      this.isPausedMenu = false;
      this.physics.resume();
      this.audioManager?.startBGM();
      this.scene.restart();
  }

  /** Pause menu: return to main menu. */
  public returnToMainMenu() {
      this.isPausedMenu = false;
      this.physics.resume();
      this.onScoreUpdate({
          distance: this.runDistance,
          stars: this.collectedStarsCount,
          hearts: this.hearts,
          isGameOver: this.isGameOver,
          stageResults: undefined,
          returnToMenu: true
      } as GameState);
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('HomeScene');
      });
  }

  /** 0–100 from actual distance / stage length (Step 2 progress bar). */
  private getStageProgressPercent(): number {
      if (this.currentStage >= 2 && this.cityStartDistanceForStats >= 0) {
          const distInStage = this.runDistance - this.cityStartDistanceForStats;
          return Math.min(100, (distInStage / PROGRESS.STAGE_2_LENGTH_M) * 100);
      }
      return Math.min(100, (this.runDistance / PROGRESS.STAGE_1_LENGTH_M) * 100);
  }

  /** Show stage title for durationMs, then clear and call onComplete (Step 2). */
  public showStageTitle(title: string, durationMs: number, onComplete: () => void) {
      this.stageTitle = title;
      this.syncUI();
      this.time.delayedCall(durationMs, () => {
          this.stageTitle = null;
          this.syncUI();
          onComplete();
      });
  }

  /** After Bayt Al-Hikma results: golden closing, final message, then return to main menu. */
  private beginFinalCinematicEnding() {
      this.stageResults = null;
      this.pendingTransition = null;
      this.syncUI();

      const { width, height } = this.scale;
      const goldenOverlay = this.add.rectangle(width / 2, height / 2, width + 200, height + 200, 0x2a1f0a);
      goldenOverlay.setAlpha(0);
      goldenOverlay.setDepth(300);
      goldenOverlay.setScrollFactor(0);

      const finalMessage = 'انتهت الرحلة… وبدأت حكاية جديدة نحو العلم.';
      const wrapWidth = Math.floor(width * 0.88);
      const isNarrow = width < 400;
      const txt = this.add.text(width / 2, height / 2, finalMessage, {
          fontFamily: 'Cairo',
          fontSize: isNarrow ? '22px' : '28px',
          fontStyle: 'bold',
          color: '#e8c547',
          align: 'center'
      });
      txt.setWordWrapWidth(wrapWidth);
      txt.setOrigin(0.5, 0.5);
      txt.setStroke('#8b6914', 2);
      txt.setShadow(0, 0, 'rgba(232, 197, 71, 0.6)', 12);
      txt.setAlpha(0);
      txt.setDepth(301);
      txt.setScrollFactor(0);

      this.tweens.add({
          targets: goldenOverlay,
          alpha: 0.45,
          duration: 2200,
          ease: 'Power1.inOut'
      });

      this.time.delayedCall(800, () => {
          this.audioManager?.stopAllLongAudio();
      });

      this.time.delayedCall(2200, () => {
          this.tweens.add({
              targets: txt,
              alpha: 1,
              duration: 1000,
              ease: 'Power1.out',
              onComplete: () => {
                  this.time.delayedCall(2000, () => {
                      this.tweens.add({
                          targets: txt,
                          alpha: 0,
                          duration: 1200,
                          ease: 'Power1.in',
                          onComplete: () => this.fadeToMainMenu()
                      });
                  });
              }
          });
      });
  }

  private fadeToMainMenu() {
      this.onScoreUpdate({
          distance: this.runDistance,
          stars: this.collectedStarsCount,
          hearts: this.hearts,
          isGameOver: this.isGameOver,
          stageResults: undefined,
          returnToMenu: true
      } as GameState);
      this.cameras.main.fadeOut(1500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('HomeScene');
      });
  }

  private gameOver() {
      this.audioManager?.playFail();
      this.audioManager?.stopBGM();
      this.isGameOver = true;
      this.physics.pause();
      this.player.setTint(0x555555);
      this.syncUI();
  }
}

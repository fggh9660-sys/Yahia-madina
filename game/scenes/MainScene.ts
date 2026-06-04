
import Phaser from 'phaser';
import { PHYSICS, PROGRESS, SKILL, COMBO, PERFECT_JUMP, BOND_HUD, HITSTOP, SPEED_LINES, BRIDGE_WIND, BRIDGE_COLLAPSE, PATH_FORK, BALANCE_METER, SPEED_BOOST, QUESTION_ENCOUNTER, getPlayerStartX, getGameplayCameraZoom, getPlayerSpawnY } from '../../constants';
import { NOOR_BOND_REWARDS, getBondTier, getBondTierDef, getNextTierThreshold, getCurrentTierFloor } from '../../data/noorBond';
import { Player } from '../objects/Player';
import { Obstacle } from '../objects/Obstacle';
import { Question, GameState, NoorMessage, StageResultsData, ActivePuzzle, PuzzleType } from '../../types';
import { getQuestions } from '../data/questions';
import { pickLoreFragment } from '../../data/loreFragments';
import { pickNoorLine } from '../../data/noorLines';
import { pickMiniChallenge, findMiniChallenge } from '../data/miniChallenges';
import { getCollectedCount, getTotalPossible, getCompletionPercent } from '../../data/collectionState';
import { hasSeenColorDiscovery, markColorDiscoverySeen } from '../../data/playerColor';

// Objects for Texture Generation
import { Star } from '../objects/Star';
import { KnowledgeFragment } from '../objects/KnowledgeFragment';
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
import { MiniEncounterManager } from '../managers/MiniEncounterManager';

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
  private miniEncounterManager!: MiniEncounterManager;
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
  private balanceMeterBg: Phaser.GameObjects.Graphics | null = null;
  private balanceMeterFill: Phaser.GameObjects.Graphics | null = null;
  private balanceMeterIndicator: Phaser.GameObjects.Graphics | null = null;
  private edgeTimeMs: number = 0;
  private pathHudBg: Phaser.GameObjects.Graphics | null = null;
  private pathHudLabel: Phaser.GameObjects.Text | null = null;
  // M2-R3: split path UI state removed alongside the system.
  private bridgeAmbientDebrisEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  // UI State
  private activeMessage: string | null = null; 
  private currentNoorMessage: NoorMessage | null = null;
  private messageTimer: Phaser.Time.TimerEvent | null = null;
  private isSoftPaused: boolean = false;
  private isPausedMenu: boolean = false; 
  private activeQuestion: Question | null = null;
  // M2-R1: active fragment lore modal — when set, gameplay is paused and GameUI shows the lore card.
  private activeFragmentLore: { id: string; title: string; body: string; isRare?: boolean } | null = null;
  // M3A: active mini-challenge modal — replaces legacy activeQuestion popup flow.
  private activeMiniChallenge: import('../data/miniChallenges').MiniChallenge | null = null;
  // M3A-R1: in-game Noor color-discovery moment (relocated from the pre-gameplay setup screen per
  // Yahia 2026-06-02). activeColorChoice freezes the world while the picker is open; colorDiscoveryFired
  // guards against re-firing within the same run. Triggers once, early in the first run, only until the
  // player has actually picked a color (localStorage).
  private activeColorChoice: boolean = false;
  private colorDiscoveryFired: boolean = false;
  // M3A-R1c: brief frozen "story beat" after the color is committed — Noor acknowledges the choice
  // before the run resumes, so the moment doesn't end abruptly.
  private colorAckBeat: boolean = false;
  private readonly COLOR_DISCOVERY_DISTANCE_M = 130;
  // Bugfix 2026-06-04: consecutive ticks the run has been frozen with nothing on screen (stuck watchdog).
  private stuckTicks: number = 0;
  // M2-R1b: once-per-run gate for the stage_2_enter Noor line so it can't refire on stage replay.
  private hasFiredStage2NoorThisRun: boolean = false;
  // M3B: once-per-run gate for the stage_3_enter Noor line.
  private hasFiredStage3NoorThisRun: boolean = false;
  // M3A: collection progress snapshot pushed to GameState for the HUD progression chip.
  private collectionSnapshot: { collected: number; total: number; percent: number } = { collected: 0, total: 0, percent: 0 };
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
    this.miniEncounterManager = new MiniEncounterManager(
        this,
        () => this.currentStage,
        () => this.eventManager.isEncounterActive || this.eventManager.eventPhase !== 'NONE',
    );

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

    // M3B (TEMPORARY review aid): jump straight to Stage 3 for preview without a full playthrough.
    // From the browser console: window.__krEnterStage3(). Remove before final M3B sign-off, once the
    // natural Stage 2 → 3 progression is hooked up.
    try { (window as unknown as Record<string, unknown>).__krEnterStage3 = () => this.enterStage3(); } catch { /* ignore */ }

    // Bugfix 2026-06-04: low-frequency stuck-state watchdog so the run can never stay frozen with no modal.
    this.time.addEvent({ delay: 1200, loop: true, callback: this.checkStuckState, callbackScope: this });

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
    this.balanceMeterBg = null;
    this.balanceMeterFill = null;
    this.balanceMeterIndicator = null;
    this.edgeTimeMs = 0;
    this.pathHudBg = null;
    this.pathHudLabel = null;
    this.bridgeAmbientDebrisEmitter = null;
    // M2-R3: splitPath* UI nullifications removed alongside the system.
    this.baseSpeed = PHYSICS.RUN_SPEED_START ?? PHYSICS.RUN_SPEED;
    this.speedModifier = 1.0; 
    this.physics.world.timeScale = 1.0; 
    this.questionPool = getQuestions(this.currentStage);
    this.activeFragmentLore = null;
    this.activeMiniChallenge = null;
    this.activeColorChoice = false;
    this.colorDiscoveryFired = false;
    this.colorAckBeat = false;
    this.hasFiredStage2NoorThisRun = false;
    this.hasFiredStage3NoorThisRun = false;
    this.stuckTicks = 0;
    // M3A: initialize HUD collection snapshot from persistent store so the chip shows progress
    // from prior runs as soon as gameplay starts.
    this.collectionSnapshot = { collected: getCollectedCount(), total: getTotalPossible(), percent: getCompletionPercent() };

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
    if (this.activeMessage || this.activeQuestion || this.activeMiniChallenge) return;
    if (this.isBookOfNoorOpen) return;
    if (this.isPausedMenu) return;
    // M2-R3: full pause when lore card open — skip the entire update so bg/spawn/event/ambient
    // managers don't run. Combined with tweens.pauseAll() in showFragmentLore, the world freezes.
    if (this.activeFragmentLore) return;
    // M3A-R1: same full-pause treatment while the color-discovery picker is open.
    if (this.activeColorChoice) return;
    // M3A-R1c: hold the freeze through Noor's brief acknowledgment beat after the choice.
    if (this.colorAckBeat) return;

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

    // M3A-R1: Noor color-discovery moment — fires once, early in the first run, until the player has
    // experienced it. Gated on hasSeenColorDiscovery (NOT hasPlayerPickedColor) so returning players
    // who already have a saved color from the old pre-gameplay picker still get it once (fix 2026-06-03).
    if (!this.colorDiscoveryFired && !this.activeColorChoice
        && this.runDistance >= this.COLOR_DISCOVERY_DISTANCE_M && !hasSeenColorDiscovery()) {
        this.showColorDiscovery();
        return;
    }

    if ((phase === 'SANDSTORM_ONSET' || phase === 'SANDSTORM_WALK' || phase === 'SANDSTORM_APPROACH') && this.sandstormOverlay) {
        this.sandstormOverlay.tilePositionX += (currentSpeed * 0.2) + 25; 
    }
        
    this.environmentManager.update(time, scaledDelta, frameMove);
    this.player.update(time, scaledDelta);
    this.spawnManager.update(scaledDelta, frameMove, currentSpeed);
    this.eventManager.update(frameMove, scaledDelta);
    this.miniEncounterManager?.update();
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
    // If Flying, bounds are different. M2-R2b fix: also skip the fall-fatality during stage-end
    // transitions so the player doesn't die between desert end and city start while React UI is up.
    if (!this.player.isFlying
        && this.player.y > this.scale.height + 50
        && !this.stageResults
        && !this.pendingTransition) {
        this.damagePlayer(true);
    }
  }

  // ... (Rest of the file remains same, keeping methods to ensure full file content logic) ...
  public advanceStage() {
      this.currentStage++;
      this.baseSpeed = PHYSICS.RUN_SPEED + ((this.currentStage - 1) * 20);
      // M2: refresh question pool with stage-themed set (heritage→knowledge on Stage 2).
      this.questionPool = getQuestions(this.currentStage);
      // M2-R1b: stage transition Noor line, gated to once per run via hasFiredStage2NoorThisRun.
      if (this.currentStage === 2 && !this.hasFiredStage2NoorThisRun) {
          this.hasFiredStage2NoorThisRun = true;
          const line = pickNoorLine('stage_2_enter');
          if (line) this.showNoorMessage(line.text, false, line.tone);
      }
  }

  /**
   * M3B — Stage 3 "Observatory of the Stars" entry. This IS the signature event/beat: the ascent
   * into the observatory. Switches stage to 3, fades the world into the domes/colonnade + star-stone
   * ground, shows the stage title, and fires Noor's stage_3 line. Idempotent (no-op once in OBSERVATORY).
   *
   * Currently invoked via the review shortcut (window.__krEnterStage3) and intended to be hooked into
   * the natural Stage 2 → 3 progression next.
   */
  public enterStage3() {
      if (this.isGameOver || this.environmentManager.getZone() === 'OBSERVATORY') return;
      this.currentStage = 3;
      this.baseSpeed = PHYSICS.RUN_SPEED + ((this.currentStage - 1) * 20);
      this.questionPool = getQuestions(this.currentStage);

      // Visual ascent: swap ground + fade background to the observatory.
      this.environmentManager.transitionToObservatory();

      if (!this.hasFiredStage3NoorThisRun) {
          this.hasFiredStage3NoorThisRun = true;
          this.showStageTitle('المرحلة 3 — برج الرصد', 2600, () => {});
          const line = pickNoorLine('stage_3_enter');
          if (line) this.showNoorMessage(line.text, false, line.tone);
      }
      this.syncUI();
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

  /**
   * Speed boost pickup effect (Wk 1 Day 3): ramps speedModifier up to SPEED_BOOST.MULTIPLIER
   * over RAMP_UP_MS, stays for DURATION_MS, then ramps back down to 1.0.
   */
  /**
   * Path fork resolution callback fired by EventManager. Updates the small HUD label
   * showing current track + plays a confirm audio cue when a side is committed.
   */
  /**
   * Ambient debris falling continuously during the collapsing bridge — small rocks/dust
   * drift down from above the bridge edges into the void. Density escalates with phase
   * progress so the late bridge feels visibly more chaotic.
   */
  public startBridgeAmbientDebris() {
      if (!this.textures.exists('dust_particle')) return;
      if (this.bridgeAmbientDebrisEmitter?.active) return;
      const W = this.scale.width;
      const H = this.scale.height;
      this.bridgeAmbientDebrisEmitter = this.add.particles(0, 0, 'dust_particle', {
          x: { min: 0, max: W },
          y: { min: H * 0.1, max: H * 0.45 },
          speedY: { min: BRIDGE_COLLAPSE.AMBIENT_DEBRIS_SPEED_MIN, max: BRIDGE_COLLAPSE.AMBIENT_DEBRIS_SPEED_MAX },
          speedX: { min: -40, max: 40 },
          lifespan: BRIDGE_COLLAPSE.AMBIENT_DEBRIS_LIFESPAN_MS,
          scale: { start: 0.5, end: 0 },
          alpha: { start: 0.7, end: 0 },
          tint: 0x8a7a6a,
          quantity: 1,
          frequency: BRIDGE_COLLAPSE.AMBIENT_DEBRIS_EMIT_MS_EARLY,
          emitting: true,
      }).setDepth(13).setScrollFactor(0);
  }

  public stopBridgeAmbientDebris() {
      if (this.bridgeAmbientDebrisEmitter?.active) this.bridgeAmbientDebrisEmitter.stop();
  }

  /** Called each frame to ramp ambient debris density based on phase progress. */
  private updateBridgeAmbientDebris() {
      if (!this.bridgeAmbientDebrisEmitter?.active) return;
      if (this.eventManager?.eventPhase !== 'BRIDGE_COLLAPSE') return;
      const p = this.eventManager.getBridgeCollapseProgress?.() ?? 0;
      const earlyMs = BRIDGE_COLLAPSE.AMBIENT_DEBRIS_EMIT_MS_EARLY;
      const lateMs = BRIDGE_COLLAPSE.AMBIENT_DEBRIS_EMIT_MS_LATE;
      this.bridgeAmbientDebrisEmitter.frequency = earlyMs + (lateMs - earlyMs) * p;
  }

  // M2-R3 (Yahia 2026-05-31): Split Path system removed entirely.
  // Old methods deleted: onPathChosen, spawnKnowledgePathRewards, onSplitPathCountdownStart,
  // stopSplitPathCountdown, updateSplitPathCountdown. Will be rebuilt fresh as "Choose Your Path"
  // mini-challenge #6 in M3a, not as a parallel-track layered onto the runner.

  public triggerSpeedBoost() {
      if (this.isGameOver || this.isPausedMenu) return;
      this.audioManager?.playStarPitched(600);
      this.tweens.killTweensOf({ proxy: 0 });
      // Ramp up
      this.tweens.add({
          targets: this,
          speedModifier: SPEED_BOOST.MULTIPLIER,
          duration: SPEED_BOOST.RAMP_UP_MS,
          ease: 'Sine.easeOut',
      });
      // Subtle camera punch for impact
      this.cameras.main.shake(80, 0.004);
      // Hold + ramp down
      this.time.delayedCall(SPEED_BOOST.DURATION_MS, () => {
          if (this.isGameOver) return;
          this.tweens.add({
              targets: this,
              speedModifier: 1.0,
              duration: SPEED_BOOST.RAMP_DOWN_MS,
              ease: 'Sine.easeIn',
          });
      });
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
          // M2-R1b: Noor only fires on MAJOR combo streaks (tier 3+). Tier 2 dropped per Yahia note.
          if (this.comboTier >= 3) {
              const line = pickNoorLine('combo_milestone_high');
              if (line) this.showNoorMessage(line.text, false, line.tone);
          }
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

  public hitStop(durationMs: number, scale: number) {
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
      const bridgeTop = groundY - 8;
      const bridgeH = BRIDGE_WIND.OVERLAY_HEIGHT;
      const railH = BRIDGE_WIND.RAIL_HEIGHT;

      this.bridgeOverlay.clear();

      // 1) Void chasm below the bridge — covers everything below the bridge surface to bottom of screen
      const voidTop = bridgeTop + bridgeH;
      const voidH = H - voidTop;
      for (let i = 0; i < voidH; i++) {
          const t = i / voidH;
          const a = BRIDGE_WIND.VOID_TOP_ALPHA + (BRIDGE_WIND.VOID_BOTTOM_ALPHA - BRIDGE_WIND.VOID_TOP_ALPHA) * t;
          const c = Phaser.Display.Color.Interpolate.ColorWithColor(
              Phaser.Display.Color.IntegerToColor(BRIDGE_WIND.VOID_TOP_COLOR),
              Phaser.Display.Color.IntegerToColor(BRIDGE_WIND.VOID_BOTTOM_COLOR),
              100,
              Math.floor(t * 100),
          );
          const hex = (c.r << 16) | (c.g << 8) | c.b;
          this.bridgeOverlay.fillStyle(hex, a);
          this.bridgeOverlay.fillRect(0, voidTop + i, W, 1);
      }

      // Distant city silhouette dots in the void for depth
      this.bridgeOverlay.fillStyle(0xffd700, 0.3);
      for (let x = 0; x < W; x += 30) {
          const dotY = voidTop + 24 + ((x * 13) % 28);
          this.bridgeOverlay.fillCircle(x + 12, dotY, 1);
      }

      // 2) Top railing — continuous bar with periodic posts
      this.bridgeOverlay.fillStyle(0x3a2f24, 1.0);
      this.bridgeOverlay.fillRect(0, bridgeTop - railH, W, 4);
      for (let x = 0; x < W; x += BRIDGE_WIND.RAIL_POST_INTERVAL_PX) {
          this.bridgeOverlay.fillRect(x, bridgeTop - railH, 4, railH + 2);
      }

      // 3) Bridge top surface — stone band. Drawn only for WIND variant; the COLLAPSE variant
      //    uses discrete BridgeTile sprites as its surface so this continuous strip would
      //    hide the gaps (the visual whole point of the collapse mechanic). Skip in collapse.
      const isCollapse = this.eventManager?.eventPhase === 'BRIDGE_COLLAPSE';
      if (!isCollapse) {
          this.bridgeOverlay.fillStyle(BRIDGE_WIND.OVERLAY_COLOR, BRIDGE_WIND.OVERLAY_ALPHA);
          this.bridgeOverlay.fillRect(0, bridgeTop, W, bridgeH);
          // Darker top + bottom edges for definition
          this.bridgeOverlay.fillStyle(0x2a2018, 0.85);
          this.bridgeOverlay.fillRect(0, bridgeTop, W, 3);
          this.bridgeOverlay.fillRect(0, bridgeTop + bridgeH - 3, W, 3);
          // Repeating stone-tile dividers
          this.bridgeOverlay.fillStyle(0x2a2018, 0.55);
          for (let x = 0; x < W; x += 56) {
              this.bridgeOverlay.fillRect(x, bridgeTop + 4, 2, bridgeH - 8);
          }
          // Highlight band on top edge
          this.bridgeOverlay.fillStyle(0x8a7a6a, 0.6);
          this.bridgeOverlay.fillRect(0, bridgeTop + 4, W, 2);
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
      this.updateBridgeAmbientDebris();
      // M2-R3: updateSplitPathCountdown removed alongside Split Path system.
      // Bridge collapse fall detection — if player is grounded over a collapsed tile, fail.
      if (this.eventManager?.eventPhase === 'BRIDGE_COLLAPSE' && !this.eventManager.bridgeFell) {
          const body = this.player?.body as Phaser.Physics.Arcade.Body | undefined;
          const onGround = body ? (body.blocked.down || body.touching.down) : false;
          if (onGround && this.eventManager.isOverCollapsedGap?.(this.player.x)) {
              this.triggerBridgeFall();
          }
      }
      const isBridge = this.eventManager?.eventPhase === 'BRIDGE_WIND';
      if (isBridge) {
          this.bridgeBannerTimer += delta;
          if (this.bridgeBannerTimer >= BRIDGE_WIND.BANNER_SPAWN_INTERVAL_MS) {
              this.spawnBridgeBanner();
              this.bridgeBannerTimer = 0;
          }
          this.updateBalanceMeter(delta);
      } else if (this.balanceMeterBg) {
          this.hideBalanceMeter();
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

  private updateBalanceMeter(delta: number) {
      if (!this.player) return;
      const W = this.scale.width;
      const H = this.scale.height;
      const cx = W / 2;
      const cy = H - BALANCE_METER.Y_FROM_BOTTOM;
      const mw = BALANCE_METER.WIDTH;
      const mh = BALANCE_METER.HEIGHT;
      const left = cx - mw / 2;

      const startX = getPlayerStartX(W);
      const offset = this.player.x - startX;
      const rawRatio = offset / BRIDGE_WIND.X_DRIFT_MAX;
      const ratio = Math.max(-1, Math.min(1, rawRatio));
      const absRatio = Math.abs(ratio);

      if (!this.balanceMeterBg) {
          this.balanceMeterBg = this.add.graphics().setDepth(498).setScrollFactor(0);
      }
      if (!this.balanceMeterFill) {
          this.balanceMeterFill = this.add.graphics().setDepth(499).setScrollFactor(0);
      }
      if (!this.balanceMeterIndicator) {
          this.balanceMeterIndicator = this.add.graphics().setDepth(500).setScrollFactor(0);
      }

      // Defensive: drop stale refs after scene.restart()
      if (this.balanceMeterBg && !this.balanceMeterBg.active) { this.balanceMeterBg = null; return; }
      if (this.balanceMeterFill && !this.balanceMeterFill.active) { this.balanceMeterFill = null; return; }
      if (this.balanceMeterIndicator && !this.balanceMeterIndicator.active) { this.balanceMeterIndicator = null; return; }

      this.balanceMeterBg.clear();
      this.balanceMeterBg.fillStyle(BALANCE_METER.BG_COLOR, BALANCE_METER.BG_ALPHA);
      this.balanceMeterBg.fillRect(left, cy - mh / 2, mw, mh);
      this.balanceMeterBg.lineStyle(2, BALANCE_METER.BORDER_COLOR, BALANCE_METER.BORDER_ALPHA);
      this.balanceMeterBg.strokeRect(left, cy - mh / 2, mw, mh);

      // Color zones: center green, warn yellow, edge red
      this.balanceMeterFill.clear();
      const segW = mw / 6;
      this.balanceMeterFill.fillStyle(BALANCE_METER.EDGE_COLOR, 0.7);
      this.balanceMeterFill.fillRect(left + 2, cy - mh / 2 + 2, segW, mh - 4);
      this.balanceMeterFill.fillRect(left + mw - segW - 2, cy - mh / 2 + 2, segW, mh - 4);
      this.balanceMeterFill.fillStyle(BALANCE_METER.WARN_COLOR, 0.6);
      this.balanceMeterFill.fillRect(left + segW + 2, cy - mh / 2 + 2, segW, mh - 4);
      this.balanceMeterFill.fillRect(left + mw - 2 * segW - 2, cy - mh / 2 + 2, segW, mh - 4);
      this.balanceMeterFill.fillStyle(BALANCE_METER.CENTER_COLOR, 0.6);
      this.balanceMeterFill.fillRect(left + 2 * segW + 2, cy - mh / 2 + 2, segW * 2, mh - 4);

      // Indicator
      this.balanceMeterIndicator.clear();
      const indX = cx + (ratio * (mw / 2 - BALANCE_METER.INDICATOR_W / 2));
      let indColor = BALANCE_METER.INDICATOR_COLOR;
      if (absRatio > BALANCE_METER.EDGE_THRESHOLD) indColor = BALANCE_METER.EDGE_COLOR;
      else if (absRatio > BALANCE_METER.WARN_THRESHOLD) indColor = BALANCE_METER.WARN_COLOR;
      this.balanceMeterIndicator.fillStyle(indColor, 1);
      this.balanceMeterIndicator.fillRect(indX - BALANCE_METER.INDICATOR_W / 2, cy - BALANCE_METER.INDICATOR_H / 2, BALANCE_METER.INDICATOR_W, BALANCE_METER.INDICATOR_H);
      this.balanceMeterIndicator.lineStyle(1, 0x000000, 0.8);
      this.balanceMeterIndicator.strokeRect(indX - BALANCE_METER.INDICATOR_W / 2, cy - BALANCE_METER.INDICATOR_H / 2, BALANCE_METER.INDICATOR_W, BALANCE_METER.INDICATOR_H);

      // Fall detection — if at edge for too long, trigger fall
      if (absRatio >= BALANCE_METER.EDGE_THRESHOLD) {
          this.edgeTimeMs += delta;
          if (this.edgeTimeMs >= BRIDGE_WIND.FALL_EDGE_TIME_MS && this.player && !this.eventManager?.bridgeFell) {
              this.triggerBridgeFall();
          }
      } else {
          this.edgeTimeMs = 0;
      }
  }

  private hideBalanceMeter() {
      if (this.balanceMeterBg?.active) this.balanceMeterBg.clear();
      if (this.balanceMeterFill?.active) this.balanceMeterFill.clear();
      if (this.balanceMeterIndicator?.active) this.balanceMeterIndicator.clear();
      this.edgeTimeMs = 0;
  }

  private triggerBridgeFall() {
      if (!this.eventManager || this.eventManager.bridgeFell) return;
      this.eventManager.bridgeFell = true;
      this.cameras.main.shake(
          BRIDGE_COLLAPSE.FALL_FAIL_SHAKE_MS,
          BRIDGE_COLLAPSE.FALL_FAIL_SHAKE_INTENSITY,
      );
      this.audioManager?.playDamage();
      this.showFloatingText(this.player.x, this.player.y - 60, "سقطت! 💢", '#ff4d4d');
      // Quick fade-to-black then respawn at last checkpoint (or city entrance if out of hearts).
      this.cameras.main.fadeOut(450, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
          this.handleBridgeFallRespawn();
          this.cameras.main.fadeIn(350);
      });
  }

  /**
   * Yahia 2026-05-23 spec: a single fall does NOT restart the city — player loses 1 heart and
   * respawns at the last passed checkpoint on the bridge. Only when all hearts are gone does
   * the run end and the player goes back to City Entrance via the normal game-over flow.
   */
  private handleBridgeFallRespawn() {
      this.damagePlayer();
      if (this.isGameOver) {
          // Out of hearts — game over flow handles return to start; this is the "back to
          // City Entrance" end-state from Yahia's flowchart.
          return;
      }
      const checkpointX = this.eventManager.lastBridgeCheckpointX || getPlayerStartX(this.scale.width);
      this.player.x = checkpointX;
      this.player.y = getPlayerSpawnY(this.scale.height);
      this.player.setRotation(0);
      this.player.setVelocity(0, 0);
      this.edgeTimeMs = 0;
      this.eventManager.bridgeFell = false;
      this.showFloatingText(this.player.x, this.player.y - 80, "نقطة تفتيش!", '#4ade80');
  }

  /**
   * (Legacy from Yahia 2026-05-22 — full city restart on fall) — kept for game-over end-state
   * when all hearts are depleted. Called by damagePlayer's fatal path via gameOver flow.
   */
  private restartFromCityEntrance() {
      // Take damage (may game-over)
      this.damagePlayer();
      if (this.isGameOver) return;
      this.player.x = getPlayerStartX(this.scale.width);
      this.player.y = getPlayerSpawnY(this.scale.height);
      this.player.setRotation(0);
      this.player.setVelocity(0, 0);
      this.eventManager.resetBridgeCollapse();
      // Rewind run distance to city start so the player replays the city approach
      const cityStart = this.environmentManager['cityStartDistance'] ?? this.runDistance;
      this.runDistance = cityStart;
      // Reset the bridge-trigger flag in EnvironmentManager so collapse fires again on re-approach
      (this.environmentManager as unknown as { hasTriggeredBridgeWind: boolean }).hasTriggeredBridgeWind = false;
      this.spawnManager?.removeAllSpawned();
      this.edgeTimeMs = 0;
      this.eventManager.bridgeFell = false;
      this.showFloatingText(this.player.x, this.player.y - 80, "أعد المحاولة!", '#ffaa00');
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
      // M2-R2b fix: stage-end transition is also a no-damage window. Player may be off-screen below
      // because physics keep running while the React StageResultsUI is up. Without this guard, the
      // fall-fatality at bounds check kills the player right at the end of the desert level.
      if (this.stageResults) return;
      if (this.pendingTransition) return;

      // Combo chain: actual damage breaks the chain (shield blocks do not — those are filtered upstream).
      this.resetCombo();

      if (fatal) {
          this.hearts = 0;
          this.gameOver();
          return;
      }
      this.audioManager?.playDamage();
      this.hearts--;
      if (this.hearts <= 0) {
          this.gameOver();
      } else if (this.hearts === 1) {
          // M2: low HP warning Noor line — only fires when dropping TO 1, not at 0 (game over).
          const line = pickNoorLine('low_hp_warning');
          if (line) this.showNoorMessage(line.text, false, line.tone);
      }
  }

  /**
   * M2-R1: pause gameplay + surface the lore card UI. GameUI renders a tap-to-dismiss modal.
   * Used on knowledge fragment pickup so the player can read without dodging in the background.
   */
  public showFragmentLore(lore: { id: string; title: string; body: string }, isRare: boolean = false) {
      if (this.activeFragmentLore || this.activeQuestion || this.isPausedMenu || this.isGameOver) return;
      this.activeFragmentLore = { ...lore, isRare };
      this.speedModifier = 0;
      this.player.anims.pause();
      if (this.physics.world.isPaused === false) this.physics.pause();
      // M2-R3: pause ALL active tweens so mid-flight ambients (mini encounters, lantern processions,
      // parallax tween chains, sandstorm overlay, fragment bob/scale) freeze too. The update() early-return
      // already skips manager updates; this catches everything already in flight.
      this.tweens.pauseAll();
      // M2-R1b: only rare/discovery fragments trigger a Noor line — keeps Noor reserved.
      // M2-R2a: the Lost Book intro is a special once-per-run hook — uses its own narration cue
      // instead of the generic rare_fragment_discovery pool.
      if (isRare) {
          const cue = lore.id === 'lost-book-intro' ? 'lost_book_intro' : 'rare_fragment_discovery';
          const line = pickNoorLine(cue);
          if (line) this.showNoorMessage(line.text, false, line.tone);
      }
      this.syncUI();
  }

  /** M3A: hook called by CollisionManager when a new fragment is added to the persistent collection.
   *  Updates HUD snapshot so the live "X / N" chip refreshes during gameplay (felt progression
   *  per Yahia 2026-06-01 emphasis — not just menu tracking). */
  public onCollectionProgress(collected: number, total: number) {
      const percent = total === 0 ? 0 : Math.min(100, Math.round((collected / total) * 100));
      this.collectionSnapshot = { collected, total, percent };
      this.syncUI();
  }

  // M3A: pause/resume tied to Book of Noor modal — separate flag from isPausedMenu so the
  // existing pause menu doesn't also render. Mirrors fragment lore modal freeze pattern.
  private isBookOfNoorOpen: boolean = false;
  public pauseForBookOfNoor() {
      if (this.isBookOfNoorOpen || this.isGameOver) return;
      this.isBookOfNoorOpen = true;
      this.speedModifier = 0;
      this.player.anims.pause();
      if (this.physics.world.isPaused === false) this.physics.pause();
      this.tweens.pauseAll();
  }
  public resumeFromBookOfNoor() {
      if (!this.isBookOfNoorOpen) return;
      this.isBookOfNoorOpen = false;
      if (this.physics.world.isPaused) this.physics.resume();
      this.player.anims.resume();
      this.speedModifier = 1.0;
      this.tweens.resumeAll();
  }

  /** M3A-R1: open the in-game color-discovery moment. Freezes the world (physics + anims + tweens)
   *  like the fragment lore modal, surfaces a Noor line framing the choice, and flags activeColorChoice
   *  so React renders the relocated PlayerColorPicker. Resolved by confirmColorChoice(). */
  public showColorDiscovery() {
      if (this.activeColorChoice || this.isGameOver) return;
      this.activeColorChoice = true;
      this.colorDiscoveryFired = true;
      this.speedModifier = 0;
      this.player.anims.pause();
      if (this.physics.world.isPaused === false) this.physics.pause();
      this.tweens.pauseAll();
      const line = pickNoorLine('color_discovery');
      if (line) {
          this.showNoorMessage(line.text, false, line.tone);
          // M3A-R1b (Yahia 2026-06-03): make this a guided story beat, not a quick one-liner —
          // keep Noor present through the WHOLE choice by cancelling the auto-hide timer.
          // She's dismissed in confirmColorChoice() once the player commits.
          if (this.messageTimer) { this.messageTimer.remove(); this.messageTimer = null; }
      }
      this.syncUI();
  }

  /** M3A-R1: called from App after the player confirms a color (texture already regenerated).
   *  Closes the picker, plays Noor's closing acknowledgment beat, then resumes gameplay. */
  public confirmColorChoice() {
      if (!this.activeColorChoice) return;
      this.activeColorChoice = false;   // React picker closes
      // Mark the moment as experienced so it won't retrigger on future runs (persists across sessions).
      markColorDiscoverySeen();
      // M3A-R1c (Yahia 2026-06-03 feel pass): don't snap straight back to the run — hold the freeze
      // for a short beat while Noor acknowledges the choice, so the moment lands instead of ending
      // abruptly. The world stays frozen via colorAckBeat (update() early-returns) until the timer fires.
      this.colorAckBeat = true;
      const ack = pickNoorLine('color_chosen');
      if (ack) {
          this.showNoorMessage(ack.text, false, ack.tone);
          if (this.messageTimer) { this.messageTimer.remove(); this.messageTimer = null; }
      }
      this.syncUI();
      this.time.delayedCall(1700, () => {
          this.colorAckBeat = false;
          this.hideNoorMessage();
          if (this.physics.world.isPaused) this.physics.resume();
          this.player.anims.resume();
          this.speedModifier = 1.0;
          this.tweens.resumeAll();
          this.syncUI();
      });
  }

  /** M2-R1: dismiss the lore modal and resume gameplay. Called from GameUI tap-anywhere handler. */
  public dismissFragmentLore() {
      if (!this.activeFragmentLore) return;
      this.activeFragmentLore = null;
      if (this.physics.world.isPaused) this.physics.resume();
      this.player.anims.resume();
      this.speedModifier = 1.0;
      // M2-R3: resume all paused tweens so ambients + animations continue from where they were frozen.
      this.tweens.resumeAll();
      this.syncUI();
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

  /**
   * M3A: encounter pause + mini-challenge trigger (replaces legacy question popup flow).
   * Same entry point name retained so EventManager doesn't need to change every call site.
   * If `specificId` matches a mini-challenge id, that one is used; otherwise pick from the
   * current-stage pool.
   */
  public pauseGameplayForQuestion(specificId?: string) {
      this.speedModifier = 0;
      this.player.anims.pause();
      if (this.physics.world.isPaused === false) {
          this.physics.pause();
          // M3A-R1: full pause during the mini-challenge — same freeze pattern as the fragment lore
          // modal (M2-R3). update() already early-returns on activeMiniChallenge so managers stop;
          // this freezes mid-flight ambient tweens (parallax, lantern procession, sandstorm overlay,
          // fragment bob, mini-encounter chains) so the background doesn't keep moving behind the card.
          // Resumed in handlePostAnswerDelay (correct) and triggerEncounterMiss (wrong).
          this.tweens.pauseAll();
          this.hideNoorMessage();
          this.showMiniChallenge(specificId);
      }
  }

  /**
   * Stuck-state watchdog (Bugfix 2026-06-04, Yahia "freeze around certain encounters").
   * Runs on a low-frequency timer (unaffected by physics pause). The M3A full-pause for mini-challenges
   * (physics.pause + tweens.pauseAll) means a missed resume path leaves the world TOTALLY frozen with
   * nothing to dismiss — a hard stuck. This force-resumes ONLY when the world has been paused for several
   * consecutive ticks with NO pause-modal open AND no scripted event running (eventPhase NONE), so it can
   * never fire during a legitimate pause (reading a lore/challenge card, pause menu, color moment, or a
   * bridge/sandstorm/hanging/level-end event). The consecutive-tick threshold (~6s) clears the normal
   * chest/gate resolution window so rewards still play out fully.
   */
  private checkStuckState() {
      const frozen =
          !this.isGameOver &&
          this.physics.world.isPaused &&
          this.eventManager?.eventPhase === 'NONE' &&
          !this.activeMiniChallenge &&
          !this.activeQuestion &&
          !this.activeFragmentLore &&
          !this.isBookOfNoorOpen &&
          !this.isPausedMenu &&
          !this.activeColorChoice &&
          !this.colorAckBeat &&
          !this.activePuzzle &&
          !this.activeMessage &&
          !this.isSoftPaused &&
          !(this.currentNoorMessage?.isSoftPause);

      if (!frozen) { this.stuckTicks = 0; return; }

      this.stuckTicks++;
      if (this.stuckTicks < 5) return;   // ~6s of continuous unexplained freeze

      this.stuckTicks = 0;
      console.warn('[MainScene] stuck-state watchdog: force-resuming a frozen run.');
      if (this.physics.world.isPaused) this.physics.resume();
      this.player?.anims.resume();
      this.speedModifier = 1.0;
      this.tweens.resumeAll();
      this.syncUI();
  }

  private showMiniChallenge(specificId?: string) {
      if (this.activeMiniChallenge) return;
      let challenge = specificId ? findMiniChallenge(specificId) : undefined;
      if (!challenge) challenge = pickMiniChallenge(this.currentStage);
      if (challenge) {
          this.activeMiniChallenge = challenge;
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
          this.activeMiniChallenge = null;  // M3A
          this.eventManager.isEncounterOpening = true;
          this.showNoorMessage('أحسنت! استمر، أنت تتقدم.', false, 'encourage');
          this.syncUI();

          if (this.eventManager.encounterType === 'GATE' && this.eventManager.currentGate) {
              this.eventManager.currentGate.open();
              this.spawnCorrectAnswerBonusStars();
              this.handlePostAnswerDelay(false);
          } else if (this.eventManager.encounterType === 'CHEST' && this.eventManager.currentChest) {
              this.eventManager.currentChest.open(() => {
                  const reward = Phaser.Math.Between(QUESTION_ENCOUNTER.CORRECT_REWARD_MIN, QUESTION_ENCOUNTER.CORRECT_REWARD_MAX);
                  this.addScore(reward);
                  this.showFloatingText(this.player.x, this.player.y - 100, `+${reward} نجمة!`, '#ffd700');
                  this.spawnCorrectAnswerBonusStars();
                  this.handlePostAnswerDelay(false);
              });
          } else {
              // Bugfix 2026-06-04 (Yahia "stuck around encounters"): the encounter object is missing/stale
              // (e.g. already cleaned up, or a non-gate/chest trigger). Without this branch handlePostAnswerDelay
              // never runs, so the world stays paused (physics + tweens frozen by the M3A full-pause) and the
              // player is stuck with nothing to dismiss. Always resume.
              this.handlePostAnswerDelay(false);
          }
      } else {
          // M2: wrong answer is NO LONGER a blocking gate.
          // Light slowdown penalty + dismiss encounter + resume gameplay.
          this.audioManager?.playDamage();
          this.cameras.main.shake(180, 0.014);
          this.wrongAnswersCount++;
          this.triggerEncounterMiss();
      }
  }

  /** M2: wrong-answer flow. Dismiss encounter visually, apply slowdown, resume gameplay — no damage, no progression block. */
  private triggerEncounterMiss(): void {
      this.eventManager.isEncounterOpening = true;
      this.showNoorMessage('ربما المرة القادمة! واصل التقدم.', false, 'warning');

      // Dim the encounter object so player visibly passes by an inert chest/gate.
      if (this.eventManager.encounterType === 'CHEST' && this.eventManager.currentChest) {
          this.eventManager.currentChest.dim(
              QUESTION_ENCOUNTER.WRONG_DIM_DURATION_MS,
              QUESTION_ENCOUNTER.WRONG_DIM_TINT,
              QUESTION_ENCOUNTER.WRONG_DIM_ALPHA
          );
      } else if (this.eventManager.encounterType === 'GATE' && this.eventManager.currentGate) {
          this.eventManager.currentGate.dim(
              QUESTION_ENCOUNTER.WRONG_DIM_DURATION_MS,
              QUESTION_ENCOUNTER.WRONG_DIM_ALPHA
          );
      }

      // Hold the question UI briefly so the player registers the red feedback before it dismisses.
      this.time.delayedCall(QUESTION_ENCOUNTER.WRONG_FEEDBACK_HOLD_MS, () => {
          this.activeQuestion = null;
          this.activeMiniChallenge = null;  // M3A
          if (this.physics.world.isPaused) this.physics.resume();
          this.player.anims.resume();
          // M3A-R1: resume ambient tweens frozen by pauseGameplayForQuestion (wrong-answer path).
          this.tweens.resumeAll();

          // Light slowdown penalty (not a stop); tween down then back up after the penalty window.
          this.tweens.add({
              targets: this,
              speedModifier: QUESTION_ENCOUNTER.WRONG_SLOWDOWN_MULTIPLIER,
              duration: 200,
              ease: 'Sine.out',
              onComplete: () => {
                  this.time.delayedCall(QUESTION_ENCOUNTER.WRONG_SLOWDOWN_DURATION_MS, () => {
                      this.tweens.add({
                          targets: this,
                          speedModifier: 1.0,
                          duration: QUESTION_ENCOUNTER.WRONG_RECOVERY_DURATION_MS,
                          ease: 'Sine.inOut'
                      });
                  });
              }
          });

          this.syncUI();
          this.cleanupEncounterAfterMiss();
      });
  }

  /** M2: encounter object + state cleanup after a wrong answer. Owns its own speed/physics flow (unlike correct path). */
  private cleanupEncounterAfterMiss(): void {
      this.time.delayedCall(3000, () => {
          this.eventManager.isEncounterActive = false;
          this.eventManager.encounterType = 'NONE';
          this.eventManager.eventPhase = 'NONE';

          if (this.eventManager.currentGate) { this.eventManager.currentGate.destroy(); this.eventManager.currentGate = null; }
          if (this.eventManager.currentChest) { this.eventManager.currentChest.destroy(); this.eventManager.currentChest = null; }
      });
  }

  /** M2: small cluster of physical stars in a parabolic arc after correct answer — visible reward beyond the score. */
  private spawnCorrectAnswerBonusStars(): void {
      const baseX = this.scale.width + 80;
      const groundY = getPlayerSpawnY(this.scale.height) + 39;
      const count = QUESTION_ENCOUNTER.CORRECT_BONUS_STAR_COUNT;
      const gap = QUESTION_ENCOUNTER.CORRECT_BONUS_STAR_GAP_PX;
      const peak = QUESTION_ENCOUNTER.CORRECT_BONUS_STAR_ARC_PEAK;
      for (let i = 0; i < count; i++) {
          const t = i / Math.max(1, count - 1);
          const arc = Math.sin(t * Math.PI) * peak;
          const x = baseX + i * gap;
          const y = groundY - 60 - arc;
          const star = new Star(this, x, y);
          this.spawnManager.stars.add(star);
      }
  }

  private handlePostAnswerDelay(advanceStage: boolean) {
      this.time.delayedCall(1000, () => {
         this.physics.resume();
         this.player.anims.resume();
         // M3A-R1: resume ambient tweens frozen by pauseGameplayForQuestion (correct-answer path).
         this.tweens.resumeAll();
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
          isPaused: this.isPausedMenu,
          activeFragmentLore: this.activeFragmentLore,
          activeMiniChallenge: this.activeMiniChallenge,
          collection: this.collectionSnapshot,
          activeColorChoice: this.activeColorChoice,
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

/**
 * Cityscape Game Module using Phaser.js
 * Creates a cityscape where cards appear as billboards
 */

const cityscapeGame = (function() {
    // Private variables
    let game;
    let config;
    let scene;
    let billboards = [];
    let gameWidth = 0;
    let gameHeight = 0;
    
    // Card data to display on billboards
    const cardData = [
        { title: "About the Jam", content: "Join us for the inaugural game jam dedicated to AI-assisted vibe coding!", style: { fontSize: '14px', fontFamily: '"Press Start 2P"', wordWrap: true, wordWrapWidth: 200 } },
        { title: "Meet the Jury", content: "@karpathy + @timsoret + @mrdoob + @s13k_ + @levelsio", style: { fontSize: '14px', fontFamily: '"Press Start 2P"' } },
        { title: "Sponsors", content: "@boltdotnew + @coderabbitai", style: { fontSize: '24px', fontFamily: '"Press Start 2P"', fontWeight: 'bold' } }
    ];
    
    // Cityscape scene
    class CityscapeScene extends Phaser.Scene {
        constructor() {
            super('CityscapeScene');
            this.airplaneSpeed = 150; // Reduced from default speed for slower movement
            this.airplaneSpawnInterval = 8000; // Increased interval between spawns
        }
        
        preload() {
            console.log('CityscapeScene preload started');
            // First check if we have assets in localStorage from createPlaceholderImages
            const assetNames = ['building1', 'building2', 'building3', 'sky', 'billboard', 'airplane'];
            
            // Remove all existing textures first to prevent conflicts
            assetNames.forEach(name => {
                if (this.textures.exists(name)) {
                    console.log(`Removing existing texture: ${name}`);
                    this.textures.remove(name);
                }
            });
            
            // Create a promise for each asset load
            const loadPromises = assetNames.map(name => {
                return new Promise((resolve, reject) => {
                    const dataURL = localStorage.getItem(`phaser_asset_${name}`);
                    if (dataURL) {
                        console.log(`Loading ${name} from localStorage`);
                        // Create a new Image object
                        const img = new Image();
                        img.onload = () => {
                            try {
                                if (!this.textures.exists(name)) {
                                    this.textures.addImage(name, img);
                                }
                                resolve();
                            } catch (e) {
                                console.error(`Failed to add texture for ${name}:`, e);
                                this.createPlaceholder(name);
                                resolve();
                            }
                        };
                        img.onerror = () => {
                            console.error(`Failed to load ${name} from localStorage`);
                            this.createPlaceholder(name);
                            resolve();
                        };
                        img.src = dataURL;
                    } else {
                        console.log(`No localStorage data for ${name}, creating placeholder`);
                        this.createPlaceholder(name);
                        resolve();
                    }
                });
            });

            // Wait for all assets to be loaded
            Promise.all(loadPromises).then(() => {
                console.log('All assets loaded');
                // Verify all textures exist
                assetNames.forEach(name => {
                    if (!this.textures.exists(name)) {
                        console.error(`Texture ${name} still missing, creating emergency placeholder`);
                        this.createPlaceholder(name);
                    }
                });
                this.load.start(); // Start the loading phase
            }).catch(error => {
                console.error('Error loading assets:', error);
                // Create emergency placeholders for all assets
                assetNames.forEach(name => this.createPlaceholder(name));
                this.load.start();
            });
        }
        
        createPlaceholder(key) {
            console.log(`Creating placeholder for missing asset: ${key}`);
            
            // Create canvas placeholder for missing assets
            const canvas = document.createElement('canvas');
            
            // Set appropriate size based on the asset type
            if (key === 'sky') {
                canvas.width = 1200;
                canvas.height = 600;
            } else if (key.includes('building')) {
                canvas.width = 300;
                canvas.height = key === 'building1' ? 500 : (key === 'building2' ? 400 : 300);
            } else if (key === 'billboard') {
                canvas.width = 250;
                canvas.height = 200;
            } else if (key === 'airplane') {
                canvas.width = 200;
                canvas.height = 100;
            } else {
                canvas.width = 200;
                canvas.height = 200;
            }
            
            const ctx = canvas.getContext('2d');
            
            // Different colors for different placeholders
            let color = '#4488aa';
            if (key === 'building1') color = '#335577';
            if (key === 'building2') color = '#446688';
            if (key === 'building3') color = '#557799';
            if (key === 'billboard') color = '#aa6644';
            if (key === 'sky') color = '#001133';
            if (key === 'airplane') color = '#eeeeee';
            
            // Clear the canvas first
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Fill background
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            try {
                // Special handling based on asset type
                if (key.includes('building')) {
                    this.createBuildingSilhouette(ctx, canvas.width, canvas.height);
                } else if (key === 'billboard') {
                    this.createBillboardShape(ctx, canvas.width, canvas.height);
                } else if (key === 'sky') {
                    this.createSkyBackground(ctx, canvas.width, canvas.height);
                } else if (key === 'airplane') {
                    this.createAirplaneShape(ctx, canvas.width, canvas.height);
                }
                
                // Remove placeholder text
                // Add the placeholder image to the cache
                this.textures.addCanvas(key, canvas);
                console.log(`Successfully created placeholder for ${key}`);
                
                // Save to localStorage as a backup
                try {
                    const dataURL = canvas.toDataURL('image/png');
                    localStorage.setItem(`phaser_asset_${key}`, dataURL);
                    console.log(`Saved ${key} placeholder to localStorage`);
                } catch (e) {
                    console.error('Could not save placeholder to localStorage:', e);
                }
            } catch (error) {
                console.error(`Error creating placeholder for ${key}:`, error);
                
                // Fallback to a very simple placeholder if the complex one fails
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                this.textures.addCanvas(key, canvas);
            }
        }
        
        createBuildingSilhouette(ctx, width, height) {
            // Draw windows
            const windowSize = 10;
            const windowSpacing = 20;
            const windowsPerRow = Math.floor(width / windowSpacing) - 2;
            const windowRows = Math.floor(height / windowSpacing) - 2;
            
            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowsPerRow; col++) {
                    const x = col * windowSpacing + windowSpacing;
                    const y = row * windowSpacing + windowSpacing;
                    
                    // Randomly light up some windows
                    if (Math.random() > 0.3) {
                        ctx.fillStyle = '#ffff88';
                    } else {
                        ctx.fillStyle = '#334455';
                    }
                    
                    ctx.fillRect(x, y, windowSize, windowSize);
                }
            }
        }
        
        createBillboardShape(ctx, width, height) {
            // Draw billboard support pole
            ctx.fillStyle = '#555555';
            ctx.fillRect(width/2 - 10, height/2, 20, height/2);
            
            // Draw billboard background
            ctx.fillStyle = '#222222';
            ctx.fillRect(width/2 - width/2.5, height/4 - 20, width/1.25, height/2);
            
            // Draw billboard frame
            ctx.strokeStyle = '#888888';
            ctx.lineWidth = 8;
            ctx.strokeRect(width/2 - width/2.5, height/4 - 20, width/1.25, height/2);
        }
        
        createSkyBackground(ctx, width, height) {
            // Add some stars
            ctx.fillStyle = '#ffffff';
            
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 2 + 1;
                
                ctx.globalAlpha = Math.random() * 0.8 + 0.2;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Reset alpha
            ctx.globalAlpha = 1.0;
            
            // Add a more perfect circular moon
            const moonX = width - 100;
            const moonY = 100;
            const moonRadius = 50;
            
            // Create moon with perfect circle
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#aaaaff';
            ctx.fill();
            
            // Add inner highlight for more dimension
            ctx.beginPath();
            ctx.arc(moonX - moonRadius * 0.2, moonY - moonRadius * 0.2, moonRadius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = '#ccccff';
            ctx.fill();
            
            // Add outer glow for more retro effect
            const gradient = ctx.createRadialGradient(
                moonX, moonY, moonRadius,
                moonX, moonY, moonRadius * 2
            );
            gradient.addColorStop(0, 'rgba(170, 170, 255, 0.5)');
            gradient.addColorStop(0.5, 'rgba(170, 170, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(170, 170, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonRadius * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        createAirplaneShape(ctx, width, height) {
            // Draw a retro-style single-prop plane
            const planeWidth = width * 0.5;
            const planeHeight = height * 0.3;
            const planeX = width * 0.25;
            const planeY = height * 0.4;
            
            // Clear the entire canvas to transparent
            ctx.clearRect(0, 0, width, height);
            
            // Fuselage (main body) - more elongated and rectangular
            ctx.fillStyle = '#dddddd';
            ctx.fillRect(planeX, planeY, planeWidth * 0.7, planeHeight * 0.4);
            
            // Cockpit - blocky and retro
            ctx.fillStyle = '#88ccff';
            ctx.fillRect(planeX + planeWidth * 0.5, planeY - planeHeight * 0.1, planeWidth * 0.15, planeHeight * 0.3);
            
            // Tail section - more defined
            ctx.fillStyle = '#dddddd';
            ctx.fillRect(planeX - planeWidth * 0.05, planeY, planeWidth * 0.15, planeHeight * 0.3);
            
            // Vertical stabilizer (tail fin)
            ctx.fillStyle = '#dddddd';
            ctx.fillRect(planeX, planeY - planeHeight * 0.3, planeWidth * 0.1, planeHeight * 0.4);
            
            // Main wings - more rectangular for retro look
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(planeX + planeWidth * 0.2, planeY + planeHeight * 0.2, planeWidth * 0.5, planeHeight * 0.1);
            
            // Propeller circle
            ctx.fillStyle = '#444444';
            ctx.beginPath();
            ctx.arc(planeX + planeWidth * 0.75, planeY + planeHeight * 0.2, planeHeight * 0.12, 0, Math.PI * 2);
            ctx.fill();
            
            // Propeller blades - blocky style
            ctx.fillStyle = '#333333';
            // Horizontal blade
            ctx.fillRect(planeX + planeWidth * 0.75 - planeHeight * 0.25, planeY + planeHeight * 0.2 - planeHeight * 0.03, planeHeight * 0.5, planeHeight * 0.06);
            // Vertical blade
            ctx.fillRect(planeX + planeWidth * 0.75 - planeHeight * 0.03, planeY + planeHeight * 0.2 - planeHeight * 0.25, planeHeight * 0.06, planeHeight * 0.5);
            
            // Windows - square for retro look
            ctx.fillStyle = '#88ccff';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(
                    planeX + planeWidth * 0.15 + i * planeWidth * 0.12, 
                    planeY + planeHeight * 0.1, 
                    planeWidth * 0.08, 
                    planeHeight * 0.15
                );
            }
            
            // Landing gear - simple blocky style
            ctx.fillStyle = '#555555';
            // Left wheel structure
            ctx.fillRect(planeX + planeWidth * 0.2, planeY + planeHeight * 0.4, planeWidth * 0.05, planeHeight * 0.2);
            ctx.fillRect(planeX + planeWidth * 0.18, planeY + planeHeight * 0.6, planeWidth * 0.09, planeHeight * 0.08);
            
            // Right wheel structure
            ctx.fillRect(planeX + planeWidth * 0.5, planeY + planeHeight * 0.4, planeWidth * 0.05, planeHeight * 0.2);
            ctx.fillRect(planeX + planeWidth * 0.48, planeY + planeHeight * 0.6, planeWidth * 0.09, planeHeight * 0.08);
        }
        
        createAirplane(x, y, flippedDirection) {
            try {
                // Create airplane sprite
                const airplane = this.add.sprite(x, y, 'airplane');
                
                // Set scale and flip if needed
                airplane.setScale(0.5);
                if (flippedDirection) {
                    airplane.setFlipX(true);
                }
                
                return airplane;
            } catch (error) {
                console.error('Error creating airplane:', error);
                // Create a fallback airplane using graphics
                const graphics = this.add.graphics();
                
                // Basic airplane shape
                const width = 80;
                const height = 30;
                
                // Draw basic airplane shape with transparent background
                graphics.clear();
                graphics.fillStyle(0xdddddd, 1);
                graphics.fillRect(x - width/2, y - height/2, width * 0.7, height * 0.4);
                
                // Add cockpit
                graphics.fillStyle(0x88ccff, 1);
                graphics.fillRect(x - width/4, y - height/2, width * 0.2, height * 0.4);
                
                return graphics;
            }
        }
        
        createSponsors() {
            try {
                // Create placeholder airplane texture if it doesn't exist
                if (!this.textures.exists('airplane')) {
                    this.createPlaceholder('airplane');
                }
                
                const height = this.sys.game.config.height;
                
                // Create the bolt.new airplane and banner
                const boltPlane = this.createAirplane(100, gameWidth < 768 ? height - 480 : height - 420, false);
                boltPlane.setDepth(1);
                
                // Create banner with text for bolt.new - updated colors and text size
                const boltBanner = this.add.rectangle(boltPlane.x - 350, boltPlane.y + 20, 250, 80, 0xff3366);
                const boltOutline = this.add.rectangle(boltPlane.x - 350, boltPlane.y + 20, 254, 84, 0xffffff);
                boltOutline.setDepth(1);
                boltBanner.setDepth(1);
                
                // Make banner interactive
                boltBanner.setInteractive({ useHandCursor: true });
                boltBanner.on('pointerdown', () => {
                    window.open('https://bolt.new/', '_blank');
                });
                
                const boltText = this.add.text(boltBanner.x, boltBanner.y, 'Sponsored by\n@boltdotnew', {
                    fontFamily: 'monospace',
                    fontSize: 16,
                    color: '#000000', // Black text for better readability on red banner
                    align: 'center',
                    lineSpacing: 5
                }).setOrigin(0.5).setDepth(1);
                
                // Make text interactive too
                boltText.setInteractive({ useHandCursor: true });
                boltText.on('pointerdown', () => {
                    window.open('https://bolt.new/', '_blank');
                });
                
                // Create rope connecting plane to banner
                const boltRope = this.add.graphics();
                boltRope.lineStyle(2, 0xffffff);
                boltRope.lineBetween(boltPlane.x - 50, boltPlane.y + 10, boltBanner.x + 150, boltBanner.y);
                boltRope.setDepth(1);
                
                // Create the CodeRabbit airplane and banner (flying in opposite direction)
                const rabbitPlane = this.createAirplane(this.game.config.width - 100, gameWidth < 768 ? height - 520 : height - 460, true);
                rabbitPlane.setDepth(1);
                
                // Create banner with text for CodeRabbit - updated colors and text size
                const rabbitBanner = this.add.rectangle(rabbitPlane.x + 350, rabbitPlane.y + 20, 250, 80, 0x33ccff);
                const rabbitOutline = this.add.rectangle(rabbitPlane.x + 350, rabbitPlane.y + 20, 254, 84, 0xffffff);
                rabbitOutline.setDepth(1);
                rabbitBanner.setDepth(1);
                
                // Make banner interactive
                rabbitBanner.setInteractive({ useHandCursor: true });
                rabbitBanner.on('pointerdown', () => {
                    window.open('https://www.coderabbit.ai/', '_blank');
                });
                
                const rabbitText = this.add.text(rabbitBanner.x, rabbitBanner.y, 'Sponsored by\n@coderabbitai', {
                    fontFamily: 'monospace',
                    fontSize: 16,
                    color: '#000000', // Black text for better readability on blue banner
                    align: 'center',
                    lineSpacing: 5
                }).setOrigin(0.5).setDepth(1);
                
                // Make text interactive too
                rabbitText.setInteractive({ useHandCursor: true });
                rabbitText.on('pointerdown', () => {
                    window.open('https://www.coderabbit.ai/', '_blank');
                });
                
                // Create rope connecting plane to banner
                const rabbitRope = this.add.graphics();
                rabbitRope.lineStyle(2, 0xffffff);
                rabbitRope.lineBetween(rabbitPlane.x + 50, rabbitPlane.y + 10, rabbitBanner.x - 150, rabbitBanner.y);
                rabbitRope.setDepth(1);
                
                // Store airplane objects for animation
                this.airplanes = [
                    {
                        plane: boltPlane,
                        banner: boltBanner,
                        outline: boltOutline,
                        text: boltText,
                        rope: boltRope,
                        direction: 1,
                        speed: 2
                    },
                    {
                        plane: rabbitPlane,
                        banner: rabbitBanner,
                        outline: rabbitOutline,
                        text: rabbitText,
                        rope: rabbitRope,
                        direction: -1,
                        speed: 2
                    }
                ];
            } catch (error) {
                console.error('Error creating sponsors:', error);
                this.createFallbackScene();
            }
        }
        
        create() {
            console.log('CityscapeScene create started');
            const width = this.sys.game.config.width;
            const height = this.sys.game.config.height;
            
            try {
                // Add sky background
                if (this.textures.exists('sky')) {
                    console.log('Adding sky background');
                    this.add.image(width/2, height/2, 'sky').setDisplaySize(width, height);
                } else {
                    console.error('Sky texture does not exist, using fallback');
                    // Create a fallback sky
                    const graphics = this.add.graphics();
                    graphics.fillStyle(0x001133, 1);
                    graphics.fillRect(0, 0, width, height);
                }
                
                // Create cityscape silhouette
                console.log('Creating cityscape silhouette');
                this.createCityscape();
                
                // Create street at the bottom
                this.createStreet();
                
                // Create vehicles
                this.createVehicles();
                
                // Create billboards
                console.log('Creating billboards');
                this.createBillboards();
                
                // Create flying airplanes with sponsor banners
                console.log('Creating sponsor airplanes');
                this.createSponsors();
                
                // Setup camera
                this.setupCamera();
                
                // Setup airplane animations
                this.time.addEvent({
                    delay: this.airplaneSpawnInterval,
                    callback: this.spawnAirplane,
                    callbackScope: this,
                    loop: true
                });
                
            } catch (error) {
                console.error('Error in create method:', error);
                this.createFallbackScene();
            }
        }
        
        createVehicles() {
            const width = this.sys.game.config.width;
            const height = this.sys.game.config.height;
            
            // Store vehicles array
            this.vehicles = [];
            
            // Vehicle types and their colors
            const vehicleTypes = [
                { 
                    type: 'car', 
                    width: 50, 
                    height: 25, 
                    colors: [0xff3366, 0x33ccff, 0x66ff33, 0xffcc00, 0xff6633, 0x9933ff],
                    wheelSize: 6
                },
                { 
                    type: 'car', 
                    width: 50, 
                    height: 25, 
                    colors: [0x666666, 0x888888, 0x444444, 0x555555],
                    wheelSize: 6
                }
            ];
            
            // Create vehicles going in both directions
            for (let i = 0; i < 4; i++) { // Reduced from 8 to 4 vehicles
                const direction = i % 2 === 0 ? -1 : 1;
                // For trucks, always set direction to 1 (left to right) and flip horizontally
                const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
                const actualDirection = direction;
                
                // Adjust lane position to be properly on the road
                const lane = actualDirection === 1 ? height - 40 : height - 20;
                const color = vehicleType.colors[Math.floor(Math.random() * vehicleType.colors.length)];
                
                // Create vehicle graphics
                const vehicle = this.add.graphics();
                const laneDepth = lane === height - 40 ? 4 : 3; // Closer lane (lower y value) has higher depth
                vehicle.setDepth(laneDepth); // Set vehicle depth based on lane
                
                // Initial position and flip trucks horizontally
                const startX = actualDirection === 1 ? -vehicleType.width : width + vehicleType.width;
                const shouldFlipX = vehicleType.type === 'truck';
                
                // Draw vehicle body
                if (vehicleType.type === 'car') {
                    // Car shape - more retro style
                    vehicle.fillStyle(color, 1);
                    
                    // Main body
                    vehicle.fillRect(vehicle.x, vehicle.y - vehicleType.height/2, vehicleType.width, vehicleType.height);
                    
                    // Roof (slightly smaller than body)
                    vehicle.fillStyle(color, 1);
                    const roofWidth = vehicleType.width * 0.6;
                    const roofHeight = vehicleType.height * 0.5;
                    // Position roof directly on top of the main body, lowered
                    const roofX = vehicle.x + (vehicle.direction === 1 ? vehicleType.width * 0.2 : vehicleType.width * 0.2);
                    vehicle.fillRect(roofX, vehicle.y - vehicleType.height/2 - roofHeight/4, roofWidth, roofHeight);
                    
                    // Windows
                    vehicle.fillStyle(0x88ccff, 1);
                    const windowWidth = roofWidth * 0.4;
                    const windowHeight = roofHeight * 0.7;
                    const windowX = roofX + (vehicle.direction === 1 ? roofWidth * 0.1 : roofWidth * 0.5);
                    vehicle.fillRect(windowX, vehicle.y - vehicleType.height/2 - roofHeight/2 + roofHeight * 0.15, windowWidth, windowHeight);
                    
                    // Wheels
                    vehicle.fillStyle(0x000000, 1);
                    vehicle.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicleType.width * 0.8 : vehicleType.width * 0.2), vehicle.y + vehicleType.height/2 - 2, vehicleType.wheelSize);
                    vehicle.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicleType.width * 0.2 : vehicleType.width * 0.8), vehicle.y + vehicleType.height/2 - 2, vehicleType.wheelSize);
                    
                    // Wheel rims
                    vehicle.fillStyle(0xcccccc, 1);
                    vehicle.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicleType.width * 0.8 : vehicleType.width * 0.2), vehicle.y + vehicleType.height/2 - 2, vehicleType.wheelSize/2);
                    vehicle.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicleType.width * 0.2 : vehicleType.width * 0.8), vehicle.y + vehicleType.height/2 - 2, vehicleType.wheelSize/2);
                } else {
                    // Truck shape - more detailed
                    vehicle.fillStyle(color, 1);
                    
                    // Cargo section (always behind cabin)
                    const cargoHeight = vehicleType.height * 1.2;
                    const cargoWidth = vehicleType.width * 0.7;
                    const cargoX = shouldFlipX ? vehicle.x : vehicle.x + vehicleType.width * 0.3;
                    vehicle.fillRect(cargoX, vehicle.y - cargoHeight/2, cargoWidth, cargoHeight);
                    
                    // Cabin (always at front)
                    const cabinWidth = vehicleType.width * 0.3;
                    const cabinHeight = vehicleType.height * 0.8;
                    const cabinX = shouldFlipX ? vehicle.x + vehicleType.width * 0.7 : vehicle.x;
                    vehicle.fillRect(cabinX, vehicle.y - cabinHeight/2, cabinWidth, cabinHeight);
                    
                    // Cabin window
                    vehicle.fillStyle(0x88ccff, 1);
                    const windowWidth = cabinWidth * 0.7;
                    const windowHeight = cabinHeight * 0.4;
                    const windowX = cabinX + cabinWidth * 0.15;
                    vehicle.fillRect(windowX, vehicle.y - cabinHeight/2 + cabinHeight * 0.15, windowWidth, windowHeight);
                    
                    // Wheels
                    vehicle.fillStyle(0x000000, 1);
                    vehicle.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicleType.width * 0.2 : vehicleType.width * 0.8), vehicle.y + vehicleType.height/2 - 2, vehicleType.wheelSize);
                    vehicle.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicleType.width * 0.8 : vehicleType.width * 0.2), vehicle.y + vehicleType.height/2 - 2, vehicleType.wheelSize);
                    vehicle.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicleType.width * 0.65 : vehicleType.width * 0.35), vehicle.y + vehicleType.height/2 - 2, vehicleType.wheelSize);
                    
                    // Wheel rims
                    vehicle.fillStyle(0xcccccc, 1);
                    vehicle.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicleType.width * 0.2 : vehicleType.width * 0.8), vehicle.y + vehicleType.height/2 - 2, vehicleType.wheelSize/2);
                    vehicle.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicleType.width * 0.8 : vehicleType.width * 0.2), vehicle.y + vehicleType.height/2 - 2, vehicleType.wheelSize/2);
                    vehicle.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicleType.width * 0.65 : vehicleType.width * 0.35), vehicle.y + vehicleType.height/2 - 2, vehicleType.wheelSize/2);
                }
                
                // Store vehicle data
                this.vehicles.push({
                    graphics: vehicle,
                    x: startX,
                    y: lane,
                    direction: actualDirection,
                    speed: 1 + Math.random() * 1.5,
                    type: vehicleType
                });
            }
        }
        
        createFallbackScene() {
            console.log('Creating fallback scene');
            const width = this.sys.game.config.width;
            const height = this.sys.game.config.height;
            
            // Clear any existing objects
            this.children.removeAll();
            
            // Create a basic background
            const graphics = this.add.graphics();
            graphics.fillStyle(0x001133, 1);
            graphics.fillRect(0, 0, width, height);
            
            // Add some text
            const text = this.add.text(width/2, height/2 - 100, 'CITYSCAPE VIEW', {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                fill: '#ffffff',
                align: 'center',
            }).setOrigin(0.5, 0.5);
            
            // Add simple cards
            cardData.forEach((card, index) => {
                const xPos = width * (index + 1) / (cardData.length + 1);
                const yPos = height / 2 + 50;
                
                // Card background
                const cardBg = this.add.rectangle(xPos, yPos, 200, 120, 0x222222);
                cardBg.setStrokeStyle(4, 0xff3366);
                
                // Card title
                this.add.text(xPos, yPos - 40, card.title, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '12px',
                    fill: '#ffffff',
                    align: 'center',
                }).setOrigin(0.5, 0.5);
                
                // Card content
                this.add.text(xPos, yPos + 10, card.content, {
                    fontFamily: 'Inter',
                    fontSize: '10px',
                    fill: '#e0ffe0',
                    align: 'center',
                    wordWrap: { width: 180 }
                }).setOrigin(0.5, 0.5);
            });
            
            // Create simplified airplanes with sponsor banners
            this.airplanes = [];
            
            // Create bolt.new airplane (simplified)
            const boltPlaneGraphics = this.add.graphics();
            boltPlaneGraphics.fillStyle(0xdddddd, 1);
            
            // Plane coordinates
            const planeX = 0;
            const planeY = height * 0.15;
            const planeWidth = 80;
            const planeHeight = 30;
            
            // Fuselage (main body)
            boltPlaneGraphics.fillRect(planeX, planeY, planeWidth * 0.7, planeHeight * 0.4);
            
            // Cockpit - blocky and retro
            boltPlaneGraphics.fillStyle(0x88ccff, 1);
            boltPlaneGraphics.fillRect(planeX + planeWidth * 0.5, planeY - planeHeight * 0.1, planeWidth * 0.15, planeHeight * 0.3);
            
            // Tail section
            boltPlaneGraphics.fillStyle(0xdddddd, 1);
            boltPlaneGraphics.fillRect(planeX - planeWidth * 0.05, planeY, planeWidth * 0.15, planeHeight * 0.3);
            
            // Vertical stabilizer (tail fin)
            boltPlaneGraphics.fillRect(planeX, planeY - planeHeight * 0.3, planeWidth * 0.1, planeHeight * 0.4);
            
            // Main wings
            boltPlaneGraphics.fillStyle(0xcccccc, 1);
            boltPlaneGraphics.fillRect(planeX + planeWidth * 0.2, planeY + planeHeight * 0.2, planeWidth * 0.5, planeHeight * 0.1);
            
            // Propeller 
            boltPlaneGraphics.fillStyle(0x444444, 1);
            boltPlaneGraphics.fillCircle(planeX + planeWidth * 0.75, planeY + planeHeight * 0.2, planeHeight * 0.12);
            
            // Create bolt.new banner
            const boltBannerGraphics = this.add.graphics();
            boltBannerGraphics.fillStyle(0xff3333, 1);
            boltBannerGraphics.fillRect(planeX + 50, planeY - 15, 150, 30);
            
            // Add bolt.new text
            const boltText = this.add.text(planeX + 125, planeY, 'bolt.new', {
                fontFamily: '"Press Start 2P"',
                fontSize: '32px',
                fill: '#ffffff',
                align: 'center',
            }).setOrigin(0.5, 0.5);
            
            // Create bolt.new rope
            const boltRopeGraphics = this.add.graphics();
            boltRopeGraphics.lineStyle(2, 0xffffff, 1);
            boltRopeGraphics.lineBetween(planeX + 15, planeY + 5, planeX + 50, planeY);
            
            // Create coderabbit airplane (simplified)
            const rabbitPlaneGraphics = this.add.graphics();
            rabbitPlaneGraphics.fillStyle(0xdddddd, 1);
            
            // Plane coordinates
            const rabbitX = width;
            const rabbitY = height * 0.3;
            
            // Fuselage (main body) - mirrored for opposite direction
            rabbitPlaneGraphics.fillRect(rabbitX - planeWidth * 0.7, rabbitY, planeWidth * 0.7, planeHeight * 0.4);
            
            // Cockpit - blocky and retro
            rabbitPlaneGraphics.fillStyle(0x88ccff, 1);
            rabbitPlaneGraphics.fillRect(rabbitX - planeWidth * 0.65, rabbitY - planeHeight * 0.1, planeWidth * 0.15, planeHeight * 0.3);
            
            // Tail section
            rabbitPlaneGraphics.fillStyle(0xdddddd, 1);
            rabbitPlaneGraphics.fillRect(rabbitX - planeWidth * 0.1, rabbitY, planeWidth * 0.15, planeHeight * 0.3);
            
            // Vertical stabilizer (tail fin)
            rabbitPlaneGraphics.fillRect(rabbitX - planeWidth * 0.1, rabbitY - planeHeight * 0.3, planeWidth * 0.1, planeHeight * 0.4);
            
            // Main wings
            rabbitPlaneGraphics.fillStyle(0xcccccc, 1);
            rabbitPlaneGraphics.fillRect(rabbitX - planeWidth * 0.7, rabbitY + planeHeight * 0.2, planeWidth * 0.5, planeHeight * 0.1);
            
            // Propeller 
            rabbitPlaneGraphics.fillStyle(0x444444, 1);
            rabbitPlaneGraphics.fillCircle(rabbitX - planeWidth * 0.75, rabbitY + planeHeight * 0.2, planeHeight * 0.12);
            
            // Create coderabbit banner
            const rabbitBannerGraphics = this.add.graphics();
            rabbitBannerGraphics.fillStyle(0x44bbff, 1);
            rabbitBannerGraphics.fillRect(rabbitX - 200, rabbitY - 15, 150, 30);
            
            // Add coderabbit text
            const rabbitText = this.add.text(rabbitX - 125, rabbitY, 'CodeRabbit', {
                fontFamily: '"Press Start 2P"',
                fontSize: '32px',
                fill: '#ffffff',
                align: 'center',
            }).setOrigin(0.5, 0.5);
            
            // Create coderabbit rope
            const rabbitRopeGraphics = this.add.graphics();
            rabbitRopeGraphics.lineStyle(2, 0xffffff, 1);
            rabbitRopeGraphics.lineBetween(rabbitX - 15, rabbitY + 5, rabbitX - 50, rabbitY);
            
            // Store airplane objects for animation
            this.airplanes.push({
                plane: boltPlaneGraphics,
                banner: boltBannerGraphics,
                text: boltText,
                rope: boltRopeGraphics,
                x: 0,
                direction: 1,
                speed: 1
            });
            
            this.airplanes.push({
                plane: rabbitPlaneGraphics,
                banner: rabbitBannerGraphics,
                text: rabbitText,
                rope: rabbitRopeGraphics,
                x: width,
                direction: -1,
                speed: 0.8
            });
        }
        
        createCityscape() {
            const width = this.sys.game.config.width;
            const height = this.sys.game.config.height;
            
            try {
                // Create 3 layers of buildings for parallax effect
                for (let layer = 0; layer < 3; layer++) {
                    const buildingKey = `building${layer + 1}`;
                    
                    // Verify texture exists
                    if (!this.textures.exists(buildingKey)) {
                        console.error(`Texture ${buildingKey} does not exist, creating placeholder`);
                        this.createPlaceholder(buildingKey);
                    }
                    
                    // More buildings for more variety
                    const buildingCount = 8 + layer * 3;
                    // Reduce the height by positioning buildings lower (closer to bottom)
                    const yPos = height - 100 + layer * 20; // Reduced from 150 and 30
                    // Reduce the scale to make buildings shorter
                    const scale = (0.7 - layer * 0.15); // Reduced from 1.0 and 0.2
                    
                    // Create buildings with varying heights and widths
                    for (let i = 0; i < buildingCount; i++) {
                        const xPos = (width / buildingCount) * i;
                        
                        try {
                            // Vary the height randomly for each building, but with lower range
                            const heightVariation = Math.random() * 0.3 + 0.6; // Reduced from 0.5+0.75 to 0.3+0.6
                            const widthVariation = Math.random() * 0.3 + 0.9;
                            
                            // Create the building
                            const building = this.add.image(xPos, yPos, buildingKey)
                                .setOrigin(0, 1)
                                .setScale(scale * widthVariation, scale * heightVariation);
                            
                            // Tint buildings with slightly different colors
                            const colorVariation = Math.round(Math.random() * 40 - 20);
                            const baseRed = 150 - layer * 30;
                            const baseGreen = 150 - layer * 30;
                            const baseBlue = 170 - layer * 20;
                            
                            const tint = Phaser.Display.Color.GetColor(
                                Math.max(0, Math.min(255, baseRed + colorVariation)),
                                Math.max(0, Math.min(255, baseGreen + colorVariation)),
                                Math.max(0, Math.min(255, baseBlue + colorVariation + 10))
                            );
                            building.setTint(tint);
                            
                            // Add some depth by adding a darker side to buildings
                            if (i > 0 && i < buildingCount - 1) {
                                // Add shadow on one side
                                const shadowWidth = building.width * 0.15;
                                const shadowHeight = building.height;
                                const shadowX = xPos + building.width - shadowWidth;
                                const shadowY = yPos - building.height;
                                
                                const shadow = this.add.rectangle(
                                    shadowX, 
                                    shadowY, 
                                    shadowWidth, 
                                    shadowHeight, 
                                    0x000000, 
                                    0.3
                                ).setOrigin(0, 0);
                            }
                        } catch (error) {
                            console.error(`Error creating building at layer ${layer}, position ${i}:`, error);
                        }
                    }
                }
            } catch (error) {
                console.error('Error in createCityscape:', error);
                // Create a simplified cityscape as fallback
                this.createSimplifiedCityscape();
            }
        }
        
        createSimplifiedCityscape() {
            console.log('Creating simplified cityscape');
            const width = this.sys.game.config.width;
            const height = this.sys.game.config.height;
            
            // Draw simple building silhouettes with graphics
            const graphics = this.add.graphics();
            
            // More defined skyline with additional details
            // Draw 3 layers of buildings
            for (let layer = 0; layer < 3; layer++) {
                // Darker color for back buildings
                const baseColor = Phaser.Display.Color.GetColor(
                    70 - layer * 15,
                    80 - layer * 15,
                    120 - layer * 15
                );
                
                // Increased building count for more variety
                const buildingCount = 10 + layer * 3;
                // Reduce the height by positioning buildings closer to bottom
                const yBase = height - 80 + layer * 20; // Reduced from 100 and 30
                
                // Create buildings with varying heights
                for (let i = 0; i < buildingCount; i++) {
                    // Vary building width and position
                    const buildingWidth = (width / buildingCount) * (0.9 + Math.random() * 0.2);
                    const xPos = (width / buildingCount) * i * (0.9 + Math.random() * 0.2);
                    
                    // Reduce building heights for more compact skyline
                    const minHeight = 40 + layer * 8; // Reduced from 80+10
                    const maxHeight = 120 - layer * 20; // Reduced from 200-30
                    const buildingHeight = minHeight + Math.random() * (maxHeight - minHeight);
                    
                    // Slightly vary color for each building
                    const colorVariation = Math.round(Math.random() * 20 - 10);
                    const color = Phaser.Display.Color.GetColor(
                        Math.max(0, Math.min(255, 70 - layer * 15 + colorVariation)),
                        Math.max(0, Math.min(255, 80 - layer * 15 + colorVariation)),
                        Math.max(0, Math.min(255, 120 - layer * 15 + colorVariation))
                    );
                    
                    graphics.fillStyle(color, 1);
                    
                    // Draw main building shape
                    graphics.fillRect(xPos, yBase - buildingHeight, buildingWidth, buildingHeight);
                    
                    // Add building details
                    
                    // Add a slightly darker side to create depth
                    graphics.fillStyle(Phaser.Display.Color.GetColor(
                        Math.max(0, 70 - layer * 15 - 20),
                        Math.max(0, 80 - layer * 15 - 20),
                        Math.max(0, 120 - layer * 15 - 20)
                    ), 1);
                    
                    // Side shadow for depth
                    graphics.fillRect(
                        xPos + buildingWidth - buildingWidth * 0.2, 
                        yBase - buildingHeight,
                        buildingWidth * 0.2, 
                        buildingHeight
                    );
                    
                    // Add building tops for some variety (like water towers, antennas)
                    if (Math.random() > 0.7) { // Reduced from 0.6 to 0.7 for fewer tops
                        // Draw antenna or water tower
                        const topWidth = buildingWidth * 0.2; // Reduced from 0.3
                        const topHeight = buildingHeight * 0.1; // Reduced from 0.15
                        const topX = xPos + (buildingWidth - topWidth) / 2;
                        
                        graphics.fillStyle(color, 1); // Use same color as building
                        graphics.fillRect(topX, yBase - buildingHeight - topHeight, topWidth, topHeight);
                    }
                    
                    // Add windows with more defined pattern but fewer of them
                    graphics.fillStyle(0xffff88, 0.6);
                    
                    // Calculate window dimensions based on building size
                    const windowWidth = Math.max(3, buildingWidth / 15);
                    const windowHeight = Math.max(4, buildingHeight / 20);
                    const windowsPerRow = Math.max(2, Math.floor(buildingWidth / (windowWidth * 2.5))); // Increased spacing
                    const windowRows = Math.max(2, Math.floor(buildingHeight / (windowHeight * 2.5))); // Increased spacing
                    
                    // Create a grid of windows
                    for (let row = 0; row < windowRows; row++) {
                        for (let col = 0; col < windowsPerRow; col++) {
                            // Randomly skip more windows to create sparser pattern
                            if (Math.random() > 0.5) { // Changed from 0.3 to 0.5
                                const windowX = xPos + col * (buildingWidth / windowsPerRow) + buildingWidth / (windowsPerRow * 2) - windowWidth / 2;
                                const windowY = yBase - buildingHeight + row * (buildingHeight / windowRows) + buildingHeight / (windowRows * 2) - windowHeight / 2;
                                graphics.fillRect(windowX, windowY, windowWidth, windowHeight);
                            }
                        }
                    }
                }
            }
        }
        
        createBillboards() {
            const width = this.sys.game.config.width;
            const height = this.sys.game.config.height;
            
            try {
                // Clear any previous billboards
                billboards = [];
                
                // Calculate responsive dimensions
                const isMobile = width < 768;
                const billboardScale = isMobile ? 0.5 : 0.85;
                const verticalOffset = isMobile ? 40 : 0;
                
                // Helper function to create clickable Twitter handle
                const createTwitterHandle = (handle, x, y, fontSize) => {
                    const text = this.add.text(x, y, handle, {
                        fontFamily: '"Press Start 2P"',
                        fontSize: fontSize,
                        fill: '#e0ffe0', // Changed to match the content text color
                        align: 'center'
                    }).setOrigin(0.5, 0.5).setDepth(2);
                    
                    // Make text interactive
                    text.setInteractive({ useHandCursor: true });
                    text.on('pointerdown', () => {
                        window.open(`https://x.com/${handle.replace('@', '')}`, '_blank');
                    });
                    
                    return text;
                };
                
                // Function to process content and create clickable handles
                const createClickableContent = (content, xPos, yPos, fontSize, billboardWidth) => {
                    // First split by ' + ' for major sections
                    const sections = content.split(' + ');
                    let currentY = yPos;
                    const lineHeight = parseInt(fontSize) * (content.includes("@karpathy") ? 1.1 : 1.5); // Further reduced line height for jury section
                    const textObjects = [];
                    const maxWidth = billboardWidth - 40; // Add padding
                    const startY = yPos + (content.includes("@karpathy") ? lineHeight * 0.3 : lineHeight); // Reduced starting Y for jury section
                    currentY = startY;

                    sections.forEach((section, sectionIndex) => {
                        const part = section.trim();
                        
                        // Create temporary text to measure width
                        const tempText = this.add.text(0, 0, part, {
                            fontFamily: '"Press Start 2P"',
                            fontSize: fontSize,
                            wordWrap: { width: maxWidth }
                        });
                        const wordWidth = tempText.width;
                        tempText.destroy(); // Clean up temporary text

                        // If text would overflow, move to next line
                        if (wordWidth > maxWidth) {
                            currentY += lineHeight;
                        }

                        if (part.startsWith('@')) {
                            const handle = createTwitterHandle(part, xPos, currentY, fontSize);
                            textObjects.push(handle);
                        } else {
                            const text = this.add.text(xPos, currentY, part, {
                                fontFamily: '"Press Start 2P"',
                                fontSize: fontSize,
                                fill: '#e0ffe0',
                                align: 'center',
                                wordWrap: { width: maxWidth }
                            }).setOrigin(0.5, 0.5).setDepth(2);
                            textObjects.push(text);
                        }

                        // Move to next line for next section
                        currentY += lineHeight;
                    });

                    return textObjects;
                };
                
                // On mobile, remove sponsors card and rearrange remaining cards
                const displayCards = [...cardData];
                if (isMobile) {
                    displayCards.splice(displayCards.findIndex(card => card.title.includes("Sponsors")), 1);
                } else {
                    // On desktop, keep all cards
                    const sponsorCard = displayCards.find(card => card.title.includes("Sponsors"));
                    if (sponsorCard) {
                        const index = displayCards.indexOf(sponsorCard);
                        displayCards.splice(index, 1);
                        displayCards.push(sponsorCard);
                    }
                }
                
                // Create billboards for each card
                displayCards.forEach((card, index) => {
                    try {
                        let xPos, yPos;
                        
                        if (isMobile) {
                            // Center all billboards horizontally
                            xPos = width / 2;
                            // Stack vertically from bottom up with spacing
                            const baseHeight = height - 100;
                            const spacing = 160; // Space between billboards
                            yPos = baseHeight - (index * spacing);
                        } else {
                            xPos = width * (index + 0.5) / (displayCards.length);
                            yPos = height - 180;
                        }
                        
                        // Create support structure
                        const support = this.add.graphics();
                        support.fillStyle(0x444444, 1);
                        support.setDepth(card.title.includes("Meet the Jury") ? 6 : 7); // Ensure billboards are above vehicles
                        
                        // Conditionally render the pole based on screen size
                        if (!(isMobile && card.title.includes("Meet the Jury"))) {
                            support.fillRect(xPos - 8, yPos, 16, height - yPos - 60); // Adjust pole height to stop at road
                        }
                        
                        // Draw billboard frame
                        const frame = this.add.graphics();
                        frame.setDepth(0);
                        
                        // Billboard dimensions - increased size
                        const bgWidth = isMobile ? 220 : 280; // Increased from 180/240
                        const bgHeight = isMobile ? 140 : 180; // Increased from 120/150
                        const bgX = xPos - bgWidth/2;
                        const bgY = yPos - (isMobile ? 130 : 170); // Adjusted to account for larger height
                        
                        // Create billboard background with gradient
                        for (let i = 0; i < bgHeight; i += 4) {
                            const shade = 0x222222 + (i * 0x000101);
                            frame.fillStyle(shade, 1);
                            frame.fillRect(bgX, bgY + i, bgWidth, 4);
                        }
                        
                        // Metal frame
                        frame.lineStyle(4, 0x777777, 1);
                        frame.strokeRect(bgX, bgY, bgWidth, bgHeight);
                        
                        // Inner border - adjusted padding
                        frame.lineStyle(2, 0x555555, 1);
                        frame.strokeRect(bgX + 8, bgY + 8, bgWidth - 16, bgHeight - 16);
                        
                        // Bottom highlight
                        frame.lineStyle(2, 0xaaaaaa, 0.5);
                        frame.lineBetween(bgX + 12, bgY + bgHeight - 4, bgX + bgWidth - 12, bgY + bgHeight - 4);
                        
                        // Add title - adjusted position for consistent spacing
                        const fontSize = isMobile ? '14px' : '18px';
                        const contentSize = isMobile ? '12px' : '14px';
                        const titleText = this.add.text(xPos, bgY + (isMobile ? 35 : 45), card.title, {
                            fontFamily: '"Press Start 2P"',
                            fontSize: fontSize,
                            fill: '#ffffff',
                            align: 'center',
                            wordWrap: { width: bgWidth - 24 }
                        }).setOrigin(0.5, 0.5).setDepth(2);
                        
                        // Create clickable content with adjusted position and width
                        const contentObjects = createClickableContent(
                            card.content,
                            xPos,
                            bgY + (isMobile ? 65 : 85), // Reduced vertical gap between title and content
                            contentSize,
                            bgWidth - 24
                        );
                        
                        // Store references
                        billboards.push({
                            title: titleText,
                            content: contentObjects,
                            support: support,
                            frame: frame,
                            isMobile: isMobile
                        });
                    } catch (error) {
                        console.error(`Error creating billboard for card ${index}:`, error);
                    }
                });
            } catch (error) {
                console.error('Error in createBillboards:', error);
                this.createSimplifiedBillboards();
            }
        }
        
        createSimplifiedBillboards() {
            console.log('Creating simplified billboards');
            const width = this.sys.game.config.width;
            const height = this.sys.game.config.height;
            
            // Clear any previous billboards
            billboards = [];
            
            // Draw simplified billboards with graphics
            cardData.forEach((card, index) => {
                try {
                    const xPos = 150 + index * (width / 3);
                    const yPos = height - 180;
                    
                    // Create billboard background
                    const graphics = this.add.graphics();
                    
                    // Draw more substantial support structure
                    graphics.fillStyle(0x555555, 1);
                    // Main pole
                    graphics.fillRect(xPos - 8, yPos - 100, 16, 100);
                    // Cross beams
                    graphics.fillRect(xPos - 30, yPos - 50, 60, 8);
                    
                    // Billboard panel size - make it bigger
                    const bgWidth = 200;
                    const bgHeight = 110;
                    const bgX = xPos - bgWidth/2;
                    const bgY = yPos - 190;
                    
                    // Draw billboard background with gradient
                    for (let i = 0; i < bgHeight; i += 5) {
                        const shade = 0x222222 + (i * 0x000101); // Subtle gradient
                        graphics.fillStyle(shade, 1);
                        graphics.fillRect(bgX, bgY + i, bgWidth, 5);
                    }
                    
                    // Draw billboard border
                    graphics.lineStyle(4, 0x666666, 1);
                    graphics.strokeRect(bgX, bgY, bgWidth, bgHeight);
                    
                    // Add internal frame
                    graphics.lineStyle(2, 0x555555, 1);
                    graphics.strokeRect(bgX + 10, bgY + 10, bgWidth - 20, bgHeight - 20);
                    
                    // Add spotlights at top of billboard
                    graphics.fillStyle(0x333333, 1);
                    graphics.fillRect(bgX + 20, bgY - 8, 30, 8);
                    graphics.fillRect(bgX + bgWidth - 50, bgY - 8, 30, 8);
                    
                    // Add text directly with better positioning
                    const titleText = this.add.text(xPos, bgY + 30, card.title, {
                        fontFamily: '"Press Start 2P"',
                        fontSize: '14px',
                        fill: '#ffffff',
                        align: 'center',
                        wordWrap: { width: bgWidth - 30 }
                    }).setOrigin(0.5, 0.5);
                    
                    const contentText = this.add.text(xPos, bgY + 70, card.content, {
                        fontFamily: 'Inter',
                        fontSize: '12px',
                        fill: '#e0ffe0',
                        align: 'center',
                        wordWrap: { width: bgWidth - 40 }
                    }).setOrigin(0.5, 0.5);
                    
                    // Add shadow to text for better readability
                    try {
                        if (titleText.setShadow) {
                            titleText.setShadow(2, 2, '#000000', 2);
                        }
                    } catch (e) {
                        console.warn('Text shadow not supported:', e);
                    }
                    
                    // Store references for animation
                    billboards.push({
                        container: graphics,
                        title: titleText,
                        content: contentText
                    });
                } catch (error) {
                    console.error(`Error creating simplified billboard ${index}:`, error);
                }
            });
        }
        
        createStreet() {
            const width = this.sys.game.config.width;
            const height = this.sys.game.config.height;
            
            try {
                // Create street graphics
                const street = this.add.graphics();
                
                // Draw main street background
                street.fillStyle(0x222222, 1);
                street.fillRect(0, height - 60, width, 60);
                
                // Draw border at the top of the street
                street.fillStyle(0x444444, 1);
                street.fillRect(0, height - 60, width, 3);
                
                // Draw center line dashed pattern
                street.fillStyle(0xffcc00, 1);
                const dashLength = 40;
                const gapLength = 40;
                const lineY = height - 30; // Center of the street
                const lineHeight = 6;
                
                // Draw dashed line segments
                for (let x = 0; x < width; x += dashLength + gapLength) {
                    street.fillRect(x, lineY - lineHeight/2, dashLength, lineHeight);
                }
                
                // Add some street details
                // Draw sidewalk at the top
                street.fillStyle(0x555555, 1);
                street.fillRect(0, height - 60, width, 10);
                
                // Draw manholes/drains
                street.fillStyle(0x333333, 1);
                for (let x = 100; x < width; x += 300) {
                    street.fillRect(x, height - 20, 30, 10);
                    // Draw manhole cover detail
                    street.lineStyle(1, 0x666666, 1);
                    street.strokeRect(x + 2, height - 18, 26, 6);
                }
                
            } catch (error) {
                console.error('Error creating street:', error);
                
                // Simple fallback if the main street creation fails
                try {
                    const fallbackStreet = this.add.graphics();
                    fallbackStreet.fillStyle(0x222222, 1);
                    fallbackStreet.fillRect(0, height - 60, width, 60);
                    fallbackStreet.fillStyle(0xffcc00, 1);
                    
                    for (let x = 0; x < width; x += 80) {
                        fallbackStreet.fillRect(x, height - 30, 40, 6);
                    }
                } catch (fallbackError) {
                    console.error('Even fallback street creation failed:', fallbackError);
                }
            }
        }
        
        setupCamera() {
            try {
                console.log('Setting up camera effects');
                
                // Check if billboards array is valid
                if (billboards && billboards.length > 0) {
                    // Extract valid containers for animation
                    const validContainers = billboards
                        .filter(b => b && b.container)
                        .map(b => b.container);
                    
                    if (validContainers.length > 0) {
                        // Add subtle parallax effect by moving buildings
                        this.tweens.add({
                            targets: validContainers,
                            x: '+=10',
                            yoyo: true,
                            duration: 3000,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                        
                        console.log('Camera effects setup complete');
                    } else {
                        console.warn('No valid billboard containers found for animation');
                    }
                } else {
                    console.warn('No billboards array or empty billboards array');
                }
            } catch (error) {
                console.error('Error setting up camera:', error);
            }
        }
        
        update() {
            try {
                // Update vehicles
                if (this.vehicles && this.vehicles.length > 0) {
                    const width = this.sys.game.config.width;
                    
                    this.vehicles.forEach(vehicle => {
                        // Update position
                        vehicle.x += vehicle.speed * vehicle.direction;
                        vehicle.graphics.clear();
                        
                        // Redraw vehicle at new position
                        if (vehicle.type.type === 'car') {
                            // Car shape - more retro style
                            vehicle.graphics.fillStyle(vehicle.type.colors[0], 1);
                            
                            // Main body
                            vehicle.graphics.fillRect(vehicle.x, vehicle.y - vehicle.type.height/2, vehicle.type.width, vehicle.type.height);
                            
                            // Roof
                            const roofWidth = vehicle.type.width * 0.6;
                            const roofHeight = vehicle.type.height * 0.5;
                            const roofX = vehicle.x + (vehicle.direction === 1 ? vehicle.type.width * 0.2 : vehicle.type.width * 0.2);
                            vehicle.graphics.fillRect(roofX, vehicle.y - vehicle.type.height - roofHeight/2, roofWidth, roofHeight);
                            
                            // Windows
                            vehicle.graphics.fillStyle(0x88ccff, 1);
                            const windowWidth = roofWidth * 0.4;
                            const windowHeight = roofHeight * 0.7;
                            const windowX = roofX + (vehicle.direction === 1 ? roofWidth * 0.1 : roofWidth * 0.5);
                            vehicle.graphics.fillRect(windowX, vehicle.y - vehicle.type.height - roofHeight/2 + roofHeight * 0.15, windowWidth, windowHeight);
                            
                            // Wheels
                            vehicle.graphics.fillStyle(0x000000, 1);
                            vehicle.graphics.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicle.type.width * 0.8 : vehicle.type.width * 0.2), vehicle.y + vehicle.type.height/2 - 2, vehicle.type.wheelSize);
                            vehicle.graphics.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicle.type.width * 0.2 : vehicle.type.width * 0.8), vehicle.y + vehicle.type.height/2 - 2, vehicle.type.wheelSize);
                            
                            // Wheel rims
                            vehicle.graphics.fillStyle(0xcccccc, 1);
                            vehicle.graphics.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicle.type.width * 0.8 : vehicle.type.width * 0.2), vehicle.y + vehicle.type.height/2 - 2, vehicle.type.wheelSize/2);
                            vehicle.graphics.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicle.type.width * 0.2 : vehicle.type.width * 0.8), vehicle.y + vehicle.type.height/2 - 2, vehicle.type.wheelSize/2);
                        } else {
                            // Truck shape - more detailed
                            vehicle.graphics.fillStyle(vehicle.type.colors[0], 1);
                            
                            // Cargo section
                            const cargoHeight = vehicle.type.height * 1.2;
                            const cargoWidth = vehicle.type.width * 0.7;
                            const cargoX = vehicle.x + (vehicle.direction === 1 ? vehicle.type.width * 0.3 : 0);
                            vehicle.graphics.fillRect(cargoX, vehicle.y - cargoHeight/2, cargoWidth, cargoHeight);
                            
                            // Cabin
                            const cabinWidth = vehicle.type.width * 0.3;
                            const cabinHeight = vehicle.type.height * 0.8;
                            const cabinX = vehicle.x + (vehicle.direction === 1 ? 0 : vehicle.type.width * 0.7);
                            vehicle.graphics.fillRect(cabinX, vehicle.y - cabinHeight/2, cabinWidth, cabinHeight);
                            
                            // Cabin window
                            vehicle.graphics.fillStyle(0x88ccff, 1);
                            const windowWidth = cabinWidth * 0.7;
                            const windowHeight = cabinHeight * 0.4;
                            const windowX = cabinX + (vehicle.direction === 1 ? cabinWidth * 0.15 : cabinWidth * 0.15);
                            vehicle.graphics.fillRect(windowX, vehicle.y - cabinHeight/2 + cabinHeight * 0.15, windowWidth, windowHeight);
                            
                            // Wheels
                            vehicle.graphics.fillStyle(0x000000, 1);
                            vehicle.graphics.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicle.type.width * 0.2 : vehicle.type.width * 0.8), vehicle.y + vehicle.type.height/2 - 2, vehicle.type.wheelSize);
                            vehicle.graphics.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicle.type.width * 0.8 : vehicle.type.width * 0.2), vehicle.y + vehicle.type.height/2 - 2, vehicle.type.wheelSize);
                            vehicle.graphics.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicle.type.width * 0.65 : vehicle.type.width * 0.35), vehicle.y + vehicle.type.height/2 - 2, vehicle.type.wheelSize);
                            
                            // Wheel rims
                            vehicle.graphics.fillStyle(0xcccccc, 1);
                            vehicle.graphics.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicle.type.width * 0.2 : vehicle.type.width * 0.8), vehicle.y + vehicle.type.height/2 - 2, vehicle.type.wheelSize/2);
                            vehicle.graphics.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicle.type.width * 0.8 : vehicle.type.width * 0.2), vehicle.y + vehicle.type.height/2 - 2, vehicle.type.wheelSize/2);
                            vehicle.graphics.fillCircle(vehicle.x + (vehicle.direction === 1 ? vehicle.type.width * 0.65 : vehicle.type.width * 0.35), vehicle.y + vehicle.type.height/2 - 2, vehicle.type.wheelSize/2);
                        }
                        
                        // Reset position when vehicle goes off screen
                        if ((vehicle.direction > 0 && vehicle.x > width + vehicle.type.width) ||
                            (vehicle.direction < 0 && vehicle.x < -vehicle.type.width)) {
                            vehicle.x = vehicle.direction > 0 ? -vehicle.type.width : width + vehicle.type.width;
                        }
                    });
                }
                
                // Only apply effects if billboards exist
                if (billboards && billboards.length > 0) {
                    // Continuous animations and updates
                    billboards.forEach(billboard => {
                        // Make sure billboard is valid
                        if (billboard && billboard.container) {
                            // Add neon flickering effect (very rare)
                            if (Math.random() > 0.995) {
                                try {
                                    // Simple alpha-based flicker
                                    billboard.container.alpha = 0.7;
                                    setTimeout(() => {
                                        if (billboard.container) {
                                            billboard.container.alpha = 1;
                                        }
                                    }, 50);
                                } catch (e) {
                                    console.warn('Error creating flicker effect:', e);
                                }
                            }
                        }
                    });
                }
                
                // Animate airplanes
                if (this.airplanes && this.airplanes.length > 0) {
                    const width = this.sys.game.config.width;
                    
                    this.airplanes.forEach(airplane => {
                        // Check if this is a fallback airplane (using graphics)
                        if (airplane.plane && airplane.plane.type === 'Graphics') {
                            // Fallback airplane animation
                            // Clear previous graphics
                            airplane.plane.clear();
                            airplane.banner.clear();
                            airplane.rope.clear();
                            
                            // Update position
                            airplane.x += airplane.speed * airplane.direction * 2;
                            
                            // Check boundaries and reset if needed
                            if ((airplane.direction > 0 && airplane.x > width + 50) ||
                                (airplane.direction < 0 && airplane.x < -50)) {
                                airplane.x = airplane.direction > 0 ? -50 : width + 50;
                            }
                            
                            // Set up plane dimensions
                            const planeY = airplane.plane.y;
                            const planeWidth = 80;
                            const planeHeight = 30;
                            
                            // Redraw airplane at new position
                            airplane.plane.fillStyle(0xdddddd, 1);
                            
                            if (airplane.direction > 0) {
                                // Fuselage (main body)
                                airplane.plane.fillRect(
                                    airplane.x, 
                                    planeY, 
                                    planeWidth * 0.7, 
                                    planeHeight * 0.4
                                );
                                
                                // Cockpit
                                airplane.plane.fillStyle(0x88ccff, 1);
                                airplane.plane.fillRect(
                                    airplane.x + planeWidth * 0.5, 
                                    planeY - planeHeight * 0.1, 
                                    planeWidth * 0.15, 
                                    planeHeight * 0.3
                                );
                                
                                // Tail section
                                airplane.plane.fillStyle(0xdddddd, 1);
                                airplane.plane.fillRect(
                                    airplane.x - planeWidth * 0.05, 
                                    planeY, 
                                    planeWidth * 0.15, 
                                    planeHeight * 0.3
                                );
                                
                                // Vertical stabilizer (tail fin)
                                airplane.plane.fillRect(
                                    airplane.x, 
                                    planeY - planeHeight * 0.3, 
                                    planeWidth * 0.1, 
                                    planeHeight * 0.4
                                );
                                
                                // Main wings
                                airplane.plane.fillStyle(0xcccccc, 1);
                                airplane.plane.fillRect(
                                    airplane.x + planeWidth * 0.2, 
                                    planeY + planeHeight * 0.2, 
                                    planeWidth * 0.5, 
                                    planeHeight * 0.1
                                );
                                
                                // Propeller
                                airplane.plane.fillStyle(0x444444, 1);
                                airplane.plane.fillCircle(
                                    airplane.x + planeWidth * 0.75, 
                                    planeY + planeHeight * 0.2, 
                                    planeHeight * 0.12
                                );
                            } else {
                                // Fuselage (main body) - mirrored for opposite direction
                                airplane.plane.fillRect(
                                    airplane.x - planeWidth * 0.7, 
                                    planeY, 
                                    planeWidth * 0.7, 
                                    planeHeight * 0.4
                                );
                                
                                // Cockpit
                                airplane.plane.fillStyle(0x88ccff, 1);
                                airplane.plane.fillRect(
                                    airplane.x - planeWidth * 0.65, 
                                    planeY - planeHeight * 0.1, 
                                    planeWidth * 0.15, 
                                    planeHeight * 0.3
                                );
                                
                                // Tail section
                                airplane.plane.fillStyle(0xdddddd, 1);
                                airplane.plane.fillRect(
                                    airplane.x - planeWidth * 0.1, 
                                    planeY, 
                                    planeWidth * 0.15, 
                                    planeHeight * 0.3
                                );
                                
                                // Vertical stabilizer (tail fin)
                                airplane.plane.fillRect(
                                    airplane.x - planeWidth * 0.1, 
                                    planeY - planeHeight * 0.3, 
                                    planeWidth * 0.1, 
                                    planeHeight * 0.4
                                );
                                
                                // Main wings
                                airplane.plane.fillStyle(0xcccccc, 1);
                                airplane.plane.fillRect(
                                    airplane.x - planeWidth * 0.7, 
                                    planeY + planeHeight * 0.2, 
                                    planeWidth * 0.5, 
                                    planeHeight * 0.1
                                );
                                
                                // Propeller
                                airplane.plane.fillStyle(0x444444, 1);
                                airplane.plane.fillCircle(
                                    airplane.x - planeWidth * 0.75, 
                                    planeY + planeHeight * 0.2, 
                                    planeHeight * 0.12
                                );
                            }
                            
                            // Redraw banner at new position
                            let bannerX = airplane.direction > 0 ? 
                                airplane.x + 50 : 
                                airplane.x - 200;
                            airplane.banner.fillStyle(airplane.direction > 0 ? 0xff3333 : 0x44bbff, 1);
                            airplane.banner.fillRect(bannerX, airplane.banner.y - 15, 150, 30);
                            
                            // Update text position
                            airplane.text.x = airplane.direction > 0 ? 
                                airplane.x + 125 : 
                                airplane.x - 125;
                            
                            // Redraw rope
                            airplane.rope.lineStyle(2, 0xffffff, 1);
                            if (airplane.direction > 0) {
                                airplane.rope.lineBetween(
                                    airplane.x + 15, 
                                    planeY + 5,
                                    bannerX, 
                                    planeY
                                );
                            } else {
                                airplane.rope.lineBetween(
                                    airplane.x - 15, 
                                    planeY + 5,
                                    bannerX + 150, 
                                    planeY
                                );
                            }
                        }
                        // Regular airplane animation
                        else if (airplane && airplane.plane) {
                            // Move the airplane
                            const speed = airplane.speed * 1.5; // Reduced from 2 to 1.5 for slower movement
                            airplane.plane.x += speed * airplane.direction;
                            
                            // Move the banner and text behind the plane
                            if (airplane.banner) {
                                if (airplane.direction > 0) {
                                    // Flying left to right - banner trails behind
                                    airplane.banner.x = airplane.plane.x - 200;
                                    if (airplane.text) {
                                        airplane.text.x = airplane.banner.x;
                                    }
                                } else {
                                    // Flying right to left - banner trails behind
                                    airplane.banner.x = airplane.plane.x + 200;
                                    if (airplane.text) {
                                        airplane.text.x = airplane.banner.x;
                                    }
                                }
                            }
                            
                            // Redraw the rope
                            if (airplane.rope) {
                                airplane.rope.clear();
                                airplane.rope.lineStyle(2, 0xffffff, 1);
                                airplane.rope.beginPath();
                                
                                if (airplane.direction > 0) {
                                    // Flying left to right - rope connects to back of plane
                                    airplane.rope.moveTo(airplane.plane.x - 30, airplane.plane.y + 10);
                                    airplane.rope.lineTo(airplane.banner.x + 150, airplane.banner.y);
                                } else {
                                    // Flying right to left - rope connects to back of plane
                                    airplane.rope.moveTo(airplane.plane.x + 30, airplane.plane.y + 10);
                                    airplane.rope.lineTo(airplane.banner.x - 150, airplane.banner.y);
                                }
                                
                                airplane.rope.strokePath();
                            }
                            
                            // Reset position when airplane goes off screen
                            if ((airplane.direction > 0 && airplane.plane.x > width + 200) ||
                                (airplane.direction < 0 && airplane.plane.x < -200)) {
                                if (airplane.direction > 0) {
                                    // Reset to left side
                                    airplane.plane.x = -200;
                                    if (airplane.banner) {
                                        airplane.banner.x = airplane.plane.x - 200;
                                        if (airplane.text) {
                                            airplane.text.x = airplane.banner.x;
                                        }
                                    }
                                } else {
                                    // Reset to right side
                                    airplane.plane.x = width + 200;
                                    if (airplane.banner) {
                                        airplane.banner.x = airplane.plane.x + 200;
                                        if (airplane.text) {
                                            airplane.text.x = airplane.banner.x;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Error in update method:', error);
            }
        }
        
        spawnAirplane() {
            const airplane = this.add.sprite(-100, 100, 'airplane');
            airplane.setScale(0.5);
            
            // Animate airplane across the screen
            this.tweens.add({
                targets: airplane,
                x: this.sys.game.config.width + 100,
                duration: this.sys.game.config.width / this.airplaneSpeed * 1000,
                ease: 'Linear',
                onComplete: () => {
                    airplane.destroy();
                }
            });
        }
        
        // Method to handle window resize events
        adjustForResize(width, height) {
            try {
                console.log('Adjusting cityscape for resize:', width, height);
                
                // Clear existing buildings
                const buildingObjects = this.children && this.children.list ? 
                    this.children.list.filter(child => 
                        child && 
                        child.texture && 
                        child.texture.key && 
                        typeof child.texture.key === 'string' && 
                        child.texture.key.includes('building')
                    ) : [];
                    
                buildingObjects.forEach(building => {
                    if (building && building.destroy) {
                        building.destroy();
                    }
                });
                    
                // Clear billboards
                if (billboards && Array.isArray(billboards)) {
                    billboards.forEach(billboard => {
                        if (billboard && billboard.container) billboard.container.destroy();
                        if (billboard && billboard.title) billboard.title.destroy();
                        if (billboard && billboard.content) billboard.content.destroy();
                    });
                    billboards = [];
                }
                
                // Clear airplanes
                if (this.airplanes && Array.isArray(this.airplanes)) {
                    this.airplanes.forEach(airplane => {
                        if (airplane && airplane.plane) airplane.plane.destroy();
                        if (airplane && airplane.banner) airplane.banner.destroy();
                        if (airplane && airplane.rope) airplane.rope.destroy();
                        if (airplane && airplane.text) airplane.text.destroy();
                    });
                    this.airplanes = [];
                }
                
                // Recreate scene elements
                this.createCityscape();
                this.createStreet();
                this.createBillboards();
                this.createSponsors();
                this.setupCamera();
                
            } catch (error) {
                console.error('Error in adjustForResize method:', error);
                this.createFallbackScene();
            }
        }
    }
    
    // Public API
    return {
        init: function(containerId) {
            // Remove console.log and replace with silent initialization
            try {
                // Get container dimensions
                const container = document.getElementById(containerId);
                if (!container) {
                    return this;
                }
                
                // Use window dimensions
                gameWidth = window.innerWidth;
                gameHeight = window.innerHeight;
                
                // Create placeholder assets first
                this.createAssetsDirectory();
                
                // Configure Phaser instance
                config = {
                    type: Phaser.AUTO,
                    width: gameWidth,
                    height: gameHeight,
                    parent: containerId,
                    scene: CityscapeScene,
                    transparent: true,
                    backgroundColor: '#001133',
                    scale: {
                        mode: Phaser.Scale.RESIZE,
                        autoCenter: Phaser.Scale.CENTER_BOTH,
                        width: gameWidth,
                        height: gameHeight
                    },
                    render: {
                        pixelArt: false,
                        antialias: true,
                        antialiasGL: true,
                        failIfMajorPerformanceCaveat: false
                    }
                };
                
                // Create game instance with error handling
                try {
                    if (game) {
                        game.destroy(true);
                        game = null;
                    }
                    game = new Phaser.Game(config);
                } catch (e) {
                    this.createFallbackView(containerId);
                }
            } catch (error) {
                this.createFallbackView(containerId);
            }
            
            return this;
        },
        
        createAssetsDirectory: function() {
            try {
                console.log('Creating placeholder assets for cityscape');
                this.createSimplePlaceholders();
            } catch (error) {
                console.error('Could not create placeholder assets:', error);
            }
            return this;
        },
        
        createSimplePlaceholders: function() {
            // Create placeholder assets
            this.createSkyPlaceholder();
            this.createBuildingPlaceholders();
            this.createBillboardPlaceholder();
            this.createAirplanePlaceholder();
        },
        
        createSkyPlaceholder: function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 1200;
                canvas.height = 600;
                
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#001133';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Add a few stars
                ctx.fillStyle = '#ffffff';
                for (let i = 0; i < 50; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    ctx.fillRect(x, y, 2, 2);
                }
                
                const dataURL = canvas.toDataURL('image/png');
                localStorage.setItem('phaser_asset_sky', dataURL);
                console.log('Created sky placeholder');
            } catch (e) {
                console.error('Error creating sky placeholder:', e);
            }
        },
        
        createBuildingPlaceholders: function() {
            const buildings = [
                { name: 'building1', width: 300, height: 500, color: '#335577' },
                { name: 'building2', width: 300, height: 400, color: '#446688' },
                { name: 'building3', width: 300, height: 300, color: '#557799' }
            ];
            
            buildings.forEach(building => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = building.width;
                    canvas.height = building.height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = building.color;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Add a few windows
                    ctx.fillStyle = '#ffff88';
                    for (let i = 0; i < 20; i++) {
                        const x = Math.random() * (canvas.width - 20);
                        const y = Math.random() * (canvas.height - 20);
                        ctx.fillRect(x, y, 10, 10);
                    }
                    
                    const dataURL = canvas.toDataURL('image/png');
                    localStorage.setItem(`phaser_asset_${building.name}`, dataURL);
                    console.log(`Created ${building.name} placeholder`);
                } catch (e) {
                    console.error(`Error creating ${building.name} placeholder:`, e);
                }
            });
        },
        
        createBillboardPlaceholder: function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 250;
                canvas.height = 200;
                
                const ctx = canvas.getContext('2d');
                
                // Background gradient
                const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                bgGradient.addColorStop(0, '#222222');
                bgGradient.addColorStop(1, '#333333');
                ctx.fillStyle = bgGradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw billboard panel
                ctx.fillStyle = '#222222';
                ctx.fillRect(25, 20, canvas.width - 50, canvas.height - 80);
                
                // Draw support structure
                ctx.fillStyle = '#555555';
                // Main pole
                ctx.fillRect(canvas.width/2 - 10, canvas.height - 60, 20, 60);
                // Cross beams
                ctx.fillRect(canvas.width/2 - 40, canvas.height - 80, 80, 10);
                
                // Add billboard frame
                ctx.strokeStyle = '#777777';
                ctx.lineWidth = 6;
                ctx.strokeRect(25, 20, canvas.width - 50, canvas.height - 80);
                
                // Add inner border
                ctx.strokeStyle = '#555555';
                ctx.lineWidth = 2;
                ctx.strokeRect(35, 30, canvas.width - 70, canvas.height - 100);
                
                // Add placeholder text
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('BILLBOARD', canvas.width/2, 70);
                
                const dataURL = canvas.toDataURL('image/png');
                localStorage.setItem('phaser_asset_billboard', dataURL);
                console.log('Created billboard placeholder');
            } catch (e) {
                console.error('Error creating billboard placeholder:', e);
            }
        },
        
        resize: function() {
            // Handle resizing
            if (game) {
                const newWidth = window.innerWidth;
                const newHeight = window.innerHeight;
                
                if (newWidth !== gameWidth || newHeight !== gameHeight) {
                    game.scale.resize(newWidth, newHeight);
                    gameWidth = newWidth;
                    gameHeight = newHeight;
                    
                    // If there's an active scene, tell it to adjust the layout
                    if (game.scene && game.scene.scenes.length > 0) {
                        const activeScene = game.scene.getScenes(true)[0];
                        if (activeScene && activeScene.adjustForResize) {
                            activeScene.adjustForResize(newWidth, newHeight);
                        }
                    }
                }
            }
            return this;
        },
        
        destroy: function() {
            if (game) {
                game.destroy(true);
                game = null;
            }
            return this;
        },
        
        // Create a fallback view without Phaser for environments where WebGL/Canvas isn't available
        createFallbackView: function(containerId) {
            console.log('Creating fallback view for cityscape');
            
            try {
                const container = document.getElementById(containerId);
                if (!container) return;
                
                // Clear the container
                container.innerHTML = '';
                
                // Set background
                container.style.backgroundColor = '#001133';
                container.style.padding = '20px';
                
                // Create header
                const header = document.createElement('h2');
                header.textContent = 'CITYSCAPE VIEW';
                header.style.color = '#ffffff';
                header.style.textAlign = 'center';
                header.style.fontFamily = '"Press Start 2P", cursive';
                header.style.marginBottom = '40px';
                container.appendChild(header);
                
                // Create card container
                const cardContainer = document.createElement('div');
                cardContainer.style.display = 'flex';
                cardContainer.style.justifyContent = 'space-around';
                cardContainer.style.flexWrap = 'wrap';
                cardContainer.style.gap = '20px';
                container.appendChild(cardContainer);
                
                // Create cards as "billboards"
                cardData.forEach(card => {
                    const billboard = document.createElement('div');
                    billboard.className = 'fallback-billboard';
                    billboard.style.width = '200px';
                    billboard.style.backgroundColor = '#222222';
                    billboard.style.padding = '15px';
                    billboard.style.border = '4px solid #ff3366';
                    billboard.style.borderRadius = '4px';
                    billboard.style.boxShadow = '0 0 10px rgba(255, 51, 102, 0.5)';
                    
                    const title = document.createElement('h3');
                    title.textContent = card.title;
                    title.style.color = '#ffffff';
                    title.style.fontFamily = '"Press Start 2P", cursive';
                    title.style.fontSize = '14px';
                    title.style.marginBottom = '15px';
                    title.style.textAlign = 'center';
                    
                    const content = document.createElement('p');
                    content.textContent = card.content;
                    content.style.color = '#e0ffe0';
                    content.style.fontFamily = 'Inter, sans-serif';
                    content.style.fontSize = '12px';
                    content.style.textAlign = 'center';
                    
                    billboard.appendChild(title);
                    billboard.appendChild(content);
                    cardContainer.appendChild(billboard);
                    
                    // Add a simple flicker animation
                    setInterval(() => {
                        if (Math.random() > 0.95) {
                            billboard.style.opacity = '0.7';
                            setTimeout(() => {
                                billboard.style.opacity = '1';
                            }, 100);
                        }
                    }, 500);
                });
            } catch (error) {
                console.error('Error creating fallback view:', error);
            }
        }
    };
})();

// Export the module for use in other files
if (typeof window !== 'undefined') {
    window.cityscapeGame = cityscapeGame;
} 
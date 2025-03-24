const createSkyBackground = function(ctx, width, height) {
    // Add more stars with varying sizes and brightness
    const starCount = 300; // Increase the number of stars
    for (let i = 0; i < starCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 3 + 1; // Vary the size of the stars
        const brightness = Math.random() * 0.8 + 0.2; // Vary the brightness

        ctx.globalAlpha = brightness;
        ctx.fillStyle = '#ffffff';
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
};

const createVehicles = function() {
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
            colors: [0xff0000, 0x888888], // Red and grey colors
            wheelSize: 6
        }
    ];

    // Create vehicles going in both directions
    for (let i = 0; i < 4; i++) { // Reduced from 8 to 4 vehicles
        const direction = i % 2 === 0 ? -1 : 1;
        const vehicleType = vehicleTypes[0]; // Only cars
        const actualDirection = direction;

        // Adjust lane position to be properly on the road
        const lane = actualDirection === 1 ? height - 40 : height - 20;
        const color = vehicleType.colors[Math.floor(Math.random() * vehicleType.colors.length)];

        // Create vehicle graphics
        const vehicle = this.add.graphics();
        const laneDepth = lane === height - 40 ? 4 : 3; // Closer lane (lower y value) has higher depth
        vehicle.setDepth(laneDepth); // Set vehicle depth based on lane

        // Initial position
        const startX = actualDirection === 1 ? -vehicleType.width : width + vehicleType.width;

        // Draw vehicle body
        vehicle.fillStyle(color, 1);

        // Main body
        vehicle.fillRect(vehicle.x, vehicle.y - vehicleType.height/2, vehicleType.width, vehicleType.height);

        // Roof (slightly smaller than body)
        const roofWidth = vehicleType.width * 0.6;
        const roofHeight = vehicleType.height * 0.5;
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
}; 
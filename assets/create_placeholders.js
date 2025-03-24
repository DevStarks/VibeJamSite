/**
 * Script to generate placeholder PNG assets for the cityscape
 * Run this script with Node.js
 */

const fs = require('fs');
const { createCanvas } = require('canvas');

// Define the assets to create
const assets = [
    { name: 'building1', width: 300, height: 500, color: '#335577' },
    { name: 'building2', width: 300, height: 400, color: '#446688' },
    { name: 'building3', width: 300, height: 300, color: '#557799' },
    { name: 'billboard', width: 220, height: 180, color: '#aa6644' },
    { name: 'sky', width: 1200, height: 600, color: '#001133' },
    { name: 'airplane', width: 400, height: 200, color: '#eeeeee' }
];

// Create each asset
assets.forEach(asset => {
    // Create canvas
    const canvas = createCanvas(asset.width, asset.height);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = asset.color;
    ctx.fillRect(0, 0, asset.width, asset.height);
    
    // Add asset name as text
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(asset.name, 10, 30);
    
    // If this is a building, create a silhouette shape
    if (asset.name.includes('building')) {
        createBuildingSilhouette(ctx, asset.width, asset.height);
    }
    
    // If this is a billboard, create a billboard shape
    if (asset.name === 'billboard') {
        createBillboardShape(ctx, asset.width, asset.height);
    }
    
    // If this is the sky, add some stars
    if (asset.name === 'sky') {
        addStarsToSky(ctx, asset.width, asset.height);
    }
    
    // If this is an airplane, create an airplane shape
    if (asset.name === 'airplane') {
        createAirplaneShape(ctx, asset.width, asset.height);
    }
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`${asset.name}.png`, buffer);
    
    console.log(`Created ${asset.name}.png`);
});

// Helper function to create building silhouettes
function createBuildingSilhouette(ctx, width, height) {
    ctx.fillStyle = '#000000';
    
    // Building outline
    ctx.globalAlpha = 0.7;
    
    // Draw windows
    ctx.globalAlpha = 0.9;
    const windowSize = 15;
    const windowSpacing = 25;
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
    
    ctx.globalAlpha = 1.0;
}

// Helper function to create billboard shape
function createBillboardShape(ctx, width, height) {
    // Draw billboard panel
    ctx.fillStyle = '#222222';
    ctx.fillRect(25, 20, width - 50, height - 80);
    
    // Draw support structure
    ctx.fillStyle = '#555555';
    // Main pole
    ctx.fillRect(width/2 - 10, height - 60, 20, 60);
    // Cross beams
    ctx.fillRect(width/2 - 40, height - 80, 80, 10);
    
    // Add billboard frame
    ctx.strokeStyle = '#777777';
    ctx.lineWidth = 6;
    ctx.strokeRect(25, 20, width - 50, height - 80);
    
    // Add inner border
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 30, width - 70, height - 100);
    
    // Add placeholder text with larger font
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BILLBOARD', width/2, 70);
}

// Helper function to create airplane shape
function createAirplaneShape(ctx, width, height) {
    // Draw a simple airplane with banner
    const planeWidth = width * 0.6;
    const planeHeight = height * 0.4;
    const planeX = width * 0.2;
    const planeY = height * 0.3;
    
    // Airplane body
    ctx.fillStyle = '#eeeeee';
    ctx.beginPath();
    ctx.ellipse(planeX + planeWidth * 0.3, planeY + planeHeight * 0.5, planeWidth * 0.3, planeHeight * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Airplane wings
    ctx.fillStyle = '#dddddd';
    
    // Main wing
    ctx.beginPath();
    ctx.moveTo(planeX + planeWidth * 0.2, planeY + planeHeight * 0.5);
    ctx.lineTo(planeX + planeWidth * 0.4, planeY + planeHeight * 0.2);
    ctx.lineTo(planeX + planeWidth * 0.6, planeY + planeHeight * 0.2);
    ctx.lineTo(planeX + planeWidth * 0.4, planeY + planeHeight * 0.5);
    ctx.fill();
    
    // Tail wing
    ctx.beginPath();
    ctx.moveTo(planeX + planeWidth * 0.6, planeY + planeHeight * 0.4);
    ctx.lineTo(planeX + planeWidth * 0.7, planeY + planeHeight * 0.2);
    ctx.lineTo(planeX + planeWidth * 0.8, planeY + planeHeight * 0.2);
    ctx.lineTo(planeX + planeWidth * 0.7, planeY + planeHeight * 0.4);
    ctx.fill();
    
    // Vertical stabilizer
    ctx.beginPath();
    ctx.moveTo(planeX + planeWidth * 0.6, planeY + planeHeight * 0.4);
    ctx.lineTo(planeX + planeWidth * 0.7, planeY + planeHeight * 0.2);
    ctx.lineTo(planeX + planeWidth * 0.7, planeY);
    ctx.lineTo(planeX + planeWidth * 0.6, planeY + planeHeight * 0.2);
    ctx.fill();
    
    // Windows
    ctx.fillStyle = '#88ccff';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const windowX = planeX + planeWidth * 0.2 + i * planeWidth * 0.1;
        const windowY = planeY + planeHeight * 0.4;
        ctx.arc(windowX, windowY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Helper function to add stars to the sky
function addStarsToSky(ctx, width, height) {
    // Add some stars
    ctx.fillStyle = '#ffffff';
    
    for (let i = 0; i < 300; i++) {
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
    
    // Add a moon
    ctx.fillStyle = '#aaaaff';
    ctx.beginPath();
    ctx.arc(width - 100, 100, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some glow around the moon
    const gradient = ctx.createRadialGradient(width - 100, 100, 50, width - 100, 100, 100);
    gradient.addColorStop(0, 'rgba(150, 150, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(150, 150, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(width - 100, 100, 100, 0, Math.PI * 2);
    ctx.fill();
}

console.log('All placeholder assets created successfully'); 
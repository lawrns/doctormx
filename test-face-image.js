#!/usr/bin/env node

/**
 * Generate a valid test face image for testing
 */

const fs = require('fs');
const path = require('path');

// Create a simple face image using Canvas
const { createCanvas } = require('canvas');

// Create a 200x200 canvas
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');

// Fill background with skin tone
ctx.fillStyle = '#FDBCB4';
ctx.fillRect(0, 0, 200, 200);

// Draw a simple face
// Head outline
ctx.beginPath();
ctx.arc(100, 100, 80, 0, Math.PI * 2);
ctx.fillStyle = '#FAA0A0';
ctx.fill();
ctx.strokeStyle = '#E3735E';
ctx.lineWidth = 2;
ctx.stroke();

// Eyes
ctx.beginPath();
ctx.arc(70, 85, 10, 0, Math.PI * 2);
ctx.arc(130, 85, 10, 0, Math.PI * 2);
ctx.fillStyle = '#333';
ctx.fill();

// Nose
ctx.beginPath();
ctx.moveTo(100, 90);
ctx.lineTo(95, 110);
ctx.lineTo(105, 110);
ctx.closePath();
ctx.strokeStyle = '#E3735E';
ctx.stroke();

// Mouth
ctx.beginPath();
ctx.arc(100, 120, 20, 0, Math.PI);
ctx.strokeStyle = '#E3735E';
ctx.lineWidth = 3;
ctx.stroke();

// Add some redness to cheeks (to simulate a skin condition)
ctx.beginPath();
ctx.arc(50, 110, 15, 0, Math.PI * 2);
ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
ctx.fill();

ctx.beginPath();
ctx.arc(150, 110, 15, 0, Math.PI * 2);
ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
ctx.fill();

// Convert to data URL
const dataUrl = canvas.toDataURL('image/png');
console.log(dataUrl);

// Also save to file
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'test-face.png'), buffer);
console.log('Test face image saved to test-face.png');
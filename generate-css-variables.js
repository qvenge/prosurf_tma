#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const variablesPath = path.join(__dirname, 'src/shared/ds/variables.json');
const outputDir = path.join(__dirname, 'src/shared/ds');

function normalizeCSSVariableName(name) {
  return name
    .replace(/\//g, '-')
    .replace(/%/g, 'percent')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function convertFontWeight(weight) {
  const weightMap = {
    'Regular': '400',
    'Medium': '500',
    'SemiBold': '600',
    'Bold': '700'
  };
  return weightMap[weight] || weight.toLowerCase();
}

function generateColors(collections, primitives) {
  let css = ':root {\n';
  
  // Add primitive colors first
  primitives.forEach(variable => {
    if (variable.type === 'color' && !variable.isAlias) {
      const varName = `--color-${normalizeCSSVariableName(variable.name)}`;
      css += `  ${varName}: ${variable.value};\n`;
    }
  });
  
  // Add color tokens (aliases)
  collections.forEach(collection => {
    if (collection.name === 'Color tokens') {
      collection.modes.forEach(mode => {
        mode.variables.forEach(variable => {
          if (variable.type === 'color') {
            const varName = `--color-${normalizeCSSVariableName(variable.name)}`;
            if (variable.isAlias) {
              // Find the referenced primitive color
              const primitiveVar = primitives.find(p => p.name === variable.value.name);
              if (primitiveVar) {
                const primitiveVarName = `--color-${normalizeCSSVariableName(primitiveVar.name)}`;
                css += `  ${varName}: var(${primitiveVarName});\n`;
              }
            } else {
              css += `  ${varName}: ${variable.value};\n`;
            }
          }
        });
      });
    }
  });
  
  css += '}\n';
  return css;
}

function generateTypography(collections) {
  let css = ':root {\n';
  
  collections.forEach(collection => {
    if (collection.name === 'Typography') {
      collection.modes.forEach(mode => {
        mode.variables.forEach(variable => {
          if (variable.type === 'typography') {
            const baseName = normalizeCSSVariableName(variable.name);
            const value = variable.value;
            
            css += `  --font-${baseName}-size: ${value.fontSize}px;\n`;
            css += `  --font-${baseName}-family: "${value.fontFamily}";\n`;
            css += `  --font-${baseName}-weight: ${convertFontWeight(value.fontWeight)};\n`;
            css += `  --font-${baseName}-line-height: ${value.lineHeight}px;\n`;
            css += `  --font-${baseName}-letter-spacing: ${value.letterSpacing}px;\n`;
            
            if (value.textCase === 'UPPER') {
              css += `  --font-${baseName}-text-transform: uppercase;\n`;
            } else {
              css += `  --font-${baseName}-text-transform: none;\n`;
            }
            
            if (value.textDecoration !== 'NONE') {
              css += `  --font-${baseName}-text-decoration: ${value.textDecoration.toLowerCase()};\n`;
            } else {
              css += `  --font-${baseName}-text-decoration: none;\n`;
            }
            
            css += '\n';
          }
        });
      });
    }
  });
  
  css += '}\n';
  return css;
}

try {
  const data = JSON.parse(fs.readFileSync(variablesPath, 'utf8'));
  const collections = data.collections;
  
  // Find primitives collection
  const primitivesCollection = collections.find(c => c.name === 'Colors primitives');
  const primitives = primitivesCollection ? primitivesCollection.modes[0].variables : [];
  
  // Generate colors.css
  const colorsCSS = generateColors(collections, primitives);
  fs.writeFileSync(path.join(outputDir, 'colors.css'), colorsCSS);
  console.log('✅ Generated colors.css');
  
  // Generate typography.css
  const typographyCSS = generateTypography(collections);
  fs.writeFileSync(path.join(outputDir, 'typography.css'), typographyCSS);
  console.log('✅ Generated typography.css');
  
  console.log('🎉 CSS variables generated successfully!');
} catch (error) {
  console.error('❌ Error generating CSS variables:', error.message);
  process.exit(1);
}
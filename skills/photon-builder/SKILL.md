---
name: photon-builder
description: Guide for creating lightweight Photon MCPs - single-file TypeScript MCPs that run without compilation. Use when building MCP servers that integrate APIs, process data, or provide specific functionality in NCP ecosystem.
license: Apache 2.0
---

# Photon MCP Development Guide

## Overview

Photons are lightweight, single-file MCP (Model Context Protocol) servers written in TypeScript that run directly without compilation. They're the easiest way to extend NCP with custom functionality, API integrations, or data processing capabilities.

## What Makes Photons Special?

- ✅ **Single file** - Everything in one `.photon.ts` file
- ✅ **No compilation** - Runs directly with `tsx`
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Auto-discovered** - Drop in `~/.ncp/photons/` and they work
- ✅ **Fast development** - Edit and test immediately
- ✅ **Portable** - Share as single file

## Quick Start

### Minimal Photon

```typescript
/**
 * hello.photon.ts
 * A simple greeting photon
 */

export const metadata = {
  name: 'hello',
  version: '1.0.0',
  description: 'Simple greeting MCP',
  author: 'Your Name'
};

export default class HelloPhoton {
  /**
   * Say hello to someone
   */
  async greet(params: { name: string }) {
    return {
      message: `Hello, ${params.name}!`,
      timestamp: new Date().toISOString()
    };
  }
}
```

**Usage:**
```javascript
const result = await hello.greet({ name: 'World' });
// { message: 'Hello, World!', timestamp: '2024-12-23T...' }
```

## Photon Structure

### Required Exports

```typescript
// 1. Metadata (required)
export const metadata = {
  name: 'photon-name',           // Unique identifier
  version: '1.0.0',              // Semantic version
  description: 'What it does',   // Brief description
  author: 'Your Name'            // Author name
};

// 2. Default class export (required)
export default class PhotonName {
  // Your methods become MCP tools
  
  async methodName(params: ParamsType): Promise<ResultType> {
    // Implementation
  }
}
```

### Optional Exports

```typescript
// Schema for parameter validation
export const schema = {
  methodName: {
    description: 'What this method does',
    parameters: {
      type: 'object',
      properties: {
        paramName: {
          type: 'string',
          description: 'Parameter description'
        }
      },
      required: ['paramName']
    }
  }
};

// Configuration schema
export const config = {
  apiKey: {
    type: 'string',
    description: 'API key for service',
    required: false
  }
};
```

## Common Patterns

### API Integration Photon

```typescript
/**
 * weather.photon.ts
 * Weather API integration
 */

export const metadata = {
  name: 'weather',
  version: '1.0.0',
  description: 'Get weather information from OpenWeather API',
  author: 'NCP Team'
};

export const config = {
  apiKey: {
    type: 'string',
    description: 'OpenWeather API key',
    required: true
  }
};

export default class WeatherPhoton {
  private apiKey: string;
  
  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }
  
  /**
   * Get current weather for a city
   */
  async current(params: { city: string }) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${params.city}&appid=${this.apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      city: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed
    };
  }
  
  /**
   * Get 5-day forecast
   */
  async forecast(params: { city: string }) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${params.city}&appid=${this.apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      city: data.city.name,
      forecast: data.list.slice(0, 5).map((item: any) => ({
        date: item.dt_txt,
        temperature: item.main.temp,
        description: item.weather[0].description
      }))
    };
  }
}
```

### Data Processing Photon

```typescript
/**
 * text-analyzer.photon.ts
 * Text analysis utilities
 */

export const metadata = {
  name: 'text-analyzer',
  version: '1.0.0',
  description: 'Analyze text for various metrics',
  author: 'NCP Team'
};

export default class TextAnalyzerPhoton {
  /**
   * Count words, sentences, and characters
   */
  async analyze(params: { text: string }) {
    const text = params.text;
    
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    
    return {
      words: words.length,
      sentences: sentences.length,
      characters: characters,
      charactersNoSpaces: charactersNoSpaces,
      averageWordLength: charactersNoSpaces / words.length || 0,
      averageSentenceLength: words.length / sentences.length || 0
    };
  }
  
  /**
   * Extract keywords (simple frequency-based)
   */
  async keywords(params: { text: string; top?: number }) {
    const top = params.top || 10;
    const text = params.text.toLowerCase();
    
    // Remove common words
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'was', 'are', 'were']);
    
    const words = text
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));
    
    const frequency = new Map<string, number>();
    for (const word of words) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }
    
    const sorted = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, top);
    
    return {
      keywords: sorted.map(([word, count]) => ({ word, count }))
    };
  }
  
  /**
   * Calculate readability score (Flesch Reading Ease)
   */
  async readability(params: { text: string }) {
    const text = params.text;
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
    
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const fleschScore = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
    
    let level: string;
    if (fleschScore >= 90) level = 'Very Easy';
    else if (fleschScore >= 80) level = 'Easy';
    else if (fleschScore >= 70) level = 'Fairly Easy';
    else if (fleschScore >= 60) level = 'Standard';
    else if (fleschScore >= 50) level = 'Fairly Difficult';
    else if (fleschScore >= 30) level = 'Difficult';
    else level = 'Very Difficult';
    
    return {
      fleschScore: Math.round(fleschScore * 10) / 10,
      level: level,
      sentences: sentences.length,
      words: words.length,
      syllables: syllables
    };
  }
  
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }
}
```

### Database Photon

```typescript
/**
 * database.photon.ts
 * Simple key-value store
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export const metadata = {
  name: 'database',
  version: '1.0.0',
  description: 'Simple persistent key-value store',
  author: 'NCP Team'
};

export default class DatabasePhoton {
  private dbPath: string;
  private cache: Map<string, any>;
  
  constructor() {
    this.dbPath = join(homedir(), '.ncp', 'photons', 'database.json');
    this.cache = new Map();
    this.load();
  }
  
  private async load() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      const parsed = JSON.parse(data);
      this.cache = new Map(Object.entries(parsed));
    } catch (error) {
      // File doesn't exist yet
      this.cache = new Map();
    }
  }
  
  private async save() {
    const obj = Object.fromEntries(this.cache);
    await fs.writeFile(this.dbPath, JSON.stringify(obj, null, 2), 'utf-8');
  }
  
  /**
   * Set a key-value pair
   */
  async set(params: { key: string; value: any }) {
    this.cache.set(params.key, params.value);
    await this.save();
    
    return {
      success: true,
      key: params.key
    };
  }
  
  /**
   * Get value by key
   */
  async get(params: { key: string }) {
    const value = this.cache.get(params.key);
    
    return {
      key: params.key,
      value: value,
      exists: this.cache.has(params.key)
    };
  }
  
  /**
   * Delete a key
   */
  async delete(params: { key: string }) {
    const existed = this.cache.has(params.key);
    this.cache.delete(params.key);
    await this.save();
    
    return {
      success: true,
      existed: existed
    };
  }
  
  /**
   * List all keys
   */
  async keys() {
    return {
      keys: Array.from(this.cache.keys())
    };
  }
  
  /**
   * Clear all data
   */
  async clear() {
    this.cache.clear();
    await this.save();
    
    return {
      success: true
    };
  }
}
```

### Utility Photon

```typescript
/**
 * converter.photon.ts
 * Various conversion utilities
 */

export const metadata = {
  name: 'converter',
  version: '1.0.0',
  description: 'Convert between different units and formats',
  author: 'NCP Team'
};

export default class ConverterPhoton {
  /**
   * Convert temperature between units
   */
  async temperature(params: { value: number; from: 'C' | 'F' | 'K'; to: 'C' | 'F' | 'K' }) {
    let celsius: number;
    
    // Convert to Celsius first
    switch (params.from) {
      case 'C':
        celsius = params.value;
        break;
      case 'F':
        celsius = (params.value - 32) * 5/9;
        break;
      case 'K':
        celsius = params.value - 273.15;
        break;
    }
    
    // Convert to target
    let result: number;
    switch (params.to) {
      case 'C':
        result = celsius;
        break;
      case 'F':
        result = celsius * 9/5 + 32;
        break;
      case 'K':
        result = celsius + 273.15;
        break;
    }
    
    return {
      value: Math.round(result * 100) / 100,
      unit: params.to
    };
  }
  
  /**
   * Convert distance between units
   */
  async distance(params: { value: number; from: 'km' | 'mi' | 'm' | 'ft'; to: 'km' | 'mi' | 'm' | 'ft' }) {
    const toMeters: Record<string, number> = {
      'm': 1,
      'km': 1000,
      'mi': 1609.34,
      'ft': 0.3048
    };
    
    const meters = params.value * toMeters[params.from];
    const result = meters / toMeters[params.to];
    
    return {
      value: Math.round(result * 100) / 100,
      unit: params.to
    };
  }
  
  /**
   * Convert timestamp to different formats
   */
  async timestamp(params: { value: string | number; format: 'iso' | 'unix' | 'human' }) {
    const date = typeof params.value === 'string' 
      ? new Date(params.value)
      : new Date(params.value * 1000);
    
    let result: string | number;
    
    switch (params.format) {
      case 'iso':
        result = date.toISOString();
        break;
      case 'unix':
        result = Math.floor(date.getTime() / 1000);
        break;
      case 'human':
        result = date.toLocaleString();
        break;
    }
    
    return {
      value: result,
      format: params.format
    };
  }
  
  /**
   * Encode/decode base64
   */
  async base64(params: { value: string; operation: 'encode' | 'decode' }) {
    let result: string;
    
    if (params.operation === 'encode') {
      result = Buffer.from(params.value, 'utf-8').toString('base64');
    } else {
      result = Buffer.from(params.value, 'base64').toString('utf-8');
    }
    
    return {
      value: result,
      operation: params.operation
    };
  }
}
```

## Best Practices

### Error Handling

```typescript
async methodName(params: ParamsType) {
  try {
    // Validate parameters
    if (!params.required) {
      throw new Error('Missing required parameter');
    }
    
    // Do work
    const result = await someOperation();
    
    return {
      success: true,
      data: result
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Configuration Management

```typescript
export const config = {
  apiKey: {
    type: 'string',
    description: 'API key',
    required: true
  },
  timeout: {
    type: 'number',
    description: 'Request timeout in ms',
    default: 5000
  }
};

export default class MyPhoton {
  private apiKey: string;
  private timeout: number;
  
  constructor(config: { apiKey: string; timeout?: number }) {
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 5000;
  }
}
```

### Async Operations

```typescript
// Always use async/await
async fetchData(params: { url: string }) {
  const response = await fetch(params.url);
  return await response.json();
}

// Handle timeouts
async fetchWithTimeout(params: { url: string; timeout?: number }) {
  const timeout = params.timeout || 5000;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(params.url, {
      signal: controller.signal
    });
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### Type Safety

```typescript
// Define clear interfaces
interface SearchParams {
  query: string;
  limit?: number;
  offset?: number;
}

interface SearchResult {
  items: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  total: number;
  hasMore: boolean;
}

async search(params: SearchParams): Promise<SearchResult> {
  // Implementation with full type safety
}
```

## Testing Photons

### Manual Testing

```bash
# 1. Place photon in ~/.ncp/photons/
cp my-photon.photon.ts ~/.ncp/photons/

# 2. Use in code mode
node dist/index.js run code:run --params '{"code":"const result = await myPhoton.methodName({ param: \"value\" }); return result;"}'

# 3. Or use in CLI
node dist/index.js run myPhoton:methodName --params '{"param":"value"}'
```

### Unit Testing

```typescript
// my-photon.test.ts
import MyPhoton from './my-photon.photon';

describe('MyPhoton', () => {
  let photon: MyPhoton;
  
  beforeEach(() => {
    photon = new MyPhoton({ /* config */ });
  });
  
  test('methodName returns expected result', async () => {
    const result = await photon.methodName({ param: 'value' });
    expect(result).toEqual({ expected: 'result' });
  });
});
```

## Deployment

### Installation

```bash
# 1. Copy to photons directory
cp my-photon.photon.ts ~/.ncp/photons/

# 2. NCP auto-discovers it on next startup

# 3. Configure if needed
# Edit ~/.ncp/config.json to add configuration
```

### Distribution

```bash
# Share as single file
curl -o ~/.ncp/photons/weather.photon.ts \
  https://raw.githubusercontent.com/user/repo/main/weather.photon.ts

# Or via npm package
npm install -g ncp-photon-weather
# Package installs to ~/.ncp/photons/
```

## Common Use Cases

### 1. API Wrappers
- Weather services
- Translation APIs
- Database APIs
- Cloud services

### 2. Data Processing
- Text analysis
- Data transformation
- Format conversion
- Validation

### 3. Utilities
- File operations
- Network tools
- Crypto operations
- Date/time utilities

### 4. Integrations
- Third-party services
- Internal tools
- Custom databases
- Legacy systems

## Package Dependencies

Photons can use any npm package:

```typescript
// Import at top of file
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import * as cheerio from 'cheerio';

// Then use in methods
async scrape(params: { url: string }) {
  const response = await axios.get(params.url);
  const $ = cheerio.load(response.data);
  return { title: $('title').text() };
}
```

**Installation:**
```bash
cd ~/.ncp/photons
npm install axios csv-parse cheerio
```

## See Also

- For full MCPs: Use `mcp-builder` skill
- For Python skills: Not supported (use JavaScript)
- For complex servers: Consider full MCP with compilation

## License

Apache 2.0

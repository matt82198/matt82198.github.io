#!/usr/bin/env node

/**
 * Fetch Medium RSS feed and convert to JSON
 * Resilient: fails gracefully if Medium is down and feed file exists
 *
 * Usage: node scripts/fetch-medium.mjs
 * Output: src/data/medium-feed.json
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const feedPath = path.join(__dirname, '..', 'src', 'data', 'medium-feed.json');

/**
 * Fetch feed from Medium RSS
 */
function fetchFeed() {
  return new Promise((resolve, reject) => {
    https.get('https://medium.com/feed/@matt82198', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Parse RSS feed using regex
 * Handles CDATA content blocks
 */
function parseFeed(feedXml) {
  const posts = [];

  // Split by <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(feedXml)) !== null) {
    const item = match[1];

    // Extract title
    const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
    let title = titleMatch ? titleMatch[1].trim() : '';
    // Remove CDATA wrapping if present
    title = title.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();

    // Extract link
    const linkMatch = item.match(/<link>(.*?)<\/link>/);
    let url = linkMatch ? linkMatch[1].trim() : '';
    // Strip tracking params
    url = url.split('?')[0];

    // Extract pubDate
    const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
    const date = pubDateMatch ? new Date(pubDateMatch[1].trim()).toISOString() : '';

    // Extract excerpt from description or content:encoded
    let excerpt = '';
    const contentEncodedMatch = item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/);
    if (contentEncodedMatch) {
      let content = contentEncodedMatch[1];
      // Remove CDATA wrapping if present
      content = content.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
      // Remove HTML tags
      content = content.replace(/<[^>]+>/g, ' ');
      // Decode HTML entities
      content = content
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      // Get first ~180 chars
      excerpt = content.trim().substring(0, 180).replace(/\s+/g, ' ');
    }

    // Extract image (first img tag from content)
    let image = null;
    const imgMatch = item.match(/<content:encoded>[\s\S]*?<img[^>]*src="([^"]+)"/);
    if (imgMatch) {
      image = imgMatch[1];
    }

    // Extract up to 4 categories
    const categoryMatches = item.match(/<category[^>]*>([^<]+)<\/category>/g) || [];
    const tags = categoryMatches.slice(0, 4).map(cat => {
      const tagMatch = cat.match(/<category[^>]*>([^<]+)<\/category>/);
      return tagMatch ? tagMatch[1].trim() : '';
    }).filter(Boolean);

    if (title && url && date) {
      posts.push({
        title,
        url,
        date,
        image: image || null,
        tags,
        excerpt: excerpt || ''
      });
    }
  }

  return posts;
}

/**
 * Main: fetch, parse, and write
 */
async function main() {
  try {
    console.log('Fetching Medium RSS feed...');
    const feedXml = await fetchFeed();

    const posts = parseFeed(feedXml);
    console.log(`Parsed ${posts.length} posts`);

    if (posts.length === 0) {
      throw new Error('No posts parsed from feed');
    }

    const output = {
      updated: new Date().toISOString(),
      posts
    };

    fs.writeFileSync(feedPath, JSON.stringify(output, null, 2));
    console.log(`✓ Written ${feedPath}`);
    console.log(`✓ Posts: ${posts.map(p => p.title).join(', ')}`);
    process.exit(0);
  } catch (error) {
    console.error('✗ Fetch failed:', error.message);

    // Resilience: if feed file exists, use it (Medium outage case)
    if (fs.existsSync(feedPath)) {
      console.warn('⚠ Existing feed file found, using cached version');
      process.exit(0);
    }

    // No existing feed and fetch failed: fatal
    console.error('✗ No cached feed available, build cannot continue');
    process.exit(1);
  }
}

main();

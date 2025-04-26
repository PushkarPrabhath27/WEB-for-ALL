/**
 * Text Simplification Module
 * 
 * This module implements advanced text simplification features using NLP
 * to make content more accessible for users with cognitive disabilities.
 */

import { compromise } from 'compromise';
import DOMPurify from 'dompurify';

// Simplification levels and their parameters
const SIMPLIFICATION_LEVELS = {
  light: {
    maxSentenceLength: 25,
    maxParagraphLength: 150,
    readabilityTarget: 70 // Flesch Reading Ease score
  },
  moderate: {
    maxSentenceLength: 20,
    maxParagraphLength: 100,
    readabilityTarget: 80
  },
  strong: {
    maxSentenceLength: 15,
    maxParagraphLength: 75,
    readabilityTarget: 90
  }
};

// Common words to replace with simpler alternatives
const WORD_SIMPLIFICATIONS = {
  'utilize': 'use',
  'implement': 'use',
  'facilitate': 'help',
  'commence': 'start',
  'terminate': 'end',
  'demonstrate': 'show',
  'subsequently': 'then',
  'additionally': 'also',
  'nevertheless': 'however',
  'approximately': 'about'
};

/**
 * Simplifies text content based on user preferences
 * @param {Element} element - DOM element containing text to simplify
 * @param {string} level - Simplification level (light, moderate, strong)
 * @returns {Promise<void>}
 */
export async function simplifyText(element, level = 'moderate') {
  try {
    const params = SIMPLIFICATION_LEVELS[level];
    const originalText = element.textContent;
    
    // Process text with compromise
    let doc = compromise(originalText);
    
    // Apply simplification strategies
    let simplifiedText = await applySimplificationStrategies(doc, params);
    
    // Replace complex words
    simplifiedText = replaceComplexWords(simplifiedText);
    
    // Format and structure the text
    simplifiedText = formatText(simplifiedText, params);
    
    // Sanitize the output
    const sanitizedText = DOMPurify.sanitize(simplifiedText);
    
    // Update the element content
    updateElementContent(element, sanitizedText);
    
  } catch (error) {
    console.error('Error in text simplification:', error);
  }
}

/**
 * Applies various text simplification strategies
 * @param {Object} doc - compromise document
 * @param {Object} params - Simplification parameters
 * @returns {string} Simplified text
 */
async function applySimplificationStrategies(doc, params) {
  // Split long sentences
  doc = splitLongSentences(doc, params.maxSentenceLength);
  
  // Convert passive to active voice
  doc = convertToActiveVoice(doc);
  
  // Simplify verb tenses
  doc = simplifyVerbTenses(doc);
  
  // Resolve pronouns
  doc = resolvePronouns(doc);
  
  return doc.text();
}

/**
 * Splits long sentences into shorter ones
 * @param {Object} doc - compromise document
 * @param {number} maxLength - Maximum words per sentence
 * @returns {Object} Modified document
 */
function splitLongSentences(doc, maxLength) {
  doc.sentences().forEach(sentence => {
    if (sentence.words().length > maxLength) {
      // Find appropriate splitting points
      const clauses = sentence.clauses();
      
      // Split at clause boundaries
      if (clauses.length > 1) {
        sentence.replaceWith(clauses.join('. '));
      }
    }
  });
  
  return doc;
}

/**
 * Converts passive voice to active voice
 * @param {Object} doc - compromise document
 * @returns {Object} Modified document
 */
function convertToActiveVoice(doc) {
  doc.sentences().forEach(sentence => {
    if (sentence.has('#Passive')) {
      const passive = sentence.match('#Passive');
      const subject = sentence.match('#Subject');
      const object = sentence.match('#Object');
      
      if (subject && object) {
        // Reconstruct in active voice
        const activeVoice = `${object.text()} ${passive.verbs().toPresent().text()} ${subject.text()}`;
        sentence.replaceWith(activeVoice);
      }
    }
  });
  
  return doc;
}

/**
 * Simplifies verb tenses to more common forms
 * @param {Object} doc - compromise document
 * @returns {Object} Modified document
 */
function simplifyVerbTenses(doc) {
  // Convert perfect tenses to simple past/present
  doc.match('#PerfectTense').forEach(match => {
    const simplified = match.verbs().toPastTense();
    match.replaceWith(simplified);
  });
  
  return doc;
}

/**
 * Resolves pronouns to their antecedents for clarity
 * @param {Object} doc - compromise document
 * @returns {Object} Modified document
 */
function resolvePronouns(doc) {
  let lastSubject = '';
  
  doc.sentences().forEach(sentence => {
    const pronouns = sentence.pronouns();
    
    pronouns.forEach(pronoun => {
      if (lastSubject && pronoun.has('#Subject')) {
        pronoun.replaceWith(lastSubject);
      }
    });
    
    // Update last subject
    const newSubject = sentence.match('#Subject');
    if (newSubject.found) {
      lastSubject = newSubject.text();
    }
  });
  
  return doc;
}

/**
 * Replaces complex words with simpler alternatives
 * @param {string} text - Text to process
 * @returns {string} Simplified text
 */
function replaceComplexWords(text) {
  let simplified = text;
  
  Object.entries(WORD_SIMPLIFICATIONS).forEach(([complex, simple]) => {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    simplified = simplified.replace(regex, simple);
  });
  
  return simplified;
}

/**
 * Formats text for better readability
 * @param {string} text - Text to format
 * @param {Object} params - Formatting parameters
 * @returns {string} Formatted text
 */
function formatText(text, params) {
  // Split into paragraphs
  let paragraphs = text.split('\n');
  
  // Process each paragraph
  paragraphs = paragraphs.map(paragraph => {
    // Split long paragraphs
    if (paragraph.split(' ').length > params.maxParagraphLength) {
      return splitParagraph(paragraph, params.maxParagraphLength);
    }
    return paragraph;
  });
  
  // Add appropriate spacing
  return paragraphs.join('\n\n');
}

/**
 * Splits a long paragraph into smaller ones
 * @param {string} paragraph - Paragraph to split
 * @param {number} maxLength - Maximum words per paragraph
 * @returns {string} Split paragraphs
 */
function splitParagraph(paragraph, maxLength) {
  const sentences = paragraph.split('. ');
  const newParagraphs = [];
  let currentParagraph = [];
  let wordCount = 0;
  
  sentences.forEach(sentence => {
    const sentenceWords = sentence.split(' ').length;
    
    if (wordCount + sentenceWords > maxLength) {
      // Start new paragraph
      newParagraphs.push(currentParagraph.join('. ') + '.');
      currentParagraph = [sentence];
      wordCount = sentenceWords;
    } else {
      currentParagraph.push(sentence);
      wordCount += sentenceWords;
    }
  });
  
  // Add remaining sentences
  if (currentParagraph.length > 0) {
    newParagraphs.push(currentParagraph.join('. ') + '.');
  }
  
  return newParagraphs.join('\n');
}

/**
 * Updates element content while preserving important markup
 * @param {Element} element - Element to update
 * @param {string} newContent - Simplified content
 */
function updateElementContent(element, newContent) {
  // Preserve original element attributes
  const attributes = element.attributes;
  
  // Create temporary container
  const temp = document.createElement('div');
  temp.innerHTML = newContent;
  
  // Copy attributes to new content
  Array.from(attributes).forEach(attr => {
    temp.setAttribute(attr.name, attr.value);
  });
  
  // Replace original content
  element.innerHTML = temp.innerHTML;
}
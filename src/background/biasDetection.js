/**
 * Bias Detection and Mitigation Module
 * 
 * This module implements mechanisms to detect and mitigate biases in the extension's
 * machine learning components, ensuring fair and inclusive processing across different
 * user groups.
 */

import * as tf from '@tensorflow/tfjs';

// Confidence threshold for bias detection
const CONFIDENCE_THRESHOLD = 0.8;

// Protected attributes that we want to ensure fair treatment for
const PROTECTED_ATTRIBUTES = [
  'gender',
  'age',
  'ethnicity',
  'disability',
  'language'
];

/**
 * Analyzes model predictions for potential biases across protected attributes
 * @param {tf.Tensor} predictions - Model predictions
 * @param {Object} metadata - Metadata about the input including protected attributes
 * @returns {Object} Bias analysis results
 */
export async function detectBias(predictions, metadata) {
  const biasMetrics = {
    disparateImpact: {},
    equalOpportunity: {},
    predictiveParity: {}
  };

  try {
    // Calculate disparate impact across protected attributes
    for (const attribute of PROTECTED_ATTRIBUTES) {
      if (metadata[attribute]) {
        biasMetrics.disparateImpact[attribute] = await calculateDisparateImpact(
          predictions,
          metadata[attribute]
        );
      }
    }

    // Check for systematic errors or patterns
    const systematicBias = await detectSystematicBias(predictions, metadata);
    
    return {
      ...biasMetrics,
      systematicBias,
      timestamp: new Date().toISOString(),
      confidenceScore: calculateConfidenceScore(biasMetrics)
    };
  } catch (error) {
    console.error('Error in bias detection:', error);
    return null;
  }
}

/**
 * Calculates disparate impact ratio for protected attributes
 * @param {tf.Tensor} predictions - Model predictions
 * @param {Array} attributeValues - Values of the protected attribute
 * @returns {number} Disparate impact ratio
 */
async function calculateDisparateImpact(predictions, attributeValues) {
  const predArray = await predictions.array();
  const favorableOutcomes = {};
  const groupCounts = {};

  // Count favorable outcomes for each group
  attributeValues.forEach((value, index) => {
    if (!favorableOutcomes[value]) {
      favorableOutcomes[value] = 0;
      groupCounts[value] = 0;
    }
    if (predArray[index] > CONFIDENCE_THRESHOLD) {
      favorableOutcomes[value]++;
    }
    groupCounts[value]++;
  });

  // Calculate ratios
  const ratios = Object.keys(favorableOutcomes).map(group => {
    return favorableOutcomes[group] / groupCounts[group];
  });

  // Return minimum ratio divided by maximum ratio
  return Math.min(...ratios) / Math.max(...ratios);
}

/**
 * Detects systematic biases in model predictions
 * @param {tf.Tensor} predictions - Model predictions
 * @param {Object} metadata - Metadata about the input
 * @returns {Object} Systematic bias analysis
 */
async function detectSystematicBias(predictions, metadata) {
  const systematicBias = {
    patterns: [],
    severity: 'low'
  };

  try {
    // Analyze prediction distribution
    const distribution = await analyzePredictionDistribution(predictions);
    
    // Check for skewed predictions
    if (distribution.skewness > 0.5) {
      systematicBias.patterns.push({
        type: 'skewed_predictions',
        details: 'Predictions show significant skew towards certain outcomes'
      });
      systematicBias.severity = 'medium';
    }

    // Check for underrepresentation
    const representationIssues = checkRepresentation(metadata);
    if (representationIssues.length > 0) {
      systematicBias.patterns.push({
        type: 'underrepresentation',
        details: 'Some groups are underrepresented in the analysis',
        affected: representationIssues
      });
      systematicBias.severity = 'high';
    }

    return systematicBias;
  } catch (error) {
    console.error('Error in systematic bias detection:', error);
    return systematicBias;
  }
}

/**
 * Analyzes the distribution of model predictions
 * @param {tf.Tensor} predictions - Model predictions
 * @returns {Object} Distribution analysis
 */
async function analyzePredictionDistribution(predictions) {
  const predArray = await predictions.array();
  
  // Calculate basic statistics
  const mean = tf.mean(predictions);
  const std = tf.moments(predictions).variance.sqrt();
  
  // Calculate skewness
  const skewness = calculateSkewness(predArray, mean, std);

  return {
    mean: await mean.array(),
    standardDeviation: await std.array(),
    skewness
  };
}

/**
 * Checks for representation issues in the metadata
 * @param {Object} metadata - Metadata about the input
 * @returns {Array} List of underrepresented groups
 */
function checkRepresentation(metadata) {
  const underrepresented = [];
  
  for (const attribute of PROTECTED_ATTRIBUTES) {
    if (metadata[attribute]) {
      const distribution = calculateDistribution(metadata[attribute]);
      const minRepresentation = Math.min(...Object.values(distribution));
      
      if (minRepresentation < 0.1) { // Less than 10% representation
        underrepresented.push({
          attribute,
          representation: minRepresentation
        });
      }
    }
  }
  
  return underrepresented;
}

/**
 * Calculates the distribution of values in an array
 * @param {Array} values - Array of values
 * @returns {Object} Distribution of values
 */
function calculateDistribution(values) {
  const distribution = {};
  const total = values.length;

  values.forEach(value => {
    distribution[value] = (distribution[value] || 0) + 1;
  });

  // Convert to percentages
  Object.keys(distribution).forEach(key => {
    distribution[key] = distribution[key] / total;
  });

  return distribution;
}

/**
 * Calculates skewness of a distribution
 * @param {Array} values - Array of values
 * @param {number} mean - Mean of the distribution
 * @param {number} std - Standard deviation of the distribution
 * @returns {number} Skewness value
 */
function calculateSkewness(values, mean, std) {
  const n = values.length;
  const m3 = values.reduce((acc, val) => {
    return acc + Math.pow(val - mean, 3);
  }, 0) / n;
  
  return m3 / Math.pow(std, 3);
}

/**
 * Calculates overall confidence score for bias metrics
 * @param {Object} biasMetrics - Collection of bias metrics
 * @returns {number} Confidence score between 0 and 1
 */
function calculateConfidenceScore(biasMetrics) {
  const scores = [];
  
  // Evaluate disparate impact scores
  Object.values(biasMetrics.disparateImpact).forEach(score => {
    scores.push(score);
  });

  // Weight and combine scores
  const avgScore = scores.reduce((acc, score) => acc + score, 0) / scores.length;
  
  return Math.max(0, Math.min(1, avgScore));
}
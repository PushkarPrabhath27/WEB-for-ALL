/**
 * Enhanced Bias Detection System
 */

import { modelManager } from './mlModelManager';
import { privacyHandler } from './privacyHandler';
import { intersectionalAnalysis } from './intersectionalAnalysis';

class BiasDetectionSystem {
  constructor() {
    this.biasCategories = [
      'gender',
      'race',
      'age',
      'disability',
      'socioeconomic',
      'cultural',
      'language',
      'religion',
      'nationality'
    ];
    
    this.modelId = 'bias-detection-v2';
    this.modelConfig = {
      version: '2.0.0',
      parameters: {
        threshold: 0.75,
        sensitivityLevel: 'high',
        adaptiveThreshold: true,
        contextAware: true,
        multilingualSupport: true
      },
      performance: {
        maxProcessingTime: 100, // ms
        batchSize: 1000,
        cacheSize: 50 // number of results to cache
      }
    };
    this.initialize();
  }

  /**
   * Initialize bias detection model
   */
  async initialize() {
    this.modelConfig.parameters.categories = this.biasCategories;
    
    try {
      await modelManager.initializeModel(this.modelId, this.modelConfig);
      await this.validateModel();
      await this.setupPerformanceMonitoring();
    } catch (error) {
      console.error('Model initialization failed:', error);
      // Fall back to previous version if available
      await this.handleModelFailover();
    }
  }

  /**
   * Analyze content for potential bias
   * @param {Object} content - Content to analyze
   * @returns {Object} - Bias analysis results
   */
  async analyzeContent(content) {
    try {
      // Process data through privacy handler with enhanced security
      const { data: processedContent, metadata } = await privacyHandler.processData(content, {
        anonymize: true,
        removeIdentifiers: true,
        preserveContext: true
      });

      // Apply context-aware analysis
      const context = await this.extractContext(processedContent);
      const results = await this.detectBias(processedContent, context);
      
      // Generate personalized mitigation strategies
      const mitigationSuggestions = await this.generateMitigationStrategies(results, {
        context,
        metadata,
        userPreferences: await this.getUserPreferences()
      });

      // Track model performance and update adaptive thresholds
      await this.trackAnalysisMetrics(results, context);
      await this.updateAdaptiveThresholds(results);

      // Perform intersectional analysis
      const intersectionalResults = await intersectionalAnalysis.analyzeIntersections(results);

      return {
        success: true,
        biasDetected: results,
        intersectionalAnalysis: intersectionalResults,
        suggestions: {
          individual: mitigationSuggestions,
          intersectional: intersectionalResults.recommendations
        },
        confidence: this.calculateConfidence(results),
        performance: await this.getPerformanceMetrics()
      };
    } catch (error) {
      console.error('Bias analysis error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect bias in processed content
   * @param {Object} processedContent - Privacy-processed content
   * @returns {Object} - Detected bias patterns
   */
  async detectBias(processedContent) {
    const detectedBias = {};

    for (const category of this.biasCategories) {
      const categoryScore = await this.analyzeCategoryBias(processedContent, category);
      if (categoryScore.score > 0) {
        detectedBias[category] = categoryScore;
      }
    }

    return detectedBias;
  }

  /**
   * Analyze bias for specific category
   * @param {Object} content - Content to analyze
   * @param {string} category - Bias category
   * @returns {Object} - Category-specific bias score
   */
  async analyzeCategoryBias(content, category) {
    const patterns = this.getBiasPatterns(category);
    let score = 0;
    let instances = [];

    for (const pattern of patterns) {
      const matches = this.findPatternMatches(content, pattern);
      if (matches.length > 0) {
        score += matches.length * pattern.weight;
        instances.push(...matches);
      }
    }

    return {
      score: score,
      instances: instances,
      severity: this.calculateSeverity(score)
    };
  }

  /**
   * Get bias detection patterns for category
   * @param {string} category - Bias category
   * @returns {Array} - Category-specific patterns
   */
  getBiasPatterns(category) {
    // Category-specific bias patterns
    const patterns = {
      gender: [
        { pattern: /\b(he|she) is assumed\b/i, weight: 0.8 },
        { pattern: /\b(male|female) only\b/i, weight: 0.9 }
      ],
      disability: [
        { pattern: /\b(normal|abnormal) person\b/i, weight: 0.9 },
        { pattern: /\b(suffering|victim) of\b/i, weight: 0.7 }
      ],
      // Add patterns for other categories
    };

    return patterns[category] || [];
  }

  /**
   * Find pattern matches in content
   * @param {Object} content - Content to analyze
   * @param {Object} pattern - Bias pattern
   * @returns {Array} - Matched instances
   */
  findPatternMatches(content, pattern) {
    const matches = [];
    const text = content.text || '';
    let match;

    while ((match = pattern.pattern.exec(text)) !== null) {
      matches.push({
        text: match[0],
        index: match.index,
        context: this.getMatchContext(text, match.index)
      });
    }

    return matches;
  }

  /**
   * Get context around matched text
   * @param {string} text - Full text content
   * @param {number} index - Match index
   * @returns {string} - Context snippet
   */
  getMatchContext(text, index) {
    const contextSize = 50;
    const start = Math.max(0, index - contextSize);
    const end = Math.min(text.length, index + contextSize);
    return text.slice(start, end);
  }

  /**
   * Calculate bias severity level
   * @param {number} score - Bias score
   * @returns {string} - Severity level
   */
  calculateSeverity(score) {
    if (score >= 0.9) return 'critical';
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Generate bias mitigation strategies
   * @param {Object} biasResults - Detected bias results
   * @returns {Object} - Mitigation suggestions
   */
  generateMitigationStrategies(biasResults) {
    const suggestions = {};

    for (const [category, result] of Object.entries(biasResults)) {
      suggestions[category] = {
        recommendations: this.getCategoryRecommendations(category, result),
        alternatives: this.getLanguageAlternatives(category, result.instances)
      };
    }

    return suggestions;
  }

  /**
   * Get category-specific recommendations
   * @param {string} category - Bias category
   * @param {Object} result - Category results
   * @returns {Array} - Recommendations
   */
  getCategoryRecommendations(category, result) {
    const recommendations = {
      gender: [
        'Use gender-neutral language',
        'Avoid gender stereotypes',
        'Include diverse perspectives'
      ],
      disability: [
        'Use person-first language',
        'Focus on capabilities',
        'Avoid ableist language'
      ]
      // Add recommendations for other categories
    };

    return recommendations[category] || [];
  }

  /**
   * Get alternative language suggestions
   * @param {string} category - Bias category
   * @param {Array} instances - Biased instances
   * @returns {Object} - Alternative suggestions
   */
  getLanguageAlternatives(category, instances) {
    const alternatives = {};

    for (const instance of instances) {
      alternatives[instance.text] = this.findAlternatives(category, instance.text);
    }

    return alternatives;
  }

  /**
   * Find alternative language options
   * @param {string} category - Bias category
   * @param {string} text - Biased text
   * @returns {Array} - Alternative suggestions
   */
  findAlternatives(category, text) {
    // Category-specific alternative suggestions
    const alternativesMap = {
      gender: {
        'he is assumed': ['they are assumed', 'the person is assumed'],
        'she is assumed': ['they are assumed', 'the person is assumed']
      },
      disability: {
        'normal person': ['person', 'individual'],
        'suffering from': ['living with', 'experiencing']
      }
      // Add alternatives for other categories
    };

    return alternativesMap[category]?.[text.toLowerCase()] || [];
  }

  /**
   * Track analysis metrics for model improvement
   * @param {Object} results - Analysis results
   */
  async trackAnalysisMetrics(results) {
    const metrics = {
      timestamp: new Date().toISOString(),
      categoriesAnalyzed: Object.keys(results).length,
      biasInstances: this.countTotalInstances(results),
      severityDistribution: this.calculateSeverityDistribution(results)
    };

    await modelManager.trackPerformance(this.modelId, metrics);
  }

  /**
   * Count total bias instances
   * @param {Object} results - Analysis results
   * @returns {number} - Total instances
   */
  countTotalInstances(results) {
    return Object.values(results).reduce((total, result) => {
      return total + result.instances.length;
    }, 0);
  }

  /**
   * Calculate severity distribution
   * @param {Object} results - Analysis results
   * @returns {Object} - Severity distribution
   */
  calculateSeverityDistribution(results) {
    const distribution = { high: 0, medium: 0, low: 0 };

    Object.values(results).forEach(result => {
      distribution[result.severity]++;
    });

    return distribution;
  }
}

export const biasDetectionSystem = new BiasDetectionSystem();
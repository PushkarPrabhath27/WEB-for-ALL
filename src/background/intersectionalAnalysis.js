/**
 * Intersectional Analysis System
 * Analyzes overlapping biases across multiple categories
 */

class IntersectionalAnalysis {
  constructor() {
    this.intersectionCategories = [
      ['gender', 'race'],
      ['gender', 'age'],
      ['race', 'disability'],
      ['gender', 'socioeconomic'],
      ['disability', 'age'],
      ['race', 'religion'],
      ['nationality', 'religion'],
      ['language', 'cultural']
    ];

    this.intersectionWeights = {
      'gender_race': 1.2,
      'gender_age': 1.1,
      'race_disability': 1.15,
      'gender_socioeconomic': 1.1,
      'disability_age': 1.15,
      'race_religion': 1.1,
      'nationality_religion': 1.1,
      'language_cultural': 1.05
    };
  }

  /**
   * Analyze intersectional bias patterns
   * @param {Object} biasResults - Results from individual bias analysis
   * @returns {Object} - Intersectional analysis results
   */
  analyzeIntersections(biasResults) {
    const intersectionalPatterns = {};

    for (const [category1, category2] of this.intersectionCategories) {
      if (biasResults[category1] && biasResults[category2]) {
        const intersectionKey = `${category1}_${category2}`;
        const intersectionScore = this.calculateIntersectionScore(
          biasResults[category1],
          biasResults[category2],
          this.intersectionWeights[intersectionKey]
        );

        if (intersectionScore.score > 0) {
          intersectionalPatterns[intersectionKey] = intersectionScore;
        }
      }
    }

    return {
      patterns: intersectionalPatterns,
      summary: this.generateIntersectionalSummary(intersectionalPatterns),
      recommendations: this.generateIntersectionalRecommendations(intersectionalPatterns)
    };
  }

  /**
   * Calculate intersection score between two bias categories
   * @param {Object} result1 - First category results
   * @param {Object} result2 - Second category results
   * @param {number} weight - Intersection weight
   * @returns {Object} - Intersection score and details
   */
  calculateIntersectionScore(result1, result2, weight) {
    const overlappingInstances = this.findOverlappingInstances(
      result1.instances,
      result2.instances
    );

    const baseScore = (result1.score + result2.score) / 2;
    const weightedScore = baseScore * weight;

    return {
      score: weightedScore,
      overlappingInstances,
      severity: this.calculateIntersectionSeverity(weightedScore),
      categories: {
        category1: { score: result1.score, severity: result1.severity },
        category2: { score: result2.score, severity: result2.severity }
      }
    };
  }

  /**
   * Find overlapping bias instances between categories
   * @param {Array} instances1 - First category instances
   * @param {Array} instances2 - Second category instances
   * @returns {Array} - Overlapping instances
   */
  findOverlappingInstances(instances1, instances2) {
    const overlapping = [];

    for (const instance1 of instances1) {
      for (const instance2 of instances2) {
        if (this.areInstancesOverlapping(instance1, instance2)) {
          overlapping.push({
            text: instance1.text,
            context: instance1.context,
            index: instance1.index
          });
        }
      }
    }

    return overlapping;
  }

  /**
   * Check if two bias instances overlap in context
   * @param {Object} instance1 - First instance
   * @param {Object} instance2 - Second instance
   * @returns {boolean} - Whether instances overlap
   */
  areInstancesOverlapping(instance1, instance2) {
    const contextOverlap = 100; // characters
    const start1 = instance1.index;
    const end1 = instance1.index + instance1.text.length;
    const start2 = instance2.index;
    const end2 = instance2.index + instance2.text.length;

    return Math.abs(start1 - start2) < contextOverlap ||
           Math.abs(end1 - end2) < contextOverlap;
  }

  /**
   * Calculate intersection severity
   * @param {number} score - Intersection score
   * @returns {string} - Severity level
   */
  calculateIntersectionSeverity(score) {
    if (score >= 1.0) return 'critical';
    if (score >= 0.8) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Generate summary of intersectional analysis
   * @param {Object} patterns - Intersectional patterns
   * @returns {Object} - Analysis summary
   */
  generateIntersectionalSummary(patterns) {
    const criticalPatterns = Object.entries(patterns)
      .filter(([, pattern]) => pattern.severity === 'critical')
      .map(([key]) => key);

    const highPatterns = Object.entries(patterns)
      .filter(([, pattern]) => pattern.severity === 'high')
      .map(([key]) => key);

    return {
      totalPatterns: Object.keys(patterns).length,
      criticalIntersections: criticalPatterns,
      highPriorityIntersections: highPatterns,
      severityDistribution: this.calculateSeverityDistribution(patterns)
    };
  }

  /**
   * Calculate severity distribution
   * @param {Object} patterns - Intersectional patterns
   * @returns {Object} - Severity distribution
   */
  calculateSeverityDistribution(patterns) {
    const distribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    Object.values(patterns).forEach(pattern => {
      distribution[pattern.severity]++;
    });

    return distribution;
  }

  /**
   * Generate recommendations for intersectional bias
   * @param {Object} patterns - Intersectional patterns
   * @returns {Array} - Recommendations
   */
  generateIntersectionalRecommendations(patterns) {
    const recommendations = [];

    for (const [intersection, pattern] of Object.entries(patterns)) {
      if (pattern.severity === 'critical' || pattern.severity === 'high') {
        const [category1, category2] = intersection.split('_');
        recommendations.push({
          intersection,
          severity: pattern.severity,
          suggestions: this.getIntersectionRecommendations(category1, category2)
        });
      }
    }

    return recommendations;
  }

  /**
   * Get specific recommendations for intersection
   * @param {string} category1 - First category
   * @param {string} category2 - Second category
   * @returns {Array} - Specific recommendations
   */
  getIntersectionRecommendations(category1, category2) {
    const recommendationsMap = {
      'gender_race': [
        'Consider diverse representation across both gender and racial dimensions',
        'Examine power dynamics and privilege in intersectional contexts',
        'Include perspectives from individuals with varied gender and racial identities'
      ],
      'race_disability': [
        'Address compounded barriers faced by individuals with disabilities from different racial backgrounds',
        'Consider cultural differences in disability perspectives',
        'Ensure accessibility solutions are culturally appropriate'
      ],
      'gender_age': [
        'Consider how gender biases may differ across age groups',
        'Address stereotypes that combine age and gender assumptions',
        'Include diverse age representations within gender discussions'
      ]
      // Add more intersection-specific recommendations
    };

    const key = `${category1}_${category2}`;
    return recommendationsMap[key] || [
      'Review content for combined impact of multiple bias categories',
      'Consider how different aspects of identity interact',
      'Seek feedback from individuals with intersecting identities'
    ];
  }
}

export const intersectionalAnalysis = new IntersectionalAnalysis();
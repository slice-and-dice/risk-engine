const store = require('../store');

const calculateRisk = async (answerIds) => {
  const riskRules = await store.getRiskRules();

  if(
    answerIds instanceof Array &&
    answerIds.every((answerId) => {
      return typeof answerId === 'string';
    })
  ){
    let businessTypeAnswerIds = answerIds.filter((answerId) => {
      return answerId.slice(0, 5) === 'TYPE-';
    });

    let qualifierAnswerIds = answerIds.filter((answerId) => {
      return answerId.slice(0, 5) !== 'TYPE-';
    });

    let scores = {
      riskScores: {},
      inspectionRecommendation: null,
      granularScores: {}
    };

    // BEGIN GRANULAR SCORING
    let rawGranularScores = [];
    qualifierAnswerIds.forEach((answerId) => {
      let thisGranularRule = riskRules.qualifierScores[answerId] || null;
      if(thisGranularRule) {
        rawGranularScores.push(...thisGranularRule.granularScores);
      }
    });


    rawGranularScores.forEach((granularScore) => {
      let existingCategory = scores.granularScores[granularScore.for];
      if(existingCategory && existingCategory[granularScore.grade]) {
        existingCategory[granularScore.grade]++;
      }
      else if(existingCategory) {
        existingCategory[granularScore.grade] = 1;
      }
      else {
        scores.granularScores[granularScore.for] = {[granularScore.grade]: 1};
      }
    });

    Object.keys(scores.granularScores).forEach((granularScoreCategory) => {
      let thisCategory = scores.granularScores[granularScoreCategory];
      let totalCategoryScore = 0;
      Object.keys(thisCategory).forEach((grade) => {
        totalCategoryScore += (Number(grade) * thisCategory[grade]);
      });

      thisCategory.total = totalCategoryScore;

    });

    // BEGIN OFFICIAL RISK SCORING
    let level = 0;
    businessTypeAnswerIds.forEach((answerId) => {
      let thisRule = riskRules.baseScores[answerId] || null;
      if(thisRule && thisRule.level >= level) {
        level = thisRule.level;
        scores.riskScores = thisRule.baseScores;
      }
    });

    let positiveQualifiers = [];
    let negativeQualifiers = [];
    qualifierAnswerIds.forEach((answerId) => {
      let thisRule = riskRules.qualifierScores[answerId] || null;
      if(thisRule) {
        positiveQualifiers.push(...(thisRule.qualifiers.filter((qualifier) => {
          return qualifier.type === 'positive';
        })));
        negativeQualifiers.push(...(thisRule.qualifiers.filter((qualifier) => {
          return qualifier.type === 'negative';
        })));
      }
    });

    positiveQualifiers.forEach((qualifier) => {
      if(qualifier.value > scores.riskScores[qualifier.for]) {
        scores.riskScores[qualifier.for] = qualifier.value;
      }
    });

    negativeQualifiers.forEach((qualifier) => {
      if(qualifier.value < scores.riskScores[qualifier.for]) {
        scores.riskScores[qualifier.for] = qualifier.value;
      }
    });

    let totalOfficialScore = Object.values(scores.riskScores).reduce((a, b) => a + b);
    let thresholdKey = Object.keys(riskRules.thresholds).sort().reverse().find((threshold) => {
      return Number(threshold) < totalOfficialScore;
    });

    scores.inspectionRecommendation = riskRules.thresholds[thresholdKey];

    return scores;
  }
  else {
    return Error;
  }
}

module.exports = {
  calculateRisk
};
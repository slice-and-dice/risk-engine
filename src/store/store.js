const store = {
  businessTypes: {
    "Farm-Fruit and vegetable grower": {
      answerIds: ["TYPE-A0"],
      baseScores: {
        A: 30,
        B: 0,
        C: 5,
        D: 0
      }
    },
    Beekeeper: {
      answerIds: ["TYPE-A0", "TYPE-A3"],
      baseScores: {
        A: 30,
        B: 0,
        C: 20,
        D: 0
      }
    },
    "Honey maker": {
      answerIds: [
        "TYPE-A1",
        "TYPE-A3",
        "TYPE-A4",
        "TYPE-A9",
        "TYPE-A10",
        "TYPE-A11"
      ],
      baseScores: {
        A: 30,
        B: 10,
        C: 20,
        D: 0
      }
    }
  },
  riskRules: {
    thresholds: {
      "0": "Incident-based inspection",
      "31": "Desktop inspection",
      "52": "Full inspection"
    },
    qualifierScores: {
      "001": {
        qualifiers: [
          {
            for: "B",
            type: "positive",
            value: 30
          }
        ],
        granularScores: [
          {
            for: "A",
            grade: 4
          },
          {
            for: "B",
            grade: 2
          }
        ]
      },
      "002": {
        qualifiers: [
          {
            for: "A",
            type: "negative",
            value: 10
          },
          {
            for: "D",
            type: "positive",
            value: 40
          }
        ],
        granularScores: [
          {
            for: "C",
            grade: 3
          },
          {
            for: "D",
            grade: 1
          }
        ]
      }
    }
  }
};

const randomlyFail = () => Math.random() > 1;

const getRiskRules = () => {
  return new Promise((resolve, reject) => {
    if (randomlyFail()) {
      reject(new Error("Risk rules could not be found"));
    } else {
      resolve(store.riskRules);
    }
  });
};

const getBusinessTypes = () => {
  return new Promise((resolve, reject) => {
    if (randomlyFail()) {
      reject(new Error("Business types could not be found"));
    } else {
      resolve(store.businessTypes);
    }
  });
};

module.exports = {
  getRiskRules,
  getBusinessTypes
};

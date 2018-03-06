const mockStore = {
  getRiskRules: (() => mockStore.riskRules),
  riskRules: {
    "thresholds": {
      "0": "Incident-based inspection",
      "31": "Desktop inspection",
      "52": "Full inspection"
    },
    "baseScores": {
      "TYPE-789": {
        "answerText": "Restaurant and caterer",
        "level": 1,
        "baseScores": {
          "A": 30,
          "B": 0,
          "C": 5,
          "D": 0
        }
      },
      "TYPE-941": {
        "answerText": "Child care",
        "level": 2,
        "baseScores": {
          "A": 30,
          "B": 0,
          "C": 5,
          "D": 22
        }
      },
      "TYPE-567": {
        "answerText": "Care home",
        "level": 2,
        "baseScores": {
          "A": 30,
          "B": 0,
          "C": 5,
          "D": 22
        }
      },
      "TYPE-201": {
        "answerText": "Child minder",
        "level": 3,
        "baseScores": {
          "A": 10,
          "B": 0,
          "C": 0,
          "D": 0
        }
      }
    },
    
    "qualifierScores": {
      "001": {
        "qualifiers": [
          {
            "for": "B",
            "type": "positive",
            "value": 32
          },
        ],
        "granularScores": [
          {
            "for": "A",
            "grade": 4
          },
          {
            "for": "B",
            "grade": 2
          },
          {
            "for": "B",
            "grade": 4
          },
        ]
      },
      "002": {
        "qualifiers": [
          {
            "for": "A",
            "type": "negative",
            "value": 12
          },
          {
            "for": "D",
            "type": "positive",
            "value": 42
          }
        ],
        "granularScores": [
          {
            "for": "C",
            "grade": 3
          },
          {
            "for": "D",
            "grade": 1
          }
        ]
      }
    }
  }
}

jest.mock('../store', () => mockStore);
const hygienePotentialHazardService = require('./hygiene-potential-hazard.service');

describe('function: calculateRisk', () => {
  describe('when given no params', () => {
    let result = hygienePotentialHazardService.calculateRisk();

    it('should return Error', () => {
      expect(result).resolves.toBe(Error);
    });
  });

  describe('when given params of the wrong type', () => {
    const incorrectParamsArray = [
      true,
      'string',
      100,
      {testObj: 'test'},
      [false, [1,2,3], {}],
      ['123', '123', 123]
    ];

    it('should return Error', () => {
      incorrectParamsArray.forEach((param) => {
        expect(hygienePotentialHazardService.calculateRisk(param)).resolves.toBe(Error);
      });
    });
  });

  describe('when given valid params', () => {
    let result = hygienePotentialHazardService.calculateRisk(['001', '998', 'TYPE-941', 'TYPE-789', 'TYPE-222']);

    it('should not return Error', () => {
      expect(result).resolves.not.toBe(Error);
    });

    it('should return an object containing two objects: riskScores and granularScores', async () => {
      result = await result;
      expect(typeof result).toBe('object');
      expect(result.riskScores).toBeTruthy();
      expect(result.granularScores).toBeTruthy();
    });

    it('riskScores object should contain at least one key, with number values for each key', async () => {
      result = await result;
      expect(typeof Object.values(result.riskScores)[0]).toBe('number');
      
      let returnsObjectWithNumberValues = Object.values(result.riskScores).every((value) => {
        return typeof value === 'number';
      });
      expect(returnsObjectWithNumberValues).toBe(true);
    });

    it('riskScores object should have the correct score, based on the highest "level" base score and subsequent qualifier scores', async () => {
      result = await result;
      expect(result.riskScores).toEqual({
        A: 30,
        B: 32,
        C: 5,
        D: 22
      });
    });

    it('granularScores object should have the correct counted, graded, and total risks', async () => {
      result = await result;
      expect(result.granularScores).toEqual({
        A: {
          4: 1,
          total: 4
        },
        B: {
          2: 1,
          4: 1,
          total: 6
        }
      });
    });

    it('inspectionRecommendation should return a string that matches one of the threshold options', async () => {
      result = await result;
      expect(result.inspectionRecommendation).toBeTruthy();
      expect(typeof result.inspectionRecommendation).toBe('string');
      expect(Object.values(mockStore.getRiskRules().thresholds)).toContain(result.inspectionRecommendation);
    });
  });

  describe('when given different valid params in a series of requests', () => {

    it('should return a different response for each', async () => {
      let previousResult = null;
      let validParamsArray = [
        ['TYPE-789'],
        ['TYPE-789', '001', '002'],
        ['TYPE-201', '002'],
        ['TYPE-201'],
        ['TYPE-789', '002', '001'],
        ['TYPE-789', '001'],
        ['TYPE-789'],
        ['TYPE-201', '002'],
        ['TYPE-201'],
        ['TYPE-201', '001'],
      ];

      let testsFailed = false;

      for (let param of validParamsArray) {
        let result = await hygienePotentialHazardService.calculateRisk(param);
        if(previousResult) {
          JSON.stringify(result.riskScores) === JSON.stringify(previousResult.riskScores) ? testsFailed = true : null;
          JSON.stringify(result.granularScores) === JSON.stringify(previousResult.granularScores) ? testsFailed = true: null;
        }
        previousResult = result;
      }
      
      expect(testsFailed).toEqual(false);
    });

  });

});
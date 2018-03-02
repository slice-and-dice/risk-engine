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
      }
    },
    "qualifierScores": {
      "001": {
        "qualifiers": [
          {
            "for": "B",
            "type": "negative",
            "value": 20
          },
          {
            "for": "B",
            "type": "positive",
            "value": 30
          },
          {
            "for": "C",
            "type": "positive",
            "value": 10
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
        B: 20,
        C: 10,
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
});
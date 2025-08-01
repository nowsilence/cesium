import defaultValue from "./defaultValue.js";
import defined from "./defined.js";
import DeveloperError from "./DeveloperError.js";
import CesiumMath from "./Math.js";

const factorial = CesiumMath.factorial;

function calculateCoefficientTerm(
  x,
  zIndices,
  xTable,
  derivOrder,
  termOrder,
  reservedIndices
) {
  let result = 0;
  let reserved;
  let i;
  let j;

  if (derivOrder > 0) {
    for (i = 0; i < termOrder; i++) {
      reserved = false;
      for (j = 0; j < reservedIndices.length && !reserved; j++) {
        if (i === reservedIndices[j]) {
          reserved = true;
        }
      }

      if (!reserved) {
        reservedIndices.push(i);
        result += calculateCoefficientTerm(
          x,
          zIndices,
          xTable,
          derivOrder - 1,
          termOrder,
          reservedIndices
        );
        reservedIndices.splice(reservedIndices.length - 1, 1);
      }
    }

    return result;
  }

  result = 1;
  for (i = 0; i < termOrder; i++) {
    reserved = false;
    for (j = 0; j < reservedIndices.length && !reserved; j++) {
      if (i === reservedIndices[j]) {
        reserved = true;
      }
    }

    if (!reserved) {
      result *= x - xTable[zIndices[i]];
    }
  }

  return result;
}

/**
 * An {@link InterpolationAlgorithm} for performing Hermite interpolation.
 * Hermite 多项式插值
 * @namespace HermitePolynomialApproximation
 */
const HermitePolynomialApproximation = {
  type: "Hermite",
};

/**
 * Given the desired degree, returns the number of data points required for interpolation.
 *
 * @param {number} degree The desired degree of interpolation.
 * @param {number} [inputOrder=0]  The order of the inputs (0 means just the data, 1 means the data and its derivative, etc).
 * @returns {number} The number of required data points needed for the desired degree of interpolation.
 * @exception {DeveloperError} degree must be 0 or greater.
 * @exception {DeveloperError} inputOrder must be 0 or greater.
 */
HermitePolynomialApproximation.getRequiredDataPoints = function (
  degree,
  inputOrder
) {
  inputOrder = defaultValue(inputOrder, 0);

  //>>includeStart('debug', pragmas.debug);
  if (!defined(degree)) {
    throw new DeveloperError("degree is required.");
  }
  if (degree < 0) {
    throw new DeveloperError("degree must be 0 or greater.");
  }
  if (inputOrder < 0) {
    throw new DeveloperError("inputOrder must be 0 or greater.");
  }
  //>>includeEnd('debug');

  return Math.max(Math.floor((degree + 1) / (inputOrder + 1)), 2);
};

/**
 * Interpolates values using Hermite Polynomial Approximation.
 *
 * @param {number} x The independent variable for which the dependent variables will be interpolated.
 * @param {number[]} xTable The array of independent variables to use to interpolate.  The values
 * in this array must be in increasing order and the same value must not occur twice in the array.
 * @param {number[]} yTable The array of dependent variables to use to interpolate.  For a set of three
 * dependent values (p,q,w) at time 1 and time 2 this should be as follows: {p1, q1, w1, p2, q2, w2}.
 * @param {number} yStride The number of dependent variable values in yTable corresponding to
 * each independent variable value in xTable.
 * @param {number[]} [result] An existing array into which to store the result.
 * @returns {number[]} The array of interpolated values, or the result parameter if one was provided.
 */
HermitePolynomialApproximation.interpolateOrderZero = function (
  x,
  xTable,
  yTable,
  yStride,
  result
) {
  if (!defined(result)) {
    result = new Array(yStride);
  }

  let i;
  let j;
  let d;
  let s;
  let len;
  let index;
  const length = xTable.length;
  const coefficients = new Array(yStride);

  for (i = 0; i < yStride; i++) {
    result[i] = 0;

    const l = new Array(length);
    coefficients[i] = l;
    for (j = 0; j < length; j++) {
      l[j] = [];
    }
  }

  const zIndicesLength = length,
    zIndices = new Array(zIndicesLength);

  for (i = 0; i < zIndicesLength; i++) {
    zIndices[i] = i;
  }

  let highestNonZeroCoef = length - 1;
  for (s = 0; s < yStride; s++) {
    for (j = 0; j < zIndicesLength; j++) {
      index = zIndices[j] * yStride + s;
      coefficients[s][0].push(yTable[index]);
    }

    for (i = 1; i < zIndicesLength; i++) {
      let nonZeroCoefficients = false;
      for (j = 0; j < zIndicesLength - i; j++) {
        const zj = xTable[zIndices[j]];
        const zn = xTable[zIndices[j + i]];

        let numerator;
        if (zn - zj <= 0) {
          index = zIndices[j] * yStride + yStride * i + s;
          numerator = yTable[index];
          coefficients[s][i].push(numerator / factorial(i));
        } else {
          numerator = coefficients[s][i - 1][j + 1] - coefficients[s][i - 1][j];
          coefficients[s][i].push(numerator / (zn - zj));
        }
        nonZeroCoefficients = nonZeroCoefficients || numerator !== 0;
      }

      if (!nonZeroCoefficients) {
        highestNonZeroCoef = i - 1;
      }
    }
  }

  for (d = 0, len = 0; d <= len; d++) {
    for (i = d; i <= highestNonZeroCoef; i++) {
      const tempTerm = calculateCoefficientTerm(x, zIndices, xTable, d, i, []);
      for (s = 0; s < yStride; s++) {
        const coeff = coefficients[s][i][0];
        result[s + d * yStride] += coeff * tempTerm;
      }
    }
  }

  return result;
};

const arrayScratch = [];

/**
 * Interpolates values using Hermite Polynomial Approximation.
 *
 * @param {number} x The independent variable for which the dependent variables will be interpolated.
 * @param {number[]} xTable The array of independent variables to use to interpolate.  The values
 * in this array must be in increasing order and the same value must not occur twice in the array.
 * @param {number[]} yTable The array of dependent variables to use to interpolate.  For a set of three
 * dependent values (p,q,w) at time 1 and time 2 this should be as follows: {p1, q1, w1, p2, q2, w2}.
 * @param {number} yStride The number of dependent variable values in yTable corresponding to
 * each independent variable value in xTable.
 * @param {number} inputOrder The number of derivatives supplied for input.
 * @param {number} outputOrder The number of derivatives desired for output.
 * @param {number[]} [result] An existing array into which to store the result.
 *
 * @returns {number[]} The array of interpolated values, or the result parameter if one was provided.
 */
HermitePolynomialApproximation.interpolate = function (
  x,
  xTable,
  yTable,
  yStride,
  inputOrder,
  outputOrder,
  result
) {
  const resultLength = yStride * (outputOrder + 1);
  if (!defined(result)) {
    result = new Array(resultLength);
  }
  for (let r = 0; r < resultLength; r++) {
    result[r] = 0;
  }

  const length = xTable.length;
  // The zIndices array holds copies of the addresses of the xTable values
  // in the range we're looking at. Even though this just holds information already
  // available in xTable this is a much more convenient format.
  const zIndices = new Array(length * (inputOrder + 1));
  let i;
  for (i = 0; i < length; i++) {
    for (let j = 0; j < inputOrder + 1; j++) {
      zIndices[i * (inputOrder + 1) + j] = i;
    }
  }

  const zIndiceslength = zIndices.length;
  const coefficients = arrayScratch;
  const highestNonZeroCoef = fillCoefficientList(
    coefficients,
    zIndices,
    xTable,
    yTable,
    yStride,
    inputOrder
  );
  const reservedIndices = [];

  const tmp = (zIndiceslength * (zIndiceslength + 1)) / 2;
  const loopStop = Math.min(highestNonZeroCoef, outputOrder);
  for (let d = 0; d <= loopStop; d++) {
    for (i = d; i <= highestNonZeroCoef; i++) {
      reservedIndices.length = 0;
      const tempTerm = calculateCoefficientTerm(
        x,
        zIndices,
        xTable,
        d,
        i,
        reservedIndices
      );
      const dimTwo = Math.floor((i * (1 - i)) / 2) + zIndiceslength * i;

      for (let s = 0; s < yStride; s++) {
        const dimOne = Math.floor(s * tmp);
        const coef = coefficients[dimOne + dimTwo];
        result[s + d * yStride] += coef * tempTerm;
      }
    }
  }

  return result;
};

function fillCoefficientList(
  coefficients,
  zIndices,
  xTable,
  yTable,
  yStride,
  inputOrder
) {
  let j;
  let index;
  let highestNonZero = -1;
  const zIndiceslength = zIndices.length;
  const tmp = (zIndiceslength * (zIndiceslength + 1)) / 2;

  for (let s = 0; s < yStride; s++) {
    const dimOne = Math.floor(s * tmp);

    for (j = 0; j < zIndiceslength; j++) {
      index = zIndices[j] * yStride * (inputOrder + 1) + s;
      coefficients[dimOne + j] = yTable[index];
    }

    for (let i = 1; i < zIndiceslength; i++) {
      let coefIndex = 0;
      const dimTwo = Math.floor((i * (1 - i)) / 2) + zIndiceslength * i;
      let nonZeroCoefficients = false;

      for (j = 0; j < zIndiceslength - i; j++) {
        const zj = xTable[zIndices[j]];
        const zn = xTable[zIndices[j + i]];

        let numerator;
        let coefficient;
        if (zn - zj <= 0) {
          index = zIndices[j] * yStride * (inputOrder + 1) + yStride * i + s;
          numerator = yTable[index];
          coefficient = numerator / CesiumMath.factorial(i);
          coefficients[dimOne + dimTwo + coefIndex] = coefficient;
          coefIndex++;
        } else {
          const dimTwoMinusOne =
            Math.floor(((i - 1) * (2 - i)) / 2) + zIndiceslength * (i - 1);
          numerator =
            coefficients[dimOne + dimTwoMinusOne + j + 1] -
            coefficients[dimOne + dimTwoMinusOne + j];
          coefficient = numerator / (zn - zj);
          coefficients[dimOne + dimTwo + coefIndex] = coefficient;
          coefIndex++;
        }
        nonZeroCoefficients = nonZeroCoefficients || numerator !== 0.0;
      }

      if (nonZeroCoefficients) {
        highestNonZero = Math.max(highestNonZero, i);
      }
    }
  }

  return highestNonZero;
}
export default HermitePolynomialApproximation;

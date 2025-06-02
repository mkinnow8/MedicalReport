export const calculateBMI = (weight: number, height: number): number => {
  if (!weight || !height || isNaN(weight) || isNaN(height)) {
    console.error('Invalid input for BMI calculation:', {weight, height});
    return 0;
  }

  if (weight <= 0 || height <= 0) {
    console.error('Weight and height must be positive numbers:', {
      weight,
      height,
    });
    return 0;
  }

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  console.log('BMI Calculation:', {
    weight,
    height,
    heightInMeters,
    bmi,
  });

  return bmi;
};

export const getBMICategory = (bmi: number): string => {
  if (isNaN(bmi) || bmi <= 0) {
    return 'Invalid BMI';
  }

  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

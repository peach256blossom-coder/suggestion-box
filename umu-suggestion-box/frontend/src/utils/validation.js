// Email validation for UMU
export const validateUMUEmail = (email) => {
  const umuEmailPattern = /^[a-zA-Z0-9._%+-]+@stud\.umu\.ac\.ug$/;
  return umuEmailPattern.test(email);
};

// Password validation
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Get email error message
export const getEmailErrorMessage = (email) => {
  if (!email) {
    return 'Email is required';
  }
  if (!email.includes('@')) {
    return 'Please enter a valid email';
  }
  if (!email.endsWith('@stud.umu.ac.ug')) {
    return 'Email must be from UMU campus (@stud.umu.ac.ug)';
  }
  return '';
};
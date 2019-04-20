const validateEmail = (email, errorMessage) => {
  //   eslint-disable-next-line
  let emailPatternReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailPatternReg.test(email)) {
    errorMessage += "Please enter a valid email\n";
  }
  return errorMessage;
};

export { validateEmail };

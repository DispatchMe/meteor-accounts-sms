/**
 * Login with a phone number and verification code.
 * @param phone The phone number.
 * @param code The verification code.
 * @param [callback]
 */
Meteor.loginWithSms = function (phone, code, callback) {
  Accounts.callLoginMethod({
    methodArguments: [{
      phone: phone,
      code: code
    }],
    userCallback: callback
  });
};

/**
 * Request a verification code.
 * @param phone The phone number to verify.
 * @param [callback]
 */
Meteor.sendVerificationCode = function (phone, callback) {
  Meteor.call('accounts-sms.sendVerificationCode', phone, callback);
};

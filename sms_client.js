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
 * Lookup phone number information through twilio lookups api.
 * @param phone
 * @param [callback]
 */
Meteor.lookup = function (phone, callback) {
  Meteor.call('accounts-sms.lookup', phone, callback);
};

/**
 * Request a verification code.
 * @param phone The phone number to verify.
 * @param [callback]
 */
Meteor.sendVerificationCode = function (phone, callback) {
  Meteor.call('accounts-sms.sendVerificationCode', phone, callback);
};

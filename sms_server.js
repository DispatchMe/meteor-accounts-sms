var sms = Accounts.sms;

sms.lookup = function () {
  throw new Error('Accounts sms has not been configured yet.');
};

sms.sendVerificationCode = function () {
  throw new Error('Accounts sms has not been configured yet.');
};

sms.verifyCode = function () {
  throw new Error('Accounts sms has not been configured yet.');
};

/**
 * You can set the twilio from, sid and key and this
 * will handle sending and verifying sms with twilio.
 * Or you can configure sendVerificationSms and verifySms helpers manually.
 * @param options
 * @param [options.twilio]
 * @param {String} options.twilio.from The phone number to send sms from.
 * @param {String} options.twilio.sid The twilio sid to use to send sms.
 * @param {String} options.twilio.token The twilio token to use to send sms.
 * @param {Function} [options.sendVerificationCode] (phone)
 * Given a phone number, send a verification code.
 * @param {Function} [options.verifyCode] (phone, code)
 * Given a phone number and verification code return the { userId: '' }
 * to log that user in or throw an error.
 */
Accounts.sms.configure = function (options) {
  check(options, Match.OneOf(
    {
      twilio: { from: String, sid: String, token: String }
    }, {
      sendDownloadLink: MatchEx.Function(),
      sendVerificationCode: MatchEx.Function(),
      verifyCode: MatchEx.Function()
    }
  ));

  if (options.twilio) {
    sms.twilio.configure(options.twilio);

    sms.lookup = sms.twilio.lookup;
    sms.sendVerificationCode = sms.twilio.sendVerificationCode;
    sms.verifyCode = sms.twilio.verifyCode;
  } else {
    sms.lookup = options.lookup;
    sms.sendVerificationCode = options.sendVerificationCode;
    sms.verifyCode = options.verifyCode;
  }
};

Meteor.methods({
  'accounts-sms.lookup': function (phone) {
    check(phone, String);

    return Accounts.sms.lookup(phone);
  },
  'accounts-sms.sendVerificationCode': function (phone) {
    check(phone, String);

    return Accounts.sms.sendVerificationCode(phone);
  }
});

// Handler to login with a phone number and code.
Accounts.registerLoginHandler('sms', function (options) {
  check(options, {
    phone: MatchEx.String(1),
    code: MatchEx.String(1)
  });

  return Accounts.sms.verifyCode(options.phone, options.code);
});

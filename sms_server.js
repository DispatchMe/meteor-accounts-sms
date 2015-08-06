var codes = new Mongo.Collection('meteor_accounts_sms');

Meteor.methods({
  'accounts-sms.sendVerificationCode': function (phone) {
    check(phone, String);
    return Accounts.sms.sendVerificationCode(phone);
  }
});

// Handler to login with a phone number and code.
Accounts.registerLoginHandler('sms', function (options) {
  if (!options.sms) return;

  check(options, {
    sms: Boolean,
    phone: MatchEx.String(1),
    code: MatchEx.String(1)
  });

  return Accounts.sms.verifyCode(options.phone, options.code);
});

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
      twilio: {
        from: String,
        sid: String,
        token: String
      },
      message: Match.Optional(String)
    }, {
      lookup: MatchEx.Function(),
      sendVerificationCode: MatchEx.Function(),
      verifyCode: MatchEx.Function()
    }
  ));

  if (options.twilio) {
    Accounts.sms.client = new Twilio(options.twilio);
  } else {
    Accounts.sms.lookup = options.lookup;
    Accounts.sms.sendVerificationCode = options.sendVerificationCode;
    Accounts.sms.verifyCode = options.verifyCode;
  }
  Accounts.sms.message = options.message || 'Your verification code is {{code}}';
};

/**
 * Send a 4 digit verification sms with twilio.
 * @param phone
 */
Accounts.sms.sendVerificationCode = function (phone, message) {
  if (!Accounts.sms.client) throw new Meteor.Error('accounts-sms has not been configured');

  var lookup = Accounts.sms.client.lookup(phone);
  if (lookup.carrier && lookup.carrier.type !== 'mobile') {
    throw new Meteor.Error('not a mobile number');
  }

  var code = (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000) + '';

  message = message || Accounts.sms.message;
  message = message.replace(/{{code}}/g, code);

  // Create user if does not exist
  var user = Meteor.users.findOne({ phone: phone });
  if (!user) {
    Meteor.users.insert({
      phone: phone,
      createdAt: new Date()
    });
  }

  // Clear out existing codes
  codes.remove({phone: phone});

  // Generate a new code.
  codes.insert({phone: phone, code: code});
  // console.log('sending sms.', phone, code);
  Accounts.sms.client.sendSMS({
    to: phone,
    body: message
  });
};

/**
 * Send a 4 digit verification sms with twilio.
 * @param phone
 * @param code
 */
Accounts.sms.verifyCode = function (phone, code) {
  var user = Meteor.users.findOne({ phone: phone });
  if (!user) throw new Meteor.Error('Invalid phone number');

  var validCode = codes.findOne({phone: phone, code: code});
  if (!validCode) throw new Meteor.Error('Invalid verification code');

  // Clear the verification code after a succesful login.
  codes.remove({phone: phone});
  return {userId: user._id};
};

var sms = Accounts.sms.twilio = {};

var Twilio = new Npm.require('Twilio');

/**
 * Configure the twilio sms client.
 * @param {String} options
 * @param {String} options.from The phone number to send sms from.
 * @param {String} options.sid The twilio sid to use to send sms.
 * @param {String} options.token The twilio token to use to send sms.
 */
sms.configure = function (options) {
  sms.client = new Twilio(options.sid, options.token);
  sms.from = options.from;
};

var codes = new Meteor.Collection('accounts-sms.codes');

/**
 * Send a 4 digit verification sms with twilio.
 * @param phone
 */
sms.sendVerificationCode = function (phone) {
  var code = Math.floor(Random.fraction() * 10000) + '';

  // Clear out existing codes
  codes.remove({phone: phone});

  // Generate a new code.
  codes.insert({phone: phone, code: code});

  sms.client.sendMessage({
    to: phone,
    from: sms.from,
    body: 'Your verification code is ' + code
  }, function (error) {
    // TODO handle errors better
    if (error) throw error;
  });
};

/**
 * Send a 4 digit verification sms with twilio.
 * @param phone
 * @param code
 */
sms.verifyCode = function (phone, code) {
  var user = Meteor.users.findOne({phone: phone});
  if (!user) throw new Meteor.Error('Invalid phone number');

  var validCode = !!codes.findOne({phone: phone, code: code});
  if (validCode) {
    // Clear the verification code after a succesful login.
    codes.remove({phone: phone});
    return {userId: user._id};
  }

  throw new Meteor.Error('Invalid verification code');
};

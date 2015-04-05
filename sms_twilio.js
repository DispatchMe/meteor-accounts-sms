var sms = Accounts.sms.twilio = {};

var Twilio = new Npm.require('twilio');

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

var lookups = new Meteor.Collection('meteor_accounts_sms_lookups');

/**
 * Lookup phone number information through twilio lookups api.
 * @param phone
 */
sms.lookup = function (phone) {
  var lookup = lookups.findOne({ phone_number: { $regex: phone }});

  if (lookup) return lookup;

  // XXX Use twilio lookups node library
  var response = HTTP.call('GET', 'https://lookups.twilio.com/v1/PhoneNumbers/' + phone, {
    auth: Meteor.settings.TWILIO.SID + ':' + Meteor.settings.TWILIO.TOKEN,
    params: {
      Type: 'carrier'
    }
  });

  check(response.data, {
    country_code: String,
    phone_number: String,
    national_format: String,
    url: String,
    carrier: Object
  });

  lookups.insert(_.extend(response.data, { timestamp: new Date() }));

  return response.data;
};

var codes = new Meteor.Collection('meteor_accounts_sms');

/**
 * Send a 4 digit verification sms with twilio.
 * @param phone
 */
sms.sendVerificationCode = function (phone) {
  var lookup = sms.lookup(phone);

  if (lookup.carrier.type !== 'mobile') throw new Meteor.Error('Not a mobile number');

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

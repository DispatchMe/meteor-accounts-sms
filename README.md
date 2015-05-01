accounts-sms
=============
Allow users to login with their phone number.

##Usage

`meteor add dispatch:accounts-sms`

**Server**

```
// Configure to use twilio.
Accounts.sms.configure({
  twilio: {
    from: Meteor.settings.TWILIO.FROM,
    sid: Meteor.settings.TWILIO.SID,
    token: Meteor.settings.TWILIO.TOKEN
  }
});
```

**Client**

```
// Send the verification code sms.
Meteor.sendVerificationCode('+12222222222');
```

```
// Login with the verification code sms.
Meteor.loginWithSms('+12222222222', '2222');
```

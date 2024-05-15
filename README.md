=== AUTH ===

Registration
>> No duplicate Email Address in Each App Name
>> Email Address validation (Correct format)
>> Password validation (Password must be at least 16-25 characters long, include a number, uppercase and lowercase letter)
>> Force change password set to "90days"
>> Account Saving
>> Password History Saving

Enable 2FA
>> Will return QR code

Login
>> Checks if account is active/deactivated
>> Checks if user is registered as "Mobile Only", can only login in mobile if was set to true
>> Locks the account if the user entered an incorrect password 3x (implemented using IO.Redis, not saved in database)
>> Checks if the password is expired, will ask the user for a new password
>> Will ask to redirect to Verify 2FA 

Verify 2FA
>> Implemented using Google Authenticator
>> Will ask the user to enter the token generated in Google Authenticator app
>> Can now proceed to Home page if above token is correct

Logout 
>> will clear data site cookies
>> Access token will be added to Blacklist table


=== Account ===

Reset Password
>> Will email the user for the OTP

Check OTP
>> The user must enter the OTP within 15mins
>> Will ask to redirect to /changePassword if the entered OTP is correct

Change Password
>> Checks if the current password is correct
>> Last 3 password cannot be used
>> Password validation (Password must be at least 16-25 characters long, include a number, uppercase and lowercase letter)
>> Force change password reset to "90days"
>> Update the account password
>> Password History Saving


=== ADMIN ===

Check Accounts
>> Display all accounts with entered incorrect password

Unlock Account
>> Will ask the admin to enter the email address of the locked account (id)

List Account
>> Display all the account details
>> Can filter name, email address and active accounts

Update Account
>> Update account details

Delete Account
>> Delete account details, all records connected to this account will be removed 

Deactivate Account 
>> Sets the account isActive to false

Assign Role Permission
>> Assign a role and permissions to user

List Role Permission
>> Display the user roles and corresponding permissions



TODO: Upon login, logout the last login user session

SELECT token FROM ls_refresh_token 
  WHERE isActive = 1 and accountId = 10;

 UPDATE ls_refresh_token SET isActive = 0 WHERE isActive = 1 and accountId = ?; 
 
 INSERT INTO ls_blacklist (token) VALUES(yy);

SELECT * FROM ls_blacklist;
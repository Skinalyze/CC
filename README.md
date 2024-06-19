# `Skinalyze : Personalized skin care recommendations`
> Team : `C241-PS385`
> <br>
> Project for: `Capstone Project Bangkit Academy 2024 H1`
## Objective
* 📱 Develop a mobile application (Android) for personalized skincare recommendations.
* 💡 Design a recommendation system that goes beyond skin type identification. This system will offer personalized skincare product packages tailored to individual skin concerns.
* 😌 Simplify the skincare product selection process for users. This will be achieved by providing a user-centric application with clear and actionable recommendations.
* ♻️ Reduce product waste in the skincare industry. This will be achieved by recommending effective product packages that directly address users' specific needs.
<br>
## Cloud Computing Task
In skinalyze the cloud computing team is task to create API's, database, and also deploy both database and API's so it can be used by the mobile application to then be used to store and fetch the data

## API's
### Register
In register.js API will get 5 fields from body :
* name
* email
* password
* gender
* age
if one of the fields is null the API will return "Terdapat Field yang kosong!" and if the email is already on the database the API will return "Email sudah terdaftar."
<br>
if all the fields are filled and the email is not on the database the API will post the field into the database with encrypted password and encoded gender ( male = 1, female = 0). API will also return "User berhasil dibuat."
![image](https://github.com/Skinalyze/CC/assets/118964889/0a3ff618-43fe-45da-83ce-b20c410b70fd)







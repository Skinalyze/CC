# `Skinalyze : Personalized skin care recommendations`
> Team : `C241-PS385`
> <br>
> Project for: `Capstone Project Bangkit Academy 2024 H1`

[Objective](#objective) | [Cloud Computing Task](#cloud-computing-task) | [API's](#apis)
:---: | :---: | :---:
## Objective
* 📱 Develop a mobile application (Android) for personalized skincare recommendations.
* 💡 Design a recommendation system that goes beyond skin type identification. This system will offer personalized skincare product packages tailored to individual skin concerns.
* 😌 Simplify the skincare product selection process for users. This will be achieved by providing a user-centric application with clear and actionable recommendations.
* ♻️ Reduce product waste in the skincare industry. This will be achieved by recommending effective product packages that directly address users' specific needs.

## Cloud Computing Task
In skinalyze the cloud computing team is task to create API's, database, and also deploy both database and API's so it can be used by the mobile application to then be used to store and fetch the data

## Database Architecture
![skinalyze-Final drawio (1)](https://github.com/Skinalyze/CC/assets/93993894/9681b409-c020-4482-9666-749133934f4f)


## API's
### Register
In register.js API will get 5 fields from body :
* name
* email
* password
* gender
* age
<br>
If one of the fields is null the API will return "Terdapat Field yang kosong!" and if the email is already on the database the API will return "Email sudah terdaftar."
<br>
If all the fields are filled and the email is not on the database the API will post the field into the database with encrypted password and encoded gender ( male = 1, female = 0). API will also return "User berhasil dibuat."
<br>
<br>
![image42](https://github.com/Skinalyze/CC/assets/118964889/6cd72190-d2b6-48b0-9dac-732cf71099f0)

### Login
In login.js API will get 2 fields from body:
* email
* password
If one of the fields is null the API will return "Terdapat Field yang kosong!" and if one of the fields don't match any of the data in the database API will return the invalid message. API will check the password by encypting the input and match it with the encpyted password in the database
<br>
if everything is correct API will return "Login successfully.", user id, access token, and refresh token.
<br>
<br>
![image](https://github.com/Skinalyze/CC/assets/118964889/fdbd9ed4-7f89-49fa-8925-1d764c017991)

### Refresh token
This API refreshes access tokens that are only valid for one hour, ensuring users remain continuously logged into our application without interruption. The main purpose of this API is to maintain user convenience by automatically extending their login sessions, while ensuring their data's security is properly maintained. This way, users do not need to re-enter their credentials frequently, improving the user experience while minimizing security risks to their sensitive data.
![image](https://github.com/Skinalyze/CC/assets/93993894/9f4504d4-24fe-4a5c-8808-cfea72f64468)


### Profil
This API is designed to retrieve user data from the user table in the database using the id_user obtained from the existing access token. Once accessed, this API will return several important attributes of the user, including name, email, gender, age, skin type, and skin sensitivity level.
![image](https://github.com/Skinalyze/CC/assets/93993894/4c4af124-1688-4ab9-8a5f-116062dc3583)


### Search Proruct
In search.js API will get a product_name field from body
<br>
Before the API returns the search result, the API will first check whether the user has logged in or not if the user hasn't log in the API will return "Diperlukan Login untuk mengakses laman ini" and if the product_name is null API will return "Bad Request: product_name is required".
<br>
when the product_name field is filled, the API will split the input with " " as the seperator then joined them with 'AND'. after the input joined together the API will search based on the conditions and return the product that matches.
<br>
<br>
![image](https://github.com/Skinalyze/CC/assets/118964889/1fe21dde-f74f-498a-af29-9e1206f557ac)

### Detail Product
In search-detail.js API will get id_skin_care field from parameter.
<br>
Before the API returns the details, the API will first check whether the user has logged in or not if the user hasn't log in the API will return "Diperlukan Login untuk mengakses laman ini" and if the product_name is null API will return "Bad Request: product_name is required".
<br>
when the id_skin_care field is filled, the API will run queris where it will returns all the attribute that the is_skin_care have.
<br>
<br>
![image](https://github.com/Skinalyze/CC/assets/118964889/e1bbae61-3aa3-41ab-b61a-f6c3341e9ee5)

### Delete Recommendation
in rekomendasi-delete.js API will get a id_rekomendasi field from body
<br>
Before the API delete the recommendation, the API will first check whether the user has logged in or not if the user hasn't log in the API will return "Diperlukan Login untuk mengakses laman ini" and if the product_name is null API will return "Tidak ada rekomendasi".
<br>
when the id_rekomendasi field is filled, the API will run a delete query and will return "Berhasil menghapus rekomendasi!"
<br>
<br>
![image](https://github.com/Skinalyze/CC/assets/118964889/7d59ccde-64e4-4446-93e0-6df180f01d67)


## Cloud Architectur
![Untitled (1)](https://github.com/Skinalyze/CC/assets/93993894/8e4b50b9-c8f3-4a68-b2d6-40c00cb99910)

### Cloud Run
Cloud Run is used to support the API deployment process, managing data retrieval and storage in the database. Using Cloud Run allows the API to run serverless, meaning we don't need to worry about server or infrastructure management. Cloud Run enables applications to scale automatically based on demand, ensuring optimal performance and efficient handling of user requests.

### Cloud SQL
In the Skinalyze application, Cloud SQL is used to store user data and application data. The type of SQL used in this application is MySQL. Cloud SQL is a managed database service that offers reliability, security, and high performance without the need to manage your own infrastructure. Cloud SQL helps ensure that user and application data is stored securely and can be accessed quickly.

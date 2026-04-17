# Welcome to..

<img width="899" height="277" alt="SecureEventLogo" src="https://github.com/user-attachments/assets/1b439a50-83c6-4c78-9e1a-c8f6667a44fe" />

With SecurEvents ***Secure comes first***.

About SecurEvents
-
The SecurEvents application is designed to solve **security issues commonly found in event booking and management systems** like:

    🔓 Weak authentication
    
    🔓 Broken access control
    
    🔓 Insecure Data Handling
    
Our app aims to address these common vulnerabilities and offer a **secure solution**

The app allows users to:
  - Sign up and log in using email verification codes 
  - Browse and search for events 
  - Book tickets and complete payments 
  - View and manage their tickets 
  - Create and manage events (organizers) 
  - Allow admins to approve events and manage users / tickets

For more information about the design process, security evaluations and solutions check out our presentation [here!](https://stuconestogacon-my.sharepoint.com/:p:/g/personal/jjakob3896_conestogac_on_ca/IQAfmjKkqyvdRrzKO56jDdtgAeB-0hviBxuq6R08WYmvg5E?e=J7TroJ&nav=eyJzSWQiOjI1NiwiY0lkIjo0MDY3NTM5MDU2fQ)

How to Run SecurEvents
-
1. Clone this repository!
2. Navigate to the cloned folder and the [securevents](securevents/) directory inside of it
   
    <img width="707" height="273" alt="image" src="https://github.com/user-attachments/assets/93bdd996-5060-4a2b-b3ce-d0126fcf0a25" />

### Setting up the Backend
1. Inside of the [securevents](securevents/) directory open up the [Backend](securevents/Backend) folder
   
   <img width="650" height="210" alt="image" src="https://github.com/user-attachments/assets/1dfb42f4-f977-4f80-bd74-3b496cdb924c" />

2. Open the Backend.sln file in Visual Studio
   
   <img width="500" alt="image" src="https://github.com/user-attachments/assets/fc68b04a-fdce-4cc5-af6b-a1272d1c92be" />

3. Update the Server values for the SecureEventConnection in the appsettings.json files of [EventManagementService](securevents/Backend/EventManagementService/appsettings.json/), [LoggingService](securevents/Backend/LoggingService/appsettings.json/), and [UserManagementService](securevents/Backend/UserManagementService/appsettings.json/) to fit your SQL Server connection string.
   
   The connection string is currently set to: `"SecureEventConnection": "Server=localhost;Database=SecureEvent;Integrated Security=true;TrustServerCertificate=true;"`

   <img height="550" alt="image" src="https://github.com/user-attachments/assets/06d562c5-3a43-4267-bd68-b332195cc4e9" />


   
4. Next set up the start button to run all four microservices at the same time:
   
    a. Go to the start button and click the dropdown arrow
    
   <img width="800" alt="image" src="https://github.com/user-attachments/assets/48881bc4-10b5-4a38-8cd6-c99694bee48d" />

    b. Select "Configure Startup Projects" from the dropdown

   <img height="500" alt="image" src="https://github.com/user-attachments/assets/4e072807-6e31-40f9-8445-15ddc8d06e0e" />

    c. Configure the settings to be "Mulitple Startup Projects" and set all Project Actions to start

   <img width="800" alt="image" src="https://github.com/user-attachments/assets/6578f5f2-a4a5-41d4-9225-7d644dee522c" />

    d. Select "Ok" to save the changes

5. Press Start

   <img width="800" alt="image" src="https://github.com/user-attachments/assets/23b43b26-fc93-4bf5-9461-642807c9ca66" />

6. Now the backend is running! 4 consoles should appear - leave all of these console windows open!

   <img width="1918" height="987" alt="image" src="https://github.com/user-attachments/assets/4b24496b-d2de-460b-9c80-6f8b38b1d2f7" />


### Setting up the Frontend
1. Go back into the file explorer and navigate back into the [securevents](securevents/) directory

   <img width="707" height="273" alt="image" src="https://github.com/user-attachments/assets/93bdd996-5060-4a2b-b3ce-d0126fcf0a25" />
   
2. Open up the [Frontend](securevents/Frontend/) folder
   
   <img width="650" height="210" alt="image" src="https://github.com/user-attachments/assets/fa9d8867-49df-4580-968b-8a3cecfe4ec1" />

3. Inside of the [Frontend](securevents/Frontend/) folder open up the [securevents](securevents/Frontend/securevents/)

   <img width="700" alt="image" src="https://github.com/user-attachments/assets/04d77845-c852-466e-88c0-089e31ec42da" />

4. While inside of this folder click in the file path and type `cmd` and enter - this will open the command prompt
   
   <img width="856" height="308" alt="image" src="https://github.com/user-attachments/assets/eaabc4a9-def8-4526-a28c-bf266a6d5030" />

6. Inside of the command prompt type `npm install` and enter
7. Once that finishes executing type in `npm run build` and enter
8. Once that is finished executing type in `npm start` and enter - this will start up the application in your browser. The frontend is now running!


Additional Notes
-
- Real payments and email services have not yet been deployed - as such the OTP codes can be found highlighted in one of the backend consoles whenever you need to submit a code
  
- To test the admin features create an account for the email `admin@secureevents.com`

App Preview
-
Coming soon!


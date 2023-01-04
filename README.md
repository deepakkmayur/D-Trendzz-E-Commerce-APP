# D-trendz


## Table of contents
---
+ Introduction

+ Demo

+ Run 

+ Technology

+ Features

---

## Introduction

D-trendz is an E-commerce website for selling shoes which has both User
and Admin side.

## Demo

The application is deployed to AWS and can be accessed through the following link:

[D-trendz](https://)

---

## Run

To run this application, you have to set your own environmental variables. For security reasons, 
some variables have been hidden from view and used as environmental variables with the help of dotenv package. 
Below are the variables that you need to set in order to run the application:

RAZORPAY_ID=xxxxxxxxxxxxx
RAZORPAY_SECRET_KEY=xxxxxxxxxxxxxxx
NODEMAILER_API_KEY=xxxxxxxxxxxxxxxxxx
MAIL_PASSWORD='xxxxxxxxxxxxxx'
NODEMAILER_EMAIL=xxxxxxxxxx@gmail.com


After you've set these environmental variables in the .env file at the root of the project,
and intsall node modules using npm install

Now you can run npm start in the terminal and the application should work.

## Technology

This application is build using,

+ Node.js

+ Express

+ MongoDB

+ Bootstrap

+ Razorpay

+ AJAX

---

## Features

## User Side

+ Users can only purchase products after authentication
using email and password.

+ Users can regenerate password through email
verification.

+ Favourite items can be added to whishlist.

+ Multiple products can be purchased at a time.

+ Products can be added to cart.

+ Both online payment and COD are available for user.

+ Users can view history and cancel orders before
delivery.

+ Order status can be tracked by user.

+ User can apply discount coupon.

+ User can view and edit user profile.

## Admin Side

+ Admin can manage user and products.

+ Admin can collect data regarding users & products.

+ Graphical representation of data regarding users
and products.











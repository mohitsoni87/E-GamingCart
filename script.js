var express = require('express');
var app = express();

app.use(express.json());
var cors = require('cors');
app.use(cors());

const joi = require('joi');
status = 0        //to check active logins

//Offers Function

function checkOffers(price) {
    if(price >= 1500 && price < 2000){
        var tax = 0.18*price;
        var discountedprice = price - 0.15*price + tax;
        return  discountedprice
    }
    else if(price >= 2000){
        var tax = 0.18*price;
        var discountedprice = price - 0.2*price + tax;
        return discountedprice
    }
    
 } 

//database
Games = {'EA': ['Fifa 18', 'Cricket 17'],
        'Ubisoft': ['FarCry New Dawn', "Assassin's Creed Origins", "Assassin's Creed Syndicate", "Assassin's Creed II"]};

gameDetail = {'Fifa 18': [{'Price': 1800}, {'Studio': 'EA'}, {'Tax': 18}, {'Stock': 0}], 
              'Cricket 17': [{'Price': 800}, {'Studio': 'EA'}, {'Tax': 18}, {'Stock': 1}],
              'FarCry New Dawn': [{'Price': 2000}, {'Studio': 'Ubisoft'}, {'Tax': 18}, {'Stock': 2}],
              "Assassin's Creed Origins": [{'Price': 2200}, {'Studio': 'Ubisoft'}, {'Tax': 18}, {'Stock': 5}],
              "Assassin's Creed Syndicate": [{'Price': 1700}, {'Studio': 'Ubisoft'}, {'Tax': 18}, {'Stock': 1}],
              "Assassin's Creed II": [{'Price': 900}, {'Studio': 'Ubisoft'}, {'Tax': 18}, {'Stock': 3}],
            }


var Cart = {}
var CartValue = {}
User = {}
var Users = {}
var enrolled = {}
var Order = {}


//Registration MiddleWare  
app.use('/registeruser', function(req, res, next){
    console.log('re');
    User = req.query;
    if(User.Username in Users){
       res.json("Username already exists.");     // Handling Validations 
    }
    else{
 
       //JOI VALIDATION
       const schema = {
        Username: joi.string().min(5).max(9).required(),        //Username should be in-between [5, 7]
       }
 
       const result = joi.validate({'Username': req.query.Username}, schema);
       
       if (result.error != null && result.error.details[0].message) {
          res.status(400).send(result.error.details[0].message);
          return;
      }
       else{
          Users[req.query.Username] = req.query.Password;
          status = 1;
          next();
       }
    }
 
 }  
 );
 


 //Login MiddleWare     

app.use('/login', function(req, res, next){

    if(req.query.Username in Users){
       if( Users[req.query.Username] == req.query.Password){
          status = 1;
          User = req.query;
          res.redirect('/');
          next();
          
       }
       else{
          res.json("Invalid Credentials.");         //  Handling Validations 
       }
 
 }
 else{
    res.json(req.query.Username.toString() + " username doesn't exist.");    //  Handling Validations 
 }
 
 })
 

//Registration
app.post('/registeruser', function(req, res){
    User = req.query;
    res.json("Successfully registered!");
 });

//Login 
app.get('/login', function(req, res){
    
 });
 

//Logout
app.get('/logout', function(req, res){

    if(!status){
        res.json("You are not logged in!");
    }
    else{
        status = 0;
        User = {}
        console.log("logged off!");
        res.redirect("/");
    }

 });
 



 app.get('/url', function(req, res){
    res.json("Welcome to E-Kart!");
 });

//Homepage
app.get('/', function(req, res){
    if(Object.keys(User).length >= 1){
        res.json("Hello! " + User.Username + ". Welcome to E-Kart!");
    }
    else{
        res.json("Welcome to E-Kart! Please log in to enjoy the services.");
    }
    
});

//get all available games
app.get('/getall', function(req, resp){
    resp.json(Games);

});

//Specific Game Detail
app.post('/gamedetail/', function(req, resp){
    
    resp.json(gameDetail[req.query.GameName]);
});

//Add to Cart
app.post('/addtoCart', function(req, resp){
    if(!status){
        resp.json("Please log in first.");  //if the user is not logged in.
    }   
    else{
        if(User.Username in Cart ){

            //Checking the stock
            console.log(gameDetail[(req.query.GameName)][3].Stock);
            if(gameDetail[(req.query.GameName)][3].Stock >= 1){
                Cart[User.Username].push(req.query.GameName);
                CartValue[User.Username] += gameDetail[(req.query.GameName)][0].Price;
                
            }
            else{
                resp.json("We're Sorry! " + req.query.GameName + " is currently not available. We have noted the product and will add it soon to the stock! Thank you!");
            }

            
        }
        else{
            Cart[User.Username] = [(req.query.GameName)];
            CartValue[User.Username] = gameDetail[(req.query.GameName)][0].Price;
        }
        resp.json("Successfully added " + req.query.GameName + '. Your Cart value including Tax is ₹' + (CartValue[User.Username] + 0.18*CartValue[User.Username]) + ".");
    }
});

//order Using Params ;

app.post('/order/:gameName', function(req, resp){
    var gameName = req.params.gameName;
    const name = gameName;
    var price = gameDetail[gameName][0].Price;
    if(gameDetail[gameName][3].Stock >= 1){
        gameDetail[gameName][3].Stock -= 1;
        var discountedprice = 0;
        var ogPrice = price + 0.18*price;       //with Tax

        //Some Offers
        //if value price is greater than 1500, 10%off on total value
        //if value price is greater than 2000, 15%off on total value

        if(price >= 1500){
            discountedprice = checkOffers(price).toString();
            var discount = (15).toString();
        }
        else if(price >= 2000){
            discountedprice = checkOffers(price).toString();
            var discount = (20).toString();
        }

        if(discount){
            resp.json("Congratulations!! Your have successfully ordered " + name + ". And you have earned a discount of " + discount + "%, your total amount with Tax is ₹" + ogPrice + ". With discount your total bill is ₹" +  discountedprice);
        }
        else{
            resp.json("Congratulations!! Your have successfully ordered " + name + ".");
        }
    }

    else{
        resp.json("We're Sorry! " + gameName + " is currently not available. We have noted the product and will add it soon to the stock! Thank you!");
    }
});


//Cart
app.get('/cart', function(req, resp){
    if(!status){
        resp.json("Please log in first.");  //if the user is not logged in.
    }
    else{
        if(User.Username in Cart){
                resp.json(Cart[User.Username] + '.Your Cart Value including Tax is ₹' + (CartValue[User.Username] + 0.18*CartValue[User.Username])+ ".");
        }
        else{
            resp.json("Your cart is empty."); 
        }
    }
});


//OrderCart
app.get('/orderCart', function(req, resp){
    if(!status){
        resp.json("Please log in first.");  //if the user is not logged in.
    }
    else{
        
        if(User.Username in Cart){
            const gameName = req.params.gameName;    
            var price = CartValue[User.Username];
            var discountedprice = 0;
            var ogPrice = price + 0.18*price;       //with Tax

            if(price >= 1500){
                discountedprice = checkOffers(price).toString();
                var discount = (15).toString();
            }
            else if(price >= 2000){
                discountedprice = checkOffers(price).toString();
                var discount = (20).toString();
            }
            if(discount){
                    resp.json("Congratulations!! Your Cart is successfully ordered. And you have earned a discount of " + discount + "%, your total amount with Tax is ₹" + ogPrice + ". With discount your total bill is ₹" +  discountedprice);
            }
            else{
                resp.json("Congratulations!!  Your Cart is successfully ordered.");
            }


        }
        else{
            resp.json("Your cart is empty."); 
        }
    }
});


app.listen(8080);
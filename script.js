var express = require('express');
var app = express();

app.use(express.json());
var cors = require('cors');
app.use(cors());
const joi = require('joi');



Category = {
    'Sports': ['Fifa 18', 'Cricket 17'],
    'Action': ['FarCry New Dawn', "Assassin's Creed Origins", "Assassin's Creed Origins", "Assassin's Creed Syndicate"],
    'Adventure': ['FarCry New Dawn', "Assassin's Creed Origins", "Assassin's Creed Origins", "Assassin's Creed Syndicate"]
}

Brand = {'EA': ['Fifa 18', 'Cricket 17'],
        'Ubisoft': ['FarCry New Dawn', "Assassin's Creed Origins", "Assassin's Creed Syndicate", "Assassin's Creed II", "Assassin's Creed II"],
        }



gameDetail = {'Fifa 18': [{'Price': 1800}, {'Creator': 'EA'}, {'Tax': 18}], 
        'Cricket 17': [{'Price': 800}, {'Creator': 'EA'}, {'Tax': 18}],
        'FarCry New Dawn': [{'Price': 2000}, {'Creator': 'Ubisoft'}, {'Tax': 18}],
        "Assassin's Creed Origins": [{'Price': 2200}, {'Creator': 'Ubisoft'}, {'Tax': 18}],
        "Assassin's Creed Syndicate": [{'Price': 1700}, {'Creator': 'Ubisoft'}, {'Tax': 18}],
        "Assassin's Creed II": [{'Price': 900}, {'Creator': 'Ubisoft'}, {'Tax': 18}],
      }
  
//Add GameDetail
function AddToGameDetail(gameName, Price, Creator){
    gameDetail[gameName] = [{'Price': Price}, {'Creator': Creator}, {'Tax': 18}]
} 


//Add game into studio object

function AddToBrand(brand, gameName){
    if(brand in Brand){
        Brand[brand].push(gameName);
    }
    else{
        Brand[brand] = [gameName];
    }
} 


//Deleting Game from Category
function deleteFromCategory(gameName){
    Object.keys(Category).forEach(key => {
        console.log(key)
        var value = Category[key];
        var i = 0;
        for(i = 0; i < value.length; i++){
            console.log(value[i]);
            if(value[i] == gameName){
                Category[key].splice(i, 1);
                console.log("break");
                break;
            }
        }
      });  
} 


//Deleting Game Array from Category
function deleteArrayFromCategory(gameName){
    var j = 0;
    for(j = 0; j < gameName.length; j++){
        Object.keys(Category).forEach(key => {
            console.log(key)
            var value = Category[key];
            var i = 0;
            for(i = 0; i < value.length; i++){
                console.log(value[i]);
                if(value[i] == gameName[j]){
                    Category[key].splice(i, 1);
                    break;
                }
            }
          });
    }
  
} 

function deleteFromBrand(gameName, creator){
    var check = Brand[creator];
    var i = 0;
    for(i = 0; i < check.length; i++){
        if(check[i] == gameName){
            Brand[creator].splice(i, 1);
            console.log("break");
            break;
        }
    }
}




//CATEGORY

app.get('/category', function(req, res){
    var name = req.query;
    if(Object.keys(name).length >= 1){
        if(name.CategoryName in Category){
            res.json(Category[name.CategoryName]);
        }
        else{
            
        }
    }
    else{
        res.json(Category);
    }
    
});


//ADD CATEGORY

app.post('/addcategory', function(req, res){
    var category = req.query;

    if(Object.keys(category).length == 1){
        Category[category.CategoryName] = [];
    }
    else{
        Category[category.CategoryName] = [req.query.ProductName];

        //For Brand
        brand = req.query.Creator;
        var gameName = req.query.ProductName;
        AddToBrand(brand, gameName)

        //For GameDetail
        if(!(gameName in gameDetail)){
            AddToGameDetail(gameName, req.query.Price, req.query.Creator)
        }
    }
    
    res.json(Category);
    
});


app.delete('/deleteCategory', function(req, res){
    var name = req.query.GameName;
    if(name in Category){
        delete(Category[name]);
        res.json(Category);
    }
    else{
        res.json({});
    }
    
});

app.get('/getall', function(req, res){
    res.json(gameDetail);
});

app.post('/productdescription', function(req, res){
    var gameName = req.query.GameName ;
    if(gameName in gameDetail){
        res.json(gameDetail[gameName]);
    }
    else{
        res.json({});
    }
    
    
});


app.post('/addProduct', function(req, res){
    gameName = req.query.ProductName;
    creator = req.query.Creator;
    category = req.query.Category;

    //Updating Category
    if(category in Category){
        Category[category].push(gameName);
    }
    else{
        Category[category] = [gameName];
    }

    //Updating Brand
    if(creator in Brand){
        Brand[creator].push(gameName);
    }
    else{
        Brand[creator] = [gameName];
    }
    //Updating gamedetail
    if(!(gameName in gameDetail)){
        gameDetail[gameName] = [{'Price': req.query.Price}, {'Creator': creator}, {'Tax': 18}]
    }
    res.json(gameDetail);
});

app.put('/modifyproduct', function(req, res){
    var gameName = req.query.productName;
    var creator = req.query.Creator

    //updating Creator 
    if(gameDetail[gameName][1].Creator != creator){
        var old = gameDetail[gameName][1].Creator;
        gameDetail[gameName][1].Creator = creator;

        deleteFromBrand(gameName, old);

        if(creator in Brand){
            Brand[creator].push(gameName);
        }
        else{
            Brand[creator] = (gameName);

        }
        //updating Category
        deleteFromCategory(gameName);
        var newCat = req.query.CategoryName;
        console.log(newCat);
        if(newCat in Category){
            Category[newCat].push(gameName);
        }
        else{
            Category[newCat] = [gameName];
        }

        //updating Price
        gameDetail[gameName][0].Price = req.query.Price ;
    }
    
    res.json(gameDetail);


    //updating 
});

app.delete('/deleteProduct', function(req, res){
    var gameName = req.query.ProductName ;
    console.log(gameDetail[gameName]);
    var creator = gameDetail[gameName][1].Creator;
    delete(gameDetail[gameName]);
    //Deleting From Brand
    deleteFromBrand(gameName, creator)
    //Deleting from Category
    deleteFromCategory(gameName);
    res.json(gameDetail);
});






app.get('/brand', function(req, res){
    var name = req.query;
    if(Object.keys(name).length >= 1){
        res.json(Brand[name.brandName]);
    }
    else{
        res.json(Brand);
    }
});

//Add Brand
app.post('/addBrand', function(req, res){
    var name = req.query;
    
    if(Object.keys(name).length == 1){
        Brand[name.brandName] = [];
    }
    else{
        var gameName = req.query.ProductName;
        Brand[name.brandName] = [req.query.ProductName];
    
        //For GameDetail
        if(!(gameName in gameDetail)){
            AddToGameDetail(gameName, req.query.Price, req.query.brandName)
        }

        //For Category
        var category = req.query.CategoryName;

        if(category in Category){
            Category[category].push(gameName);
        }
        else{
            Category[category] = [gameName];
        }
    }
    res.json(Brand);
});

app.delete('/deleteBrand', function(req, res){
    var check = Brand[req.query.brandName];
    delete(Brand[req.query.brandName]);
    //Deleting from gameDetail
    var i = 0;
    for(i = 0; i < check.length; i++){
        if(check[i] in gameDetail){
            delete(gameDetail[check[i]]);
        }
    }
    //Deleting from Category
    deleteArrayFromCategory(check);
    res.json(Brand);
});

app.listen(8080);
